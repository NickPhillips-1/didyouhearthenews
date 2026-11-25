package com.newsrater.service;

import com.newsrater.dto.CreateStoryRequest;
import com.newsrater.dto.StoryDto;
import com.newsrater.dto.StorySummaryDto;
import com.newsrater.model.Article;
import com.newsrater.model.Outlet;
import com.newsrater.model.Story;
import com.newsrater.repository.StoryRepository;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Orchestrates creating, listing, and reading stories. */
@Service
public class StoryService {

    private final StoryRepository stories;
    private final ArticleFetchService fetchService;
    private final OutletMatcher outletMatcher;
    private final Summarizer summarizer;
    private final BiasDistributionService distributionService;

    public StoryService(StoryRepository stories,
                        ArticleFetchService fetchService,
                        OutletMatcher outletMatcher,
                        Summarizer summarizer,
                        BiasDistributionService distributionService) {
        this.stories = stories;
        this.fetchService = fetchService;
        this.outletMatcher = outletMatcher;
        this.summarizer = summarizer;
        this.distributionService = distributionService;
    }

    @Transactional
    public StoryDto create(CreateStoryRequest request) {
        List<String> urls = normalizeUrls(request.urls());
        if (urls.isEmpty()) {
            throw new IllegalArgumentException("At least one valid URL is required");
        }

        Story story = new Story(deriveTitle(request.title()), Story.Origin.MANUAL);

        for (String url : urls) {
            Article article = buildArticle(url);
            story.addArticle(article);
        }

        // Title: fall back to the first successfully fetched headline.
        if (isBlank(request.title())) {
            story.getArticles().stream()
                    .filter(a -> a.getFetchStatus() == Article.FetchStatus.OK && !isBlank(a.getTitle()))
                    .findFirst()
                    .ifPresent(a -> story.setTitle(a.getTitle()));
        }

        story.setSummary(summarizer.summarize(story.getTitle(), story.getArticles()));

        Story saved = stories.save(story);
        return StoryDto.from(saved, distributionService.compute(saved.getArticles()));
    }

    @Transactional(readOnly = true)
    public List<StorySummaryDto> list() {
        return stories.findAllByOrderByCreatedAtDesc().stream()
                .map(s -> StorySummaryDto.from(
                        s,
                        distributionService.compute(s.getArticles()),
                        pickLeadImageUrl(s.getArticles())))
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<StoryDto> get(Long id) {
        return stories.findById(id)
                .map(s -> StoryDto.from(s, distributionService.compute(s.getArticles())));
    }

    private Article buildArticle(String url) {
        String domain = Optional.ofNullable(DomainUtil.registrableDomain(url)).orElse(url);
        Article article = new Article(url, domain);

        outletMatcher.match(url).ifPresent(article::setOutlet);

        ArticleFetchService.FetchResult result = fetchService.fetch(url);
        if (result.ok()) {
            article.setFetchStatus(Article.FetchStatus.OK);
            article.setTitle(result.title());
            article.setExcerpt(result.excerpt());
            article.setImageUrl(result.imageUrl());
            article.setPublishedAt(result.publishedAt());
        } else {
            article.setFetchStatus(Article.FetchStatus.FAILED);
            article.setFetchError(result.error());
            // Keep a readable title even when extraction failed.
            Outlet outlet = article.getOutlet();
            article.setTitle(outlet != null ? outlet.getName() + " \u2013 " + domain : domain);
        }
        return article;
    }

    /** Split newlines, trim, keep http(s) only, de-duplicate preserving order. */
    private List<String> normalizeUrls(List<String> raw) {
        if (raw == null) {
            return List.of();
        }
        LinkedHashSet<String> seen = new LinkedHashSet<>();
        List<String> result = new ArrayList<>();
        for (String entry : raw) {
            if (entry == null) {
                continue;
            }
            for (String part : entry.split("\\r?\\n")) {
                String url = part.trim();
                if (url.isEmpty()) {
                    continue;
                }
                if (!url.matches("(?i)^https?://.*")) {
                    url = "https://" + url;
                }
                if (seen.add(url)) {
                    result.add(url);
                }
            }
        }
        return result;
    }

    /**
     * First successfully fetched, non-generic photo in story order
     * ({@code @OrderBy("id ASC")}). Null when every article lacks a real image.
     */
    private static String pickLeadImageUrl(List<Article> articles) {
        if (articles == null) {
            return null;
        }
        for (Article article : articles) {
            if (article.getFetchStatus() != Article.FetchStatus.OK) {
                continue;
            }
            String imageUrl = article.getImageUrl();
            if (isBlank(imageUrl) || ArticleFetchService.isGenericImage(imageUrl)) {
                continue;
            }
            return imageUrl;
        }
        return null;
    }

    private String deriveTitle(String title) {
        return isBlank(title) ? "Untitled story" : title.trim();
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}

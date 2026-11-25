package com.newsrater.service;

import com.newsrater.config.FeatureFlags;
import com.newsrater.model.Article;
import com.newsrater.repository.ArticleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Stories saved before lead images were stored have a null image URL. Fill
 * those in once the app is up so existing cards show a photo without a re-paste.
 */
@Component
public class ArticleImageBackfill {

    private static final Logger log = LoggerFactory.getLogger(ArticleImageBackfill.class);

    private final ArticleRepository articles;
    private final ArticleFetchService fetchService;
    private final FeatureFlags flags;

    public ArticleImageBackfill(ArticleRepository articles, ArticleFetchService fetchService, FeatureFlags flags) {
        this.articles = articles;
        this.fetchService = fetchService;
        this.flags = flags;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void fillMissingImages() {
        if (!flags.isImageBackfill()) {
            log.info("story.image-backfill skipped");
            return;
        }
        for (Article article : articles.findAll()) {
            boolean missing = article.getImageUrl() == null;
            boolean generic = ArticleFetchService.isGenericImage(article.getImageUrl());
            if (article.getFetchStatus() != Article.FetchStatus.OK || (!missing && !generic)) {
                continue;
            }
            ArticleFetchService.FetchResult result = fetchService.fetch(article.getUrl());
            if (result.ok() && result.imageUrl() != null) {
                article.setImageUrl(result.imageUrl());
                log.info("Stored lead image for {}", article.getDomain());
            }
        }
    }
}

package com.newsrater.dto;

import com.newsrater.model.Story;
import java.time.Instant;
import java.util.List;

/** Full story with its articles and the bias distribution. */
public record StoryDto(
        Long id,
        String title,
        String summary,
        String origin,
        Instant createdAt,
        BiasDistributionDto distribution,
        List<ArticleDto> articles
) {
    public static StoryDto from(Story story, BiasDistributionDto distribution) {
        List<ArticleDto> articles = story.getArticles().stream()
                .map(ArticleDto::from)
                .toList();
        return new StoryDto(
                story.getId(),
                story.getTitle(),
                story.getSummary(),
                story.getOrigin().name(),
                story.getCreatedAt(),
                distribution,
                articles
        );
    }
}

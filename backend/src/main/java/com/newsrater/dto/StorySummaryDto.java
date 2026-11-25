package com.newsrater.dto;

import com.newsrater.model.Story;
import java.time.Instant;

/** Lightweight story row for the home list. */
public record StorySummaryDto(
        Long id,
        String title,
        Instant createdAt,
        int articleCount,
        BiasDistributionDto distribution,
        String imageUrl
) {
    public static StorySummaryDto from(Story story, BiasDistributionDto distribution, String imageUrl) {
        return new StorySummaryDto(
                story.getId(),
                story.getTitle(),
                story.getCreatedAt(),
                story.getArticles().size(),
                distribution,
                imageUrl
        );
    }
}

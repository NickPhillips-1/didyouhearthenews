package com.newsrater.dto;

import com.newsrater.model.Article;
import java.time.Instant;

/** Article as sent to the client. */
public record ArticleDto(
        Long id,
        String url,
        String domain,
        String title,
        String excerpt,
        String imageUrl,
        Instant publishedAt,
        String outletName,
        String bias,
        String biasLabel,
        String fetchStatus,
        String fetchError
) {
    public static ArticleDto from(Article a) {
        String outletName = a.getOutlet() != null ? a.getOutlet().getName() : a.getDomain();
        return new ArticleDto(
                a.getId(),
                a.getUrl(),
                a.getDomain(),
                a.getTitle(),
                a.getExcerpt(),
                a.getImageUrl(),
                a.getPublishedAt(),
                outletName,
                a.bias().name(),
                a.bias().label(),
                a.getFetchStatus().name(),
                a.getFetchError()
        );
    }
}

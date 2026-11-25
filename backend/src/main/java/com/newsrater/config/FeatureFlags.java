package com.newsrater.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Switches that limit startup work and the public API document.
 * Canary sets both off in {@code application-canary.properties}.
 */
@Component
@ConfigurationProperties(prefix = "news-rater.flags")
public class FeatureFlags {

    /** Refetch missing lead images once the process is up. */
    private boolean imageBackfill = true;

    /** Swagger UI and the OpenAPI document. */
    private boolean openApiUi = true;

    public boolean isImageBackfill() {
        return imageBackfill;
    }

    public void setImageBackfill(boolean imageBackfill) {
        this.imageBackfill = imageBackfill;
    }

    public boolean isOpenApiUi() {
        return openApiUi;
    }

    public void setOpenApiUi(boolean openApiUi) {
        this.openApiUi = openApiUi;
    }
}

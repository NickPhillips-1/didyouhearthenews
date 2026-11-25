package com.newsrater.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

/**
 * Request to build a story from article URLs. {@code urls} may be a JSON array
 * of strings; each entry may itself contain newline-separated URLs, which the
 * service splits.
 */
@Schema(description = "Article URLs about the same event. The server fetches each source and compares Left, Center, and Right coverage.")
public record CreateStoryRequest(
        @Schema(description = "Optional display title. Derived from the articles when omitted.", example = "City housing plan")
        String title,
        @NotEmpty(message = "At least one URL is required")
        @Schema(description = "Article URLs about the same event. An entry may also contain newline-separated URLs.")
        List<String> urls
) {
}

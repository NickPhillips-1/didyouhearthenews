package com.newsrater.service;

import com.newsrater.model.Article;
import java.util.List;

/**
 * Produces a short cross-coverage summary for a story's articles.
 *
 * This is the single seam an LLM implementation would replace later. Any
 * implementation reads bias from the outlet via {@link Article#bias()}; it does
 * not assign bias itself.
 */
public interface Summarizer {

    String summarize(String storyTitle, List<Article> articles);
}

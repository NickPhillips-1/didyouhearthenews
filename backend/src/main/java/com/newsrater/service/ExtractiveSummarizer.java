package com.newsrater.service;

import com.newsrater.model.Article;
import com.newsrater.model.Bias;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

/**
 * Builds a summary by pulling one lead sentence from each represented side
 * (Left, Center, Right), so the result reflects how coverage differs across the
 * spectrum. Requires no API key. Replaceable by an LLM {@link Summarizer}.
 */
@Service
public class ExtractiveSummarizer implements Summarizer {

    @Override
    public String summarize(String storyTitle, List<Article> articles) {
        Map<Bias.Side, Article> firstPerSide = new LinkedHashMap<>();
        for (Article a : articles) {
            if (a.getFetchStatus() != Article.FetchStatus.OK) {
                continue;
            }
            Bias.Side side = a.bias().side();
            if (side == null || isBlank(a.getExcerpt())) {
                continue;
            }
            firstPerSide.putIfAbsent(side, a);
        }

        List<String> lines = new ArrayList<>();
        for (Bias.Side side : List.of(Bias.Side.LEFT, Bias.Side.CENTER, Bias.Side.RIGHT)) {
            Article a = firstPerSide.get(side);
            if (a != null) {
                lines.add(label(side) + " (" + a.getOutlet().getName() + "): " + leadSentence(a.getExcerpt()));
            }
        }

        if (lines.isEmpty()) {
            return "No extractable coverage yet. Summary will appear once at least one "
                    + "tracked source is fetched successfully.";
        }
        return String.join("\n", lines);
    }

    private String label(Bias.Side side) {
        return switch (side) {
            case LEFT -> "Left-leaning coverage";
            case CENTER -> "Center coverage";
            case RIGHT -> "Right-leaning coverage";
        };
    }

    /** First sentence of the excerpt, capped so a line stays readable. */
    private String leadSentence(String excerpt) {
        String text = excerpt.trim();
        int end = -1;
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            if ((c == '.' || c == '!' || c == '?') && i >= 40) {
                end = i + 1;
                break;
            }
        }
        String sentence = end > 0 ? text.substring(0, end) : text;
        if (sentence.length() > 240) {
            sentence = sentence.substring(0, 240).trim() + "\u2026";
        }
        return sentence;
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}

package com.newsrater.service;

import java.net.URI;
import java.time.Instant;
import net.dankito.readability4j.Article;
import net.dankito.readability4j.Readability4J;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Fetches an article URL and extracts its headline, lead text, and lead image.
 * A fetch or parse failure is returned as a failed result rather than throwing,
 * so the source still appears on the story page with its error.
 */
@Service
public class ArticleFetchService {

    private static final Logger log = LoggerFactory.getLogger(ArticleFetchService.class);
    private static final String USER_AGENT =
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
                    + "(KHTML, like Gecko) Chrome/124.0 Safari/537.36";
    private static final int TIMEOUT_MS = 8000;
    private static final int EXCERPT_LIMIT = 500;

    /** Result of a single fetch; either OK with content or a failure with a reason. */
    public record FetchResult(
            boolean ok,
            String title,
            String excerpt,
            Instant publishedAt,
            String imageUrl,
            String error
    ) {
        static FetchResult ok(String title, String excerpt, Instant publishedAt, String imageUrl) {
            return new FetchResult(true, title, excerpt, publishedAt, imageUrl, null);
        }

        static FetchResult failed(String error) {
            return new FetchResult(false, null, null, null, null, error);
        }
    }

    public FetchResult fetch(String url) {
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent(USER_AGENT)
                    .timeout(TIMEOUT_MS)
                    .followRedirects(true)
                    .ignoreHttpErrors(false)
                    .get();

            String html = doc.outerHtml();
            Readability4J readability = new Readability4J(url, html);
            Article parsed = readability.parse();

            String title = firstNonBlank(parsed.getTitle(), doc.title(), url);
            String excerpt = buildExcerpt(parsed);
            Instant publishedAt = extractPublishedAt(doc);
            String imageUrl = extractImage(doc, parsed, url);

            return FetchResult.ok(title, excerpt, publishedAt, imageUrl);
        } catch (Exception e) {
            log.warn("Fetch failed for {}: {}", url, e.toString());
            return FetchResult.failed(shortError(e));
        }
    }

    private String buildExcerpt(Article parsed) {
        String text = parsed.getExcerpt();
        if (isBlank(text)) {
            text = parsed.getTextContent();
        }
        if (isBlank(text)) {
            return null;
        }
        text = text.replaceAll("\\s+", " ").trim();
        return text.length() > EXCERPT_LIMIT ? text.substring(0, EXCERPT_LIMIT).trim() + "\u2026" : text;
    }

    /**
     * Lead image for the card. Prefer the social share image, then the first
     * substantial image in the article body. Icons, logos, and pixels are skipped.
     */
    private String extractImage(Document doc, Article parsed, String pageUrl) {
        String[] metaSelectors = {
                "meta[property=og:image]",
                "meta[property=og:image:url]",
                "meta[name=twitter:image]",
                "meta[name=twitter:image:src]",
                "meta[itemprop=image]"
        };
        String social = null;
        for (String selector : metaSelectors) {
            social = resolveImage(pageUrl, metaContent(doc, selector));
            if (social != null) {
                break;
            }
        }
        if (social == null) {
            social = resolveImage(pageUrl, doc.select("link[rel=image_src]").attr("href"));
        }
        // A share image that is a logo or placeholder loses to the first real photo in the body.
        if (social != null && !isGenericImage(social)) {
            return social;
        }
        String content = parsed.getContent();
        if (!isBlank(content)) {
            for (Element img : Jsoup.parse(content).select("img[src]")) {
                String resolved = resolveImage(pageUrl, img.attr("src"));
                if (resolved != null && !isGenericImage(resolved)) {
                    return resolved;
                }
            }
        }
        return social;
    }

    /** Site chrome (logos, share defaults, placeholders), not a story photo. */
    static boolean isGenericImage(String url) {
        if (url == null) {
            return true;
        }
        String lower = url.toLowerCase();
        return lower.contains("placeholder")
                || lower.contains("/og/")
                || lower.contains("logo")
                || lower.contains("favicon")
                || lower.contains("sprite")
                || lower.contains("navchip")
                || lower.contains("-bg-")
                || lower.contains("pixel")
                || lower.contains("spacer")
                || lower.contains("1x1")
                || lower.endsWith(".svg")
                || lower.contains(".svg?");
    }

    private static String metaContent(Document doc, String selector) {
        for (Element el : doc.select(selector)) {
            String content = el.attr("content");
            if (!isBlank(content)) {
                return content.trim();
            }
        }
        return null;
    }

    /** Absolute http(s) URL, or null when the value is missing or not a web image. */
    private static String resolveImage(String pageUrl, String raw) {
        if (isBlank(raw)) {
            return null;
        }
        raw = raw.trim();
        if (raw.startsWith("data:") || raw.startsWith("blob:")) {
            return null;
        }
        if (raw.startsWith("//")) {
            raw = "https:" + raw;
        }
        try {
            URI resolved = URI.create(pageUrl).resolve(raw);
            String scheme = resolved.getScheme();
            if (scheme == null || !(scheme.equalsIgnoreCase("http") || scheme.equalsIgnoreCase("https"))) {
                return null;
            }
            String value = resolved.toString();
            return value.length() > 2000 ? null : value;
        } catch (Exception e) {
            return null;
        }
    }

    private Instant extractPublishedAt(Document doc) {
        String[] selectors = {
                "meta[property=article:published_time]",
                "meta[name=article:published_time]",
                "meta[name=pubdate]",
                "meta[property=og:published_time]",
                "meta[itemprop=datePublished]"
        };
        for (String selector : selectors) {
            String content = doc.select(selector).attr("content");
            if (!isBlank(content)) {
                try {
                    return Instant.parse(content.trim());
                } catch (Exception ignored) {
                    try {
                        return java.time.OffsetDateTime.parse(content.trim()).toInstant();
                    } catch (Exception alsoIgnored) {
                        // Unparseable date; leave null.
                    }
                }
            }
        }
        return null;
    }

    private static String shortError(Exception e) {
        String msg = e.getMessage();
        String base = e.getClass().getSimpleName();
        return isBlank(msg) ? base : base + ": " + msg;
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (!isBlank(value)) {
                return value.trim();
            }
        }
        return null;
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}

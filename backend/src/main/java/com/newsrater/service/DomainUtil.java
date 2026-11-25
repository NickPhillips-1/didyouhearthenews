package com.newsrater.service;

import com.google.common.net.InternetDomainName;
import java.net.URI;
import java.util.Locale;

/** URL normalization and registrable-domain extraction. */
public final class DomainUtil {

    private DomainUtil() {
    }

    /**
     * Returns the registrable domain for a URL, e.g. {@code www.foxnews.com}
     * and {@code video.foxnews.com} both yield {@code foxnews.com}. Falls back
     * to the lowercased host when the public-suffix lookup cannot classify it.
     */
    public static String registrableDomain(String url) {
        String host = hostOf(url);
        if (host == null) {
            return null;
        }
        try {
            InternetDomainName name = InternetDomainName.from(host);
            if (name.isUnderPublicSuffix()) {
                return name.topPrivateDomain().toString();
            }
        } catch (IllegalArgumentException | IllegalStateException ignored) {
            // Not a standard domain (e.g. an IP or intranet host); use host as-is.
        }
        return host;
    }

    private static String hostOf(String url) {
        try {
            String candidate = url.trim();
            if (!candidate.contains("://")) {
                candidate = "https://" + candidate;
            }
            String host = URI.create(candidate).getHost();
            if (host == null) {
                return null;
            }
            host = host.toLowerCase(Locale.ROOT);
            return host.startsWith("www.") ? host.substring(4) : host;
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}

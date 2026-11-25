package com.newsrater.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.newsrater.dto.CreateStoryRequest;
import com.newsrater.dto.StoryDto;
import com.newsrater.model.Article;
import com.newsrater.model.Outlet;
import com.newsrater.model.Story;
import com.newsrater.repository.OutletRepository;
import com.newsrater.repository.StoryRepository;
import java.lang.reflect.Proxy;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class StoryServiceTest {

    private final java.util.Map<String, ArticleFetchService.FetchResult> fetches = new java.util.HashMap<>();
    private StoryService service;

    @BeforeEach
    void setUp() {
        fetches.clear();
        ArticleFetchService fetchService = new ArticleFetchService() {
            @Override
            public FetchResult fetch(String url) {
                return fetches.getOrDefault(url, ok("Headline"));
            }
        };
        service = new StoryService(
                stories(),
                fetchService,
                new OutletMatcher(outlets()),
                (title, articles) -> "summary",
                new BiasDistributionService());
    }

    @Test
    void normalizesSplitsDedupesAndPrefixesHttps() {
        StoryDto dto = service.create(new CreateStoryRequest(
                "  ",
                List.of("example.com/a\nhttps://example.com/a\nhttps://example.com/b")));

        assertThat(dto.articles()).extracting(article -> article.url())
                .containsExactly("https://example.com/a", "https://example.com/b");
        assertThat(dto.title()).isEqualTo("Headline");
        assertThat(dto.origin()).isEqualTo("MANUAL");
    }

    @Test
    void fetchFailureDoesNotAbortTheStory() {
        fetches.put("https://ok.example/a", ok("Ok headline"));
        fetches.put("https://bad.example/b",
                new ArticleFetchService.FetchResult(false, null, null, null, null, "timeout"));

        StoryDto dto = service.create(new CreateStoryRequest(
                "Kept title",
                List.of("https://ok.example/a", "https://bad.example/b")));

        assertThat(dto.title()).isEqualTo("Kept title");
        assertThat(dto.articles()).hasSize(2);
        assertThat(dto.articles().get(1).fetchStatus()).isEqualTo(Article.FetchStatus.FAILED.name());
        assertThat(dto.articles().get(1).fetchError()).isEqualTo("timeout");
        assertThat(dto.distribution().untracked()).isEqualTo(2);
        assertThat(dto.distribution().trackedTotal()).isZero();
    }

    @Test
    void blankUrlsAreRejected() {
        assertThatThrownBy(() -> service.create(new CreateStoryRequest("T", List.of("  \n"))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("URL");
    }

    private static ArticleFetchService.FetchResult ok(String title) {
        return new ArticleFetchService.FetchResult(true, title, "excerpt", null, null, null);
    }

    private static StoryRepository stories() {
        return proxy(StoryRepository.class, (method, args) -> {
            if ("save".equals(method.getName())) {
                return args[0];
            }
            return defaultValue(method.getReturnType());
        });
    }

    private static OutletRepository outlets() {
        return proxy(OutletRepository.class, (method, args) -> {
            if ("findByDomain".equals(method.getName())) {
                return Optional.<Outlet>empty();
            }
            return defaultValue(method.getReturnType());
        });
    }

    private interface Handler {
        Object invoke(java.lang.reflect.Method method, Object[] args);
    }

    private static <T> T proxy(Class<T> type, Handler handler) {
        Object instance = Proxy.newProxyInstance(
                type.getClassLoader(),
                new Class<?>[] {type},
                (unused, method, args) -> {
                    if (method.getDeclaringClass() == Object.class) {
                        return switch (method.getName()) {
                            case "toString" -> type.getSimpleName();
                            case "hashCode" -> 0;
                            default -> false;
                        };
                    }
                    return handler.invoke(method, args);
                });
        return type.cast(instance);
    }

    private static Object defaultValue(Class<?> type) {
        if (type.equals(Optional.class)) {
            return Optional.empty();
        }
        if (type.equals(boolean.class)) {
            return false;
        }
        if (type.equals(int.class) || type.equals(long.class)) {
            return 0;
        }
        return null;
    }
}

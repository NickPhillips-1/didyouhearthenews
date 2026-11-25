package com.newsrater.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.newsrater.dto.BiasDistributionDto;
import com.newsrater.model.Article;
import com.newsrater.model.Bias;
import com.newsrater.model.Outlet;
import java.util.ArrayList;
import java.util.List;
import net.jqwik.api.Arbitraries;
import net.jqwik.api.Arbitrary;
import net.jqwik.api.ForAll;
import net.jqwik.api.Property;
import net.jqwik.api.Provide;

/**
 * Generated inputs for {@link BiasDistributionService#compute}. This is the
 * code-level check; the TLA+ model in {@code formal/tla} covers story-create
 * ordering, not this arithmetic.
 */
class BiasDistributionPropertiesTest {

    private final BiasDistributionService service = new BiasDistributionService();

    @Property
    void percentsSumAndUntrackedStaysOutOfTheBase(@ForAll("articles") List<Article> articles) {
        BiasDistributionDto dto = service.compute(articles);
        int sum = dto.leftPct() + dto.centerPct() + dto.rightPct();
        assertThat(dto.trackedTotal()).isEqualTo(dto.left() + dto.center() + dto.right());
        assertThat(dto.untracked() + dto.trackedTotal()).isEqualTo(articles.size());
        if (dto.trackedTotal() == 0) {
            assertThat(sum).isZero();
        } else {
            assertThat(sum).isEqualTo(100);
        }
        assertThat(dto.leftPct()).isBetween(0, 100);
        assertThat(dto.centerPct()).isBetween(0, 100);
        assertThat(dto.rightPct()).isBetween(0, 100);
    }

    @Property
    void addingUntrackedDoesNotMovePercents(
            @ForAll("tracked") List<Article> tracked,
            @ForAll("untracked") List<Article> extra) {
        BiasDistributionDto before = service.compute(tracked);
        List<Article> withExtra = new ArrayList<>(tracked);
        withExtra.addAll(extra);
        BiasDistributionDto after = service.compute(withExtra);
        assertThat(after.leftPct()).isEqualTo(before.leftPct());
        assertThat(after.centerPct()).isEqualTo(before.centerPct());
        assertThat(after.rightPct()).isEqualTo(before.rightPct());
        assertThat(after.untracked()).isEqualTo(before.untracked() + extra.size());
    }

    @Provide
    Arbitrary<List<Article>> articles() {
        return article(true).list().ofMaxSize(40);
    }

    @Provide
    Arbitrary<List<Article>> tracked() {
        return article(false).list().ofMaxSize(30);
    }

    @Provide
    Arbitrary<List<Article>> untracked() {
        return Arbitraries.just(Bias.UNTRACKED).map(BiasDistributionPropertiesTest::articleFor).list().ofMaxSize(15);
    }

    private static Arbitrary<Article> article(boolean allowUntracked) {
        Arbitrary<Bias> bias = allowUntracked
                ? Arbitraries.of(Bias.values())
                : Arbitraries.of(Bias.LEFT, Bias.LEAN_LEFT, Bias.CENTER, Bias.LEAN_RIGHT, Bias.RIGHT);
        return bias.map(BiasDistributionPropertiesTest::articleFor);
    }

    private static Article articleFor(Bias bias) {
        Article article = new Article("https://example.com/" + bias.name(), "example.com");
        if (bias != Bias.UNTRACKED) {
            article.setOutlet(new Outlet("example.com", "Example", bias));
        }
        return article;
    }
}

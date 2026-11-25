package com.newsrater.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.newsrater.dto.BiasDistributionDto;
import com.newsrater.model.Article;
import com.newsrater.model.Bias;
import com.newsrater.model.Outlet;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

class BiasDistributionServiceTest {

    private final BiasDistributionService service = new BiasDistributionService();

    @Test
    void untrackedIsExcludedAndRemainderLandsOnRight() {
        BiasDistributionDto dto = service.compute(List.of(
                article(Bias.LEFT),
                article(Bias.CENTER),
                article(Bias.RIGHT),
                article(Bias.UNTRACKED)
        ));

        assertThat(dto.left()).isEqualTo(1);
        assertThat(dto.center()).isEqualTo(1);
        assertThat(dto.right()).isEqualTo(1);
        assertThat(dto.untracked()).isEqualTo(1);
        assertThat(dto.trackedTotal()).isEqualTo(3);
        assertThat(dto.leftPct()).isEqualTo(33);
        assertThat(dto.centerPct()).isEqualTo(33);
        assertThat(dto.rightPct()).isEqualTo(34);
        assertThat(dto.leftPct() + dto.centerPct() + dto.rightPct()).isEqualTo(100);
    }

    @Test
    void emptyAndAllUntrackedHaveNoBar() {
        assertThat(service.compute(List.of()).trackedTotal()).isZero();
        BiasDistributionDto onlyUnknown = service.compute(List.of(article(Bias.UNTRACKED), article(Bias.UNTRACKED)));
        assertThat(onlyUnknown.trackedTotal()).isZero();
        assertThat(onlyUnknown.leftPct() + onlyUnknown.centerPct() + onlyUnknown.rightPct()).isZero();
        assertThat(onlyUnknown.untracked()).isEqualTo(2);
    }

    @Test
    void roundingOverflowStillSumsTo100() {
        List<Article> articles = new ArrayList<>();
        for (int i = 0; i < 101; i++) {
            articles.add(article(Bias.LEFT));
        }
        for (int i = 0; i < 99; i++) {
            articles.add(article(Bias.CENTER));
        }
        BiasDistributionDto dto = service.compute(articles);
        assertThat(dto.trackedTotal()).isEqualTo(200);
        assertThat(dto.right()).isZero();
        assertThat(dto.leftPct() + dto.centerPct() + dto.rightPct()).isEqualTo(100);
        assertThat(dto.leftPct()).isBetween(0, 100);
        assertThat(dto.centerPct()).isBetween(0, 100);
        assertThat(dto.rightPct()).isBetween(0, 100);
    }

    private static Article article(Bias bias) {
        Article article = new Article("https://example.com/" + bias.name(), "example.com");
        if (bias != Bias.UNTRACKED) {
            article.setOutlet(new Outlet("example.com", "Example", bias));
        }
        return article;
    }
}

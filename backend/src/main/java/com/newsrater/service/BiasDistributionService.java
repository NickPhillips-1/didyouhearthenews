package com.newsrater.service;

import com.newsrater.dto.BiasDistributionDto;
import com.newsrater.model.Article;
import com.newsrater.model.Bias;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Aggregates articles into the Left / Center / Right coverage bar. Untracked
 * articles are counted separately and excluded from the percentage base, so
 * unknown domains never move the distribution.
 */
@Service
public class BiasDistributionService {

    public BiasDistributionDto compute(List<Article> articles) {
        int left = 0;
        int center = 0;
        int right = 0;
        int untracked = 0;

        for (Article a : articles) {
            Bias.Side side = a.bias().side();
            if (side == null) {
                untracked++;
                continue;
            }
            switch (side) {
                case LEFT -> left++;
                case CENTER -> center++;
                case RIGHT -> right++;
            }
        }

        int tracked = left + center + right;
        int leftPct = pct(left, tracked);
        int centerPct = pct(center, tracked);
        int rightPct = tracked == 0 ? 0 : Math.max(0, 100 - leftPct - centerPct);

        return new BiasDistributionDto(
                left, center, right, untracked, tracked,
                leftPct, centerPct, rightPct
        );
    }

    private int pct(int part, int total) {
        if (total == 0) {
            return 0;
        }
        return Math.round(part * 100f / total);
    }
}

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
        int leftPct = 0;
        int centerPct = 0;
        int rightPct = 0;
        if (tracked > 0) {
            leftPct = pct(left, tracked);
            centerPct = pct(center, tracked);
            // Remainder lands on Right so the three percents sum to 100.
            // If Left and Center each round up past 100, give the overflow back
            // to Center, then Left. Untracked stays out of this base.
            rightPct = 100 - leftPct - centerPct;
            if (rightPct < 0) {
                int overflow = -rightPct;
                int fromCenter = Math.min(centerPct, overflow);
                centerPct -= fromCenter;
                overflow -= fromCenter;
                leftPct -= overflow;
                rightPct = 0;
            }
        }

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

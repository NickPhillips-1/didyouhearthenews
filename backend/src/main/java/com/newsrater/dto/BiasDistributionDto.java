package com.newsrater.dto;

/**
 * Left / Center / Right distribution for the coverage bar. Percentages are of
 * tracked articles only; {@code untracked} is reported separately and excluded
 * from the percentage base.
 */
public record BiasDistributionDto(
        int left,
        int center,
        int right,
        int untracked,
        int trackedTotal,
        int leftPct,
        int centerPct,
        int rightPct
) {
}

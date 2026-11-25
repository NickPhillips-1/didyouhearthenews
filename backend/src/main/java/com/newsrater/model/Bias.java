package com.newsrater.model;

/**
 * Five-point political lean, owned by the outlet (not the article text),
 * plus UNTRACKED for domains not in the catalog.
 *
 * {@link #side()} folds the five points into the three Ground News buckets
 * used for the Left / Center / Right distribution bar.
 */
public enum Bias {
    LEFT("Left", Side.LEFT),
    LEAN_LEFT("Lean Left", Side.LEFT),
    CENTER("Center", Side.CENTER),
    LEAN_RIGHT("Lean Right", Side.RIGHT),
    RIGHT("Right", Side.RIGHT),
    UNTRACKED("Untracked", null);

    private final String label;
    private final Side side;

    Bias(String label, Side side) {
        this.label = label;
        this.side = side;
    }

    public String label() {
        return label;
    }

    /** The three-bucket side, or null for UNTRACKED (excluded from the bar). */
    public Side side() {
        return side;
    }

    public enum Side {
        LEFT, CENTER, RIGHT
    }
}

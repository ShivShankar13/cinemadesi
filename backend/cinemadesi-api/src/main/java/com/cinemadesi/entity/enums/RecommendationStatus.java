package com.cinemadesi.entity.enums;

/**
 * Lifecycle state of a film recommendation sent to a friend or group.
 *
 * <pre>
 * PENDING   — recipient hasn't acted on it yet (default)
 * SAVED     — recipient added it to their watchlist
 * DISMISSED — recipient declined / hid it
 * </pre>
 */
public enum RecommendationStatus {
    PENDING,
    SAVED,
    DISMISSED
}

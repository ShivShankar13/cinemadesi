package com.cinemadesi.dto.request;

import com.cinemadesi.entity.enums.RecommendationStatus;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;

/**
 * Body for {@code PATCH /api/v1/recommendations/{recId}/status}.
 *
 * <p>Only SAVED or DISMISSED are valid transitions from PENDING —
 * service must reject PENDING here (and any other state).</p>
 */
public record UpdateRecommendationStatusRequest(

        @NotNull
        RecommendationStatus status
) {

    @AssertTrue(message = "status must be SAVED or DISMISSED")
    public boolean isTerminalStatus() {
        return status == RecommendationStatus.SAVED
                || status == RecommendationStatus.DISMISSED;
    }
}

package com.cinemadesi.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/**
 * Body for {@code POST /api/v1/recommendations}.
 *
 * <p>Exactly one of {@code toUserId} or {@code toGroupId} must be set —
 * validated by {@link #hasExactlyOneTarget()}.</p>
 */
public record RecommendFilmRequest(

        @NotNull
        UUID filmId,

        UUID toUserId,

        UUID toGroupId,

        @Size(max = 200, message = "note must be 200 chars or fewer")
        String note
) {

    @AssertTrue(message = "exactly one of toUserId or toGroupId must be set")
    public boolean hasExactlyOneTarget() {
        return (toUserId == null) ^ (toGroupId == null);
    }
}

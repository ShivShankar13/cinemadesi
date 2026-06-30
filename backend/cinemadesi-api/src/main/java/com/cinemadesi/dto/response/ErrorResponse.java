package com.cinemadesi.dto.response;

import java.time.Instant;
import java.util.Map;

/**
 * Standard error envelope returned by {@code GlobalExceptionHandler}.
 *
 * @param status    HTTP status code (e.g. 404, 400)
 * @param message   short human-readable message
 * @param errors    field -> message map for validation failures (nullable)
 * @param timestamp server-side timestamp the error was produced
 */
public record ErrorResponse(
        int status,
        String message,
        Map<String, String> errors,
        Instant timestamp
) {
    public static ErrorResponse of(int status, String message) {
        return new ErrorResponse(status, message, null, Instant.now());
    }

    public static ErrorResponse of(int status, String message, Map<String, String> errors) {
        return new ErrorResponse(status, message, errors, Instant.now());
    }
}

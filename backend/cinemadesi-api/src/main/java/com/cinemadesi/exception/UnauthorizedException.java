package com.cinemadesi.exception;

/**
 * Thrown when the caller is not allowed to perform the requested action
 * (e.g. editing another user's diary entry). Mapped to HTTP 401 by
 * {@link GlobalExceptionHandler}.
 */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}

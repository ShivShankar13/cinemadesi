package com.cinemadesi.entity.enums;

/**
 * Regional Indian film industries. Derived from TMDB's
 * {@code original_language} when a film is first cached
 * (see {@code TMDBService} in spec Module 6).
 *
 * <pre>
 * hi → BOLLYWOOD
 * ta → TAMIL
 * te → TELUGU
 * ml → MALAYALAM
 * kn → KANNADA
 * mr → MARATHI
 * *  → OTHER
 * </pre>
 */
public enum Industry {
    BOLLYWOOD,
    TAMIL,
    TELUGU,
    MALAYALAM,
    KANNADA,
    MARATHI,
    OTHER;

    /** Map a TMDB ISO-639-1 language code to its industry bucket. */
    public static Industry fromTmdbLanguage(String iso2) {
        if (iso2 == null) return OTHER;
        return switch (iso2.toLowerCase()) {
            case "hi" -> BOLLYWOOD;
            case "ta" -> TAMIL;
            case "te" -> TELUGU;
            case "ml" -> MALAYALAM;
            case "kn" -> KANNADA;
            case "mr" -> MARATHI;
            default -> OTHER;
        };
    }
}

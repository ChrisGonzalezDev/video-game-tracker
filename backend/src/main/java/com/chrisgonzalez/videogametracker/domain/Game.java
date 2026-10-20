package com.chrisgonzalez.videogametracker.domain;

import java.net.URI;
import java.time.Year;
import java.util.Objects;
import java.util.Set;

public record Game(
        String title,
        Year originalReleaseYear,
        Set<Console> consoles,
        EsrbRating esrbRating,
        Integer maxLocalMultiplayerPlayers,
        URI coverImageUrl,
        String personalComments
) {

    public Game {
        Objects.requireNonNull(title, "Game title must not be null");
        if (title.isBlank()) {
            throw new IllegalArgumentException("Game title must not be blank");
        }

        Objects.requireNonNull(originalReleaseYear, "Original release year must not be null");
        if (originalReleaseYear.getValue() < 1000) {
            throw new IllegalArgumentException("Original release year must have four digits");
        }
        if (originalReleaseYear.isAfter(Year.now())) {
            throw new IllegalArgumentException("Original release year must not be in the future");
        }

        consoles = Set.copyOf(Objects.requireNonNull(consoles, "Consoles must not be null"));
        if (consoles.isEmpty()) {
            throw new IllegalArgumentException("A game must have at least one console");
        }

        if (maxLocalMultiplayerPlayers != null && maxLocalMultiplayerPlayers <= 0) {
            throw new IllegalArgumentException("Maximum local players must be positive");
        }

        if (coverImageUrl != null && !isAbsoluteHttpUrl(coverImageUrl)) {
            throw new IllegalArgumentException("Cover image URL must be an absolute HTTP or HTTPS URL");
        }
    }

    private static boolean isAbsoluteHttpUrl(URI uri) {
        String scheme = uri.getScheme();
        return uri.isAbsolute()
                && uri.getHost() != null
                && !uri.getHost().isBlank()
                && ("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme));
    }
}

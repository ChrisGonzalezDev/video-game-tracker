package com.chrisgonzalez.videogametracker.persistence;

import java.util.List;

public record GameSearchResult(List<PersistedGame> items, long totalItems) {
    public GameSearchResult {
        items = List.copyOf(items);
    }
}

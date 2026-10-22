package com.chrisgonzalez.videogametracker.api;

import java.util.List;

import com.chrisgonzalez.videogametracker.persistence.GameSearchResult;

public record GamePageResponse(
        List<GameResponse> items,
        int page,
        int size,
        long totalItems,
        long totalPages) {

    public static GamePageResponse from(GameSearchResult result, int page, int size) {
        List<GameResponse> items = result.items().stream()
                .map(GameResponse::from)
                .toList();
        long totalPages = result.totalItems() == 0
                ? 0
                : 1 + (result.totalItems() - 1) / size;
        return new GamePageResponse(items, page, size, result.totalItems(), totalPages);
    }
}

package com.chrisgonzalez.videogametracker.persistence;

import java.util.List;

import com.chrisgonzalez.videogametracker.domain.EsrbRating;

public record GameSearchCriteria(
        String keyword,
        List<String> consoles,
        EsrbRating rating,
        Integer minPlayers,
        Integer maxPlayers,
        int page,
        int size,
        SortField sort,
        SortDirection direction) {

    public enum SortField {
        TITLE,
        ORIGINAL_RELEASE_YEAR
    }

    public enum SortDirection {
        ASC,
        DESC
    }

    public GameSearchCriteria {
        consoles = List.copyOf(consoles);
    }

    public long offset() {
        return (long) page * size;
    }
}

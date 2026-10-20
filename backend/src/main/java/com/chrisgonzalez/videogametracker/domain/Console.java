package com.chrisgonzalez.videogametracker.domain;

import java.util.Objects;

public record Console(String name) {

    public Console {
        Objects.requireNonNull(name, "Console name must not be null");
        if (name.isBlank()) {
            throw new IllegalArgumentException("Console name must not be blank");
        }
    }
}

package com.chrisgonzalez.videogametracker.api;

import com.chrisgonzalez.videogametracker.domain.Console;

public record ConsoleResponse(String name) {

    public static ConsoleResponse from(Console console) {
        return new ConsoleResponse(console.name());
    }
}

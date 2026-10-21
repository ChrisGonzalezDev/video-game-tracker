package com.chrisgonzalez.videogametracker.api;

public class GameNotFoundException extends RuntimeException {

    public GameNotFoundException() {
        super("Game with the specified identifier was not found.");
    }
}

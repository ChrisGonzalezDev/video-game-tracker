package com.chrisgonzalez.videogametracker.persistence;

import com.chrisgonzalez.videogametracker.domain.Game;

public record PersistedGame(long id, Game game) {
}

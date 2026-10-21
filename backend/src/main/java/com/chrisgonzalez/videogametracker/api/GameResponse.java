package com.chrisgonzalez.videogametracker.api;

import java.util.Comparator;
import java.util.List;

import com.chrisgonzalez.videogametracker.domain.Game;
import com.chrisgonzalez.videogametracker.persistence.PersistedGame;

public record GameResponse(
        long id,
        String title,
        int originalReleaseYear,
        List<ConsoleResponse> consoles,
        String esrbRating,
        Integer maxLocalMultiplayerPlayers,
        String coverImageUrl,
        String personalComments) {

    public static GameResponse from(PersistedGame persistedGame) {
        Game game = persistedGame.game();
        return new GameResponse(
                persistedGame.id(),
                game.title(),
                game.originalReleaseYear().getValue(),
                game.consoles().stream()
                        .map(ConsoleResponse::from)
                        .sorted(Comparator.comparing(ConsoleResponse::name))
                        .toList(),
                game.esrbRating() == null ? null : game.esrbRating().value(),
                game.maxLocalMultiplayerPlayers(),
                game.coverImageUrl() == null ? null : game.coverImageUrl().toString(),
                game.personalComments());
    }

}

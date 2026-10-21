package com.chrisgonzalez.videogametracker.api;

import com.chrisgonzalez.videogametracker.persistence.ConsoleRepository;
import com.chrisgonzalez.videogametracker.persistence.GameRepository;
import com.chrisgonzalez.videogametracker.persistence.PersistedGame;
import java.util.Comparator;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class GameController {

    private final GameRepository gameRepository;
    private final ConsoleRepository consoleRepository;

    public GameController(GameRepository gameRepository, ConsoleRepository consoleRepository) {
        this.gameRepository = gameRepository;
        this.consoleRepository = consoleRepository;
    }

    @GetMapping("/games/{id}")
    public GameResponse getGame(@PathVariable String id) {
        long gameId = parseGameId(id);
        PersistedGame persistedGame = gameRepository.findPersistedById(gameId)
                .orElseThrow(GameNotFoundException::new);
        return GameResponse.from(persistedGame);
    }

    @GetMapping("/consoles")
    public List<ConsoleResponse> listConsoles() {
        return consoleRepository.findAll().stream()
                .map(ConsoleResponse::from)
                .sorted(Comparator.comparing(ConsoleResponse::name))
                .toList();
    }

    private static long parseGameId(String id) {
        try {
            long parsedId = Long.parseLong(id);
            if (parsedId > 0) {
                return parsedId;
            }
        } catch (NumberFormatException ignored) {
        }
        throw new InvalidRequestException("id", "must be a positive integer");
    }
}

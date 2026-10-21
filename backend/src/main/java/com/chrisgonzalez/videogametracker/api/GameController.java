package com.chrisgonzalez.videogametracker.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.chrisgonzalez.videogametracker.persistence.ConsoleRepository;
import com.chrisgonzalez.videogametracker.persistence.GameRepository;
import com.chrisgonzalez.videogametracker.persistence.PersistedGame;
import java.util.Comparator;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

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

    @PostMapping("/games")
    public ResponseEntity<GameResponse> createGame(@RequestBody JsonNode requestBody) {
        var game = GameWriteRequest.toGame(requestBody, consoleRepository.findAll());
        long gameId = gameRepository.save(game);
        var location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(gameId)
                .toUri();
        return ResponseEntity.created(location)
                .body(GameResponse.from(new PersistedGame(gameId, game)));
    }

    @PutMapping("/games/{id}")
    public GameResponse replaceGame(@PathVariable String id, @RequestBody JsonNode requestBody) {
        long gameId = parseGameId(id);
        var game = GameWriteRequest.toGame(requestBody, consoleRepository.findAll());
        if (!gameRepository.replace(gameId, game)) {
            throw new GameNotFoundException();
        }
        return GameResponse.from(new PersistedGame(gameId, game));
    }

    @DeleteMapping("/games/{id}")
    public ResponseEntity<Void> deleteGame(@PathVariable String id) {
        long gameId = parseGameId(id);
        if (!gameRepository.deleteById(gameId)) {
            throw new GameNotFoundException();
        }
        return ResponseEntity.noContent().build();
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

package com.chrisgonzalez.videogametracker.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.chrisgonzalez.videogametracker.domain.EsrbRating;
import com.chrisgonzalez.videogametracker.persistence.ConsoleRepository;
import com.chrisgonzalez.videogametracker.persistence.GameSearchCriteria;
import com.chrisgonzalez.videogametracker.persistence.GameSearchCriteria.SortDirection;
import com.chrisgonzalez.videogametracker.persistence.GameSearchCriteria.SortField;
import com.chrisgonzalez.videogametracker.persistence.GameSearchResult;
import com.chrisgonzalez.videogametracker.persistence.GameRepository;
import com.chrisgonzalez.videogametracker.persistence.PersistedGame;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.util.MultiValueMap;

@RestController
@RequestMapping("/api/v1")
public class GameController {

    private final GameRepository gameRepository;
    private final ConsoleRepository consoleRepository;

    public GameController(GameRepository gameRepository, ConsoleRepository consoleRepository) {
        this.gameRepository = gameRepository;
        this.consoleRepository = consoleRepository;
    }

    @GetMapping("/games")
    public GamePageResponse searchGames(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String rating,
            @RequestParam(required = false) String minPlayers,
            @RequestParam(required = false) String maxPlayers,
            @RequestParam(required = false) String page,
            @RequestParam(required = false) String size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String direction,
            @RequestParam MultiValueMap<String, String> queryParameters) {
        int parsedPage = parseIntegerParameter("page", page, 0);
        int parsedSize = parseIntegerParameter("size", size, 20);
        if (parsedPage < 0) {
            throw new InvalidRequestException("page", "must be greater than or equal to zero");
        }
        if (parsedSize < 1 || parsedSize > 100) {
            throw new InvalidRequestException("size", "must be between 1 and 100");
        }

        Integer parsedMinPlayers = parseOptionalPositiveInteger("minPlayers", minPlayers);
        Integer parsedMaxPlayers = parseOptionalPositiveInteger("maxPlayers", maxPlayers);
        if (parsedMinPlayers != null && parsedMaxPlayers != null
                && parsedMinPlayers > parsedMaxPlayers) {
            throw new InvalidRequestException("minPlayers", "must not exceed maxPlayers");
        }

        EsrbRating parsedRating = parseRating(rating);
        List<String> parsedConsoles = new ArrayList<>();
        List<String> consoleParameters = queryParameters.get("console");
        if (consoleParameters != null) {
            for (String console : consoleParameters) {
                if (console == null || console.isBlank()) {
                    throw new InvalidRequestException("console", "must not be blank");
                }
                parsedConsoles.add(console);
            }
        }
        SortField sortField = parseSortField(sort);
        SortDirection sortDirection = parseSortDirection(direction);
        GameSearchCriteria criteria = new GameSearchCriteria(
                keyword,
                parsedConsoles,
                parsedRating,
                parsedMinPlayers,
                parsedMaxPlayers,
                parsedPage,
                parsedSize,
                sortField,
                sortDirection);
        GameSearchResult result = gameRepository.search(criteria);
        return GamePageResponse.from(result, parsedPage, parsedSize);
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

    private static int parseIntegerParameter(String field, String value, int defaultValue) {
        if (value == null) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException exception) {
            throw new InvalidRequestException(field, "must be an integer");
        }
    }

    private static Integer parseOptionalPositiveInteger(String field, String value) {
        if (value == null) {
            return null;
        }
        int parsedValue = parseIntegerParameter(field, value, 0);
        if (parsedValue < 1) {
            throw new InvalidRequestException(field, "must be greater than or equal to one");
        }
        return parsedValue;
    }

    private static EsrbRating parseRating(String rating) {
        if (rating == null) {
            return null;
        }
        try {
            return EsrbRating.fromValue(rating);
        } catch (IllegalArgumentException exception) {
            throw new InvalidRequestException("rating", "must be a supported ESRB rating");
        }
    }

    private static SortField parseSortField(String sort) {
        if (sort == null || sort.equals("title")) {
            return SortField.TITLE;
        }
        if (sort.equals("originalReleaseYear")) {
            return SortField.ORIGINAL_RELEASE_YEAR;
        }
        throw new InvalidRequestException("sort", "must be title or originalReleaseYear");
    }

    private static SortDirection parseSortDirection(String direction) {
        if (direction == null || direction.equals("asc")) {
            return SortDirection.ASC;
        }
        if (direction.equals("desc")) {
            return SortDirection.DESC;
        }
        throw new InvalidRequestException("direction", "must be asc or desc");
    }
}

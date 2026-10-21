package com.chrisgonzalez.videogametracker.persistence;

import com.chrisgonzalez.videogametracker.domain.Console;
import com.chrisgonzalez.videogametracker.domain.EsrbRating;
import com.chrisgonzalez.videogametracker.domain.Game;
import java.net.URI;
import java.sql.PreparedStatement;
import java.time.Year;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class GameRepository {

    private final JdbcTemplate jdbcTemplate;

    public GameRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public long save(Game game) {
        Objects.requireNonNull(game, "Game must not be null");
        if (game.consoles().isEmpty()) {
            throw new IllegalArgumentException("A game must be associated with at least one console");
        }

        List<Long> consoleIds = findConsoleIds(game);
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(
                    """
                            INSERT INTO games (
                                title, original_release_year, esrb_rating,
                                max_local_multiplayer_players, cover_image_url, personal_comments
                            ) VALUES (?, ?, ?, ?, ?, ?)
                            """,
                    new String[]{"id"});
            statement.setString(1, game.title());
            statement.setInt(2, game.originalReleaseYear().getValue());
            statement.setString(3, game.esrbRating() == null ? null : game.esrbRating().value());
            if (game.maxLocalMultiplayerPlayers() == null) {
                statement.setNull(4, java.sql.Types.INTEGER);
            } else {
                statement.setInt(4, game.maxLocalMultiplayerPlayers());
            }
            statement.setString(5, game.coverImageUrl() == null ? null : game.coverImageUrl().toString());
            statement.setString(6, game.personalComments());
            return statement;
        }, keyHolder);

        Number key = keyHolder.getKey();
        if (key == null) {
            throw new IllegalStateException("Database did not return an identifier for the saved game");
        }

        long gameId = key.longValue();
        for (Long consoleId : consoleIds) {
            jdbcTemplate.update(
                    "INSERT INTO game_consoles (game_id, console_id) VALUES (?, ?)",
                    gameId,
                    consoleId);
        }
        return gameId;
    }

    @Transactional
    public boolean replace(long id, Game game) {
        Objects.requireNonNull(game, "Game must not be null");
        if (game.consoles().isEmpty()) {
            throw new IllegalArgumentException("A game must be associated with at least one console");
        }

        List<Long> consoleIds = findConsoleIds(game);
        int updatedRows = jdbcTemplate.update(
                """
                        UPDATE games
                        SET title = ?, original_release_year = ?, esrb_rating = ?,
                            max_local_multiplayer_players = ?, cover_image_url = ?, personal_comments = ?
                        WHERE id = ?
                        """,
                game.title(),
                game.originalReleaseYear().getValue(),
                game.esrbRating() == null ? null : game.esrbRating().value(),
                game.maxLocalMultiplayerPlayers(),
                game.coverImageUrl() == null ? null : game.coverImageUrl().toString(),
                game.personalComments(),
                id);
        if (updatedRows == 0) {
            return false;
        }

        jdbcTemplate.update("DELETE FROM game_consoles WHERE game_id = ?", id);
        for (Long consoleId : consoleIds) {
            jdbcTemplate.update(
                    "INSERT INTO game_consoles (game_id, console_id) VALUES (?, ?)",
                    id,
                    consoleId);
        }
        return true;
    }

    @Transactional
    public boolean deleteById(long id) {
        return jdbcTemplate.update("DELETE FROM games WHERE id = ?", id) > 0;
    }

    @Transactional(readOnly = true)
    public Optional<Game> findById(long id) {
        return findPersistedById(id).map(PersistedGame::game);
    }

    @Transactional(readOnly = true)
    public Optional<PersistedGame> findPersistedById(long id) {
        List<GameRow> rows = jdbcTemplate.query(
                """
                        SELECT g.id, g.title, g.original_release_year, g.esrb_rating,
                               g.max_local_multiplayer_players, g.cover_image_url,
                               g.personal_comments, c.name AS console_name
                        FROM games g
                        JOIN game_consoles gc ON gc.game_id = g.id
                        JOIN consoles c ON c.id = gc.console_id
                        WHERE g.id = ?
                        """,
                (resultSet, rowNumber) -> new GameRow(
                        resultSet.getLong("id"),
                        resultSet.getString("title"),
                        resultSet.getInt("original_release_year"),
                        resultSet.getString("esrb_rating"),
                        (Integer) resultSet.getObject("max_local_multiplayer_players"),
                        resultSet.getString("cover_image_url"),
                        resultSet.getString("personal_comments"),
                        new Console(resultSet.getString("console_name"))),
                id);

        if (rows.isEmpty()) {
            return Optional.empty();
        }

        GameRow first = rows.get(0);
        Set<Console> consoles = new HashSet<>();
        rows.forEach(row -> consoles.add(row.console()));
        return Optional.of(new PersistedGame(
                first.id(),
                new Game(
                        first.title(),
                        Year.of(first.originalReleaseYear()),
                        consoles,
                        first.esrbRating() == null ? null : EsrbRating.fromValue(first.esrbRating()),
                        first.maxLocalMultiplayerPlayers(),
                        first.coverImageUrl() == null ? null : URI.create(first.coverImageUrl()),
                        first.personalComments())));
    }

    private List<Long> findConsoleIds(Game game) {
        return game.consoles().stream()
                .map(console -> {
                    List<Long> consoleIds = jdbcTemplate.query(
                            "SELECT id FROM consoles WHERE name = ?",
                            (resultSet, rowNumber) -> resultSet.getLong(1),
                            console.name());
                    if (consoleIds.isEmpty()) {
                        throw new IllegalArgumentException("Unsupported console: " + console.name());
                    }
                    return consoleIds.get(0);
                })
                .toList();
    }

    private record GameRow(
            long id,
            String title,
            int originalReleaseYear,
            String esrbRating,
            Integer maxLocalMultiplayerPlayers,
            String coverImageUrl,
            String personalComments,
            Console console) {
    }
}

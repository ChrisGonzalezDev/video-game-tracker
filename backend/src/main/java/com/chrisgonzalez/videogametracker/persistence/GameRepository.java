package com.chrisgonzalez.videogametracker.persistence;

import com.chrisgonzalez.videogametracker.domain.Console;
import com.chrisgonzalez.videogametracker.domain.EsrbRating;
import com.chrisgonzalez.videogametracker.domain.Game;
import java.net.URI;
import java.sql.PreparedStatement;
import java.time.Year;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class GameRepository {

    private final JdbcTemplate jdbcTemplate;
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    public GameRepository(JdbcTemplate jdbcTemplate, NamedParameterJdbcTemplate namedParameterJdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.namedParameterJdbcTemplate = namedParameterJdbcTemplate;
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

    @Transactional(readOnly = true)
    public GameSearchResult search(GameSearchCriteria criteria) {
        MapSqlParameterSource parameters = new MapSqlParameterSource();
        String whereClause = buildSearchWhereClause(criteria, parameters);
        long totalItems = namedParameterJdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM games g " + whereClause,
                        parameters,
                        Long.class);
        if (totalItems == 0 || criteria.offset() >= totalItems) {
            return new GameSearchResult(List.of(), totalItems);
        }

        parameters.addValue("size", criteria.size());
        parameters.addValue("offset", criteria.offset());
        String orderBy = searchOrderBy(criteria);
        String pageQuery = """
                WITH page_ids AS (
                    SELECT g.id
                    FROM games g
                """ + whereClause + "\n ORDER BY " + orderBy + """
                 LIMIT :size OFFSET :offset
                )
                SELECT g.id, g.title, g.original_release_year, g.esrb_rating,
                       g.max_local_multiplayer_players, g.cover_image_url,
                       g.personal_comments, c.name AS console_name
                FROM page_ids p
                JOIN games g ON g.id = p.id
                JOIN game_consoles gc ON gc.game_id = g.id
                JOIN consoles c ON c.id = gc.console_id
                """ + " ORDER BY " + orderBy + ", c.name";
        List<SearchGameRow> rows = namedParameterJdbcTemplate.query(
                        pageQuery,
                        parameters,
                        (resultSet, rowNumber) -> new SearchGameRow(
                                resultSet.getLong("id"),
                                resultSet.getString("title"),
                                resultSet.getInt("original_release_year"),
                                resultSet.getString("esrb_rating"),
                                (Integer) resultSet.getObject("max_local_multiplayer_players"),
                                resultSet.getString("cover_image_url"),
                                resultSet.getString("personal_comments"),
                                new Console(resultSet.getString("console_name"))));

        Map<Long, List<SearchGameRow>> rowsByGame = new LinkedHashMap<>();
        rows.forEach(row -> rowsByGame.computeIfAbsent(row.id(), ignored -> new ArrayList<>()).add(row));
        List<PersistedGame> items = rowsByGame.values().stream()
                        .map(this::toPersistedGame)
                        .toList();
        return new GameSearchResult(items, totalItems);
    }

    private static String buildSearchWhereClause(
            GameSearchCriteria criteria,
            MapSqlParameterSource parameters) {
        StringBuilder whereClause = new StringBuilder(" WHERE 1 = 1");
        if (criteria.keyword() != null) {
            whereClause.append("""
                             AND (
                                 POSITION(LOWER(:keyword) IN LOWER(g.title)) > 0
                                 OR POSITION(LOWER(:keyword) IN LOWER(COALESCE(g.personal_comments, ''))) > 0
                             )
                            """);
            parameters.addValue("keyword", criteria.keyword());
        }
        if (!criteria.consoles().isEmpty()) {
            whereClause.append("""
                             AND EXISTS (
                                 SELECT 1
                                 FROM game_consoles filter_gc
                                 JOIN consoles filter_c ON filter_c.id = filter_gc.console_id
                                 WHERE filter_gc.game_id = g.id
                                   AND filter_c.name IN (:consoles)
                             )
                            """);
            parameters.addValue("consoles", criteria.consoles());
        }
        if (criteria.rating() != null) {
            whereClause.append(" AND g.esrb_rating = :rating");
            parameters.addValue("rating", criteria.rating().value());
        }
        if (criteria.minPlayers() != null) {
            whereClause.append(" AND g.max_local_multiplayer_players >= :minPlayers");
            parameters.addValue("minPlayers", criteria.minPlayers());
        }
        if (criteria.maxPlayers() != null) {
            whereClause.append(" AND g.max_local_multiplayer_players <= :maxPlayers");
            parameters.addValue("maxPlayers", criteria.maxPlayers());
        }
        return whereClause.toString();
    }

    private static String searchOrderBy(GameSearchCriteria criteria) {
        String column = switch (criteria.sort()) {
            case TITLE -> "LOWER(g.title)";
            case ORIGINAL_RELEASE_YEAR -> "g.original_release_year";
        };
        return column + " " + criteria.direction().name() + ", g.id ASC";
    }

    private PersistedGame toPersistedGame(List<SearchGameRow> rows) {
        SearchGameRow first = rows.get(0);
        Set<Console> consoles = new HashSet<>();
        rows.forEach(row -> consoles.add(row.console()));
        return new PersistedGame(
                        first.id(),
                        new Game(
                                first.title(),
                                Year.of(first.originalReleaseYear()),
                                consoles,
                                first.esrbRating() == null ? null : EsrbRating.fromValue(first.esrbRating()),
                                first.maxLocalMultiplayerPlayers(),
                                first.coverImageUrl() == null ? null : URI.create(first.coverImageUrl()),
                                first.personalComments()));
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

    private record SearchGameRow(
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

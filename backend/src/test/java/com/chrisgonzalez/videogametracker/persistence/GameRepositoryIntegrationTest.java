package com.chrisgonzalez.videogametracker.persistence;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.chrisgonzalez.videogametracker.domain.Console;
import com.chrisgonzalez.videogametracker.domain.EsrbRating;
import com.chrisgonzalez.videogametracker.domain.Game;
import java.net.URI;
import java.time.Year;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("local")
@Testcontainers
class GameRepositoryIntegrationTest {

    @Container
    private static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("postgres:17.6-alpine");

    @DynamicPropertySource
    static void configureDataSource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private ConsoleRepository consoleRepository;

    @Autowired
    private Flyway flyway;

    @BeforeEach
    void clearTables() {
        jdbcTemplate.execute("TRUNCATE TABLE games RESTART IDENTITY CASCADE");
        jdbcTemplate.update("DELETE FROM consoles WHERE name = 'Test Console'");
    }

    @Test
    void appliesMigrationsToCleanDatabaseAndSeedsReleasedConsolesFromGenerationsTwoToNine() {
        assertEquals(2, flyway.info().applied().length);
        var consoles = consoleRepository.findAll();
        assertEquals(96, consoles.size());
        assertEquals(consoles.stream().sorted(Comparator.comparing(Console::name)).toList(), consoles);
        assertTrue(consoles.contains(new Console("Nintendo Entertainment System")));
        assertTrue(consoles.contains(new Console("Nintendo Switch")));
    }

    @Test
    void savesAndReadsAllGameFieldsAndMultipleConsoleAssociations() {
        Console switchConsole = new Console("Nintendo Switch");
        Console playStationConsole = new Console("Sony PlayStation 5");
        Game game = new Game(
                "Example Game",
                Year.of(2020),
                Set.of(switchConsole, playStationConsole),
                EsrbRating.E10_PLUS,
                4,
                URI.create("https://example.com/cover.jpg"),
                "A personal note.");

        long id = gameRepository.save(game);

        assertEquals(game, gameRepository.findById(id).orElseThrow());
        assertEquals(new PersistedGame(id, game), gameRepository.findPersistedById(id).orElseThrow());
    }

    @Test
    void savesAndReadsGameWhenOptionalFieldsAreAbsent() {
        Console console = insertConsole("Test Console");
        Game game = new Game(
                "Example Game",
                Year.of(2000),
                Set.of(console),
                null,
                null,
                null,
                null);

        long id = gameRepository.save(game);

        assertEquals(game, gameRepository.findById(id).orElseThrow());
    }

    @Test
    void searchesByKeywordAcrossTitlesAndCommentsCaseInsensitively() {
        long titleMatch = saveGame("Legend of Zelda", 2020, "Nintendo Switch", null, 2, null);
        long commentMatch = saveGame("Example", 2021, "Nintendo Switch", null, 2, "A ZELDA adventure");
        saveGame("Unrelated", 2022, "Nintendo Switch", null, 2, null);

        GameSearchResult result = gameRepository.search(criteria("zelda"));

        assertEquals(2, result.totalItems());
        assertEquals(List.of(commentMatch, titleMatch), result.items().stream().map(PersistedGame::id).toList());
    }

    @Test
    void combinesFiltersAndMatchesAnyRequestedConsole() {
        long matching = saveGame("Adventure", 2020, "Nintendo Switch", EsrbRating.E10_PLUS, 4, "Co-op quest");
        saveGame("Adventure", 2020, "Sony PlayStation 5", EsrbRating.E10_PLUS, 4, "A co-op game");
        saveGame("Adventure", 2020, "Nintendo Switch", EsrbRating.E, 4, "Co-op quest");

        GameSearchCriteria combinedCriteria = new GameSearchCriteria(
                "quest",
                List.of("Nintendo Switch", "Sony PlayStation 5"),
                EsrbRating.E10_PLUS,
                2,
                4,
                0,
                20,
                GameSearchCriteria.SortField.TITLE,
                GameSearchCriteria.SortDirection.ASC);
        GameSearchResult combined = gameRepository.search(combinedCriteria);
        GameSearchResult unknownConsole = gameRepository.search(new GameSearchCriteria(
                null,
                List.of("Unknown Console"),
                null,
                null,
                null,
                0,
                20,
                GameSearchCriteria.SortField.TITLE,
                GameSearchCriteria.SortDirection.ASC));

        assertEquals(1, combined.totalItems());
        assertEquals(matching, combined.items().get(0).id());
        assertEquals(0, unknownConsole.totalItems());
        assertTrue(unknownConsole.items().isEmpty());
    }

    @Test
    void filtersByEachConsoleAndExactRating() {
        long switchE10 = saveGame("Switch E10", 2020, "Nintendo Switch", EsrbRating.E10_PLUS, 2, null);
        saveGame("Switch E", 2021, "Nintendo Switch", EsrbRating.E, 2, null);
        long playStationE10 = saveGame("PlayStation E10", 2022, "Sony PlayStation 5", EsrbRating.E10_PLUS, 2, null);

        GameSearchResult switchOnly = gameRepository.search(new GameSearchCriteria(
                null, List.of("Nintendo Switch"), null, null, null, 0, 20,
                GameSearchCriteria.SortField.TITLE, GameSearchCriteria.SortDirection.ASC));
        GameSearchResult eitherConsole = gameRepository.search(new GameSearchCriteria(
                null, List.of("Nintendo Switch", "Sony PlayStation 5"), null, null, null, 0, 20,
                GameSearchCriteria.SortField.TITLE, GameSearchCriteria.SortDirection.ASC));
        GameSearchResult exactRating = gameRepository.search(new GameSearchCriteria(
                null, List.of(), EsrbRating.E10_PLUS, null, null, 0, 20,
                GameSearchCriteria.SortField.TITLE, GameSearchCriteria.SortDirection.ASC));

        assertEquals(2, switchOnly.totalItems());
        assertEquals(3, eitherConsole.totalItems());
        assertEquals(Set.of(switchE10, playStationE10), exactRating.items().stream()
                .map(PersistedGame::id)
                .collect(java.util.stream.Collectors.toSet()));
    }

    @Test
    void appliesInclusivePlayerBoundsAndExcludesUnknownPlayerCounts() {
        long lowerBound = saveGame("Two Players", 2000, "Nintendo Switch", null, 2, null);
        long upperBound = saveGame("Four Players", 2001, "Nintendo Switch", null, 4, null);
        saveGame("One Player", 2002, "Nintendo Switch", null, 1, null);
        saveGame("Unknown Players", 2003, "Nintendo Switch", null, null, null);

        GameSearchCriteria criteria = new GameSearchCriteria(
                null,
                List.of(),
                null,
                2,
                4,
                0,
                20,
                GameSearchCriteria.SortField.TITLE,
                GameSearchCriteria.SortDirection.ASC);
        GameSearchResult result = gameRepository.search(criteria);
        GameSearchResult minimumOnly = gameRepository.search(new GameSearchCriteria(
                null, List.of(), null, 2, null, 0, 20,
                GameSearchCriteria.SortField.TITLE, GameSearchCriteria.SortDirection.ASC));
        GameSearchResult maximumOnly = gameRepository.search(new GameSearchCriteria(
                null, List.of(), null, null, 2, 0, 20,
                GameSearchCriteria.SortField.TITLE, GameSearchCriteria.SortDirection.ASC));

        assertEquals(2, result.totalItems());
        assertEquals(Set.of(lowerBound, upperBound), result.items().stream()
                .map(PersistedGame::id)
                .collect(java.util.stream.Collectors.toSet()));
        assertEquals(Set.of(lowerBound, upperBound), minimumOnly.items().stream()
                .map(PersistedGame::id)
                .collect(java.util.stream.Collectors.toSet()));
        assertEquals(2, maximumOnly.totalItems());
    }

    @Test
    void sortsBothFieldsAndKeepsIdAscendingForTiesInEitherDirection() {
        long firstAlpha = saveGame("Alpha", 2000, "Nintendo Switch", null, null, null);
        long secondAlpha = saveGame("alpha", 2000, "Nintendo Switch", null, null, null);
        long beta = saveGame("Beta", 1990, "Nintendo Switch", null, null, null);

        assertEquals(
                List.of(firstAlpha, secondAlpha, beta),
                gameRepository.search(criteria(null)).items().stream().map(PersistedGame::id).toList());
        assertEquals(
                List.of(beta, firstAlpha, secondAlpha),
                gameRepository.search(criteria(null, GameSearchCriteria.SortField.ORIGINAL_RELEASE_YEAR,
                        GameSearchCriteria.SortDirection.ASC))
                        .items().stream().map(PersistedGame::id).toList());
        assertEquals(
                List.of(firstAlpha, secondAlpha, beta),
                gameRepository.search(criteria(null, GameSearchCriteria.SortField.ORIGINAL_RELEASE_YEAR,
                        GameSearchCriteria.SortDirection.DESC))
                        .items().stream().map(PersistedGame::id).toList());
        assertEquals(
                List.of(beta, firstAlpha, secondAlpha),
                gameRepository.search(criteria(null, GameSearchCriteria.SortField.TITLE,
                        GameSearchCriteria.SortDirection.DESC))
                        .items().stream().map(PersistedGame::id).toList());
    }

    @Test
    void paginatesResultsAndCountsBeforePaginationIncludingEmptyPages() {
        long first = saveGame("First", 2000, "Nintendo Switch", null, null, null);
        long second = saveGame("Second", 2001, "Nintendo Switch", null, null, null);
        long third = saveGame("Third", 2002, "Nintendo Switch", null, null, null);

        GameSearchResult secondPage = gameRepository.search(criteria(
                null, GameSearchCriteria.SortField.TITLE, GameSearchCriteria.SortDirection.ASC, 1, 2));
        GameSearchResult beyondLastPage = gameRepository.search(criteria(
                null, GameSearchCriteria.SortField.TITLE, GameSearchCriteria.SortDirection.ASC, 3, 2));
        GameSearchResult emptyCollection = gameRepository.search(criteria(
                "no matching title", GameSearchCriteria.SortField.TITLE, GameSearchCriteria.SortDirection.ASC, 0, 2));

        assertEquals(3, secondPage.totalItems());
        assertEquals(List.of(third), secondPage.items().stream().map(PersistedGame::id).toList());
        assertEquals(3, beyondLastPage.totalItems());
        assertTrue(beyondLastPage.items().isEmpty());
        assertEquals(0, emptyCollection.totalItems());
        assertTrue(emptyCollection.items().isEmpty());
        assertEquals(List.of(first, second, third),
                gameRepository.search(criteria(null)).items().stream().map(PersistedGame::id).toList());
    }

    @Test
    void replacesAllGameFieldsAndConsoleAssociations() {
        Console initialConsole = new Console("Nintendo Switch");
        Console replacementConsole = new Console("Sony PlayStation 5");
        long id = gameRepository.save(new Game(
                "Original Game",
                Year.of(2018),
                Set.of(initialConsole),
                EsrbRating.E,
                2,
                URI.create("https://example.com/original.jpg"),
                "Original note."));
        Game replacement = new Game(
                "Updated Game",
                Year.of(2022),
                Set.of(replacementConsole),
                null,
                null,
                null,
                null);

        assertTrue(gameRepository.replace(id, replacement));

        assertEquals(replacement, gameRepository.findById(id).orElseThrow());
        assertEquals(1, jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM game_consoles WHERE game_id = ?",
                Integer.class,
                id));
        assertEquals(
                replacementConsole.name(),
                jdbcTemplate.queryForObject(
                        """
                                SELECT c.name
                                FROM game_consoles gc JOIN consoles c ON c.id = gc.console_id
                                WHERE gc.game_id = ?
                                """,
                        String.class,
                        id));
    }

    @Test
    void rejectsUnsupportedReplacementWithoutChangingPersistedGame() {
        Game original = new Game(
                "Original Game",
                Year.of(2018),
                Set.of(new Console("Nintendo Switch")),
                null,
                null,
                null,
                null);
        long id = gameRepository.save(original);
        Game replacement = new Game(
                "Invalid Replacement",
                Year.of(2022),
                Set.of(new Console("Unseeded Console")),
                null,
                null,
                null,
                null);

        assertThrows(IllegalArgumentException.class, () -> gameRepository.replace(id, replacement));

        assertEquals(original, gameRepository.findById(id).orElseThrow());
        assertEquals(1, jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM game_consoles WHERE game_id = ?",
                Integer.class,
                id));
    }

    @Test
    void returnsFalseWhenReplacingGameThatDoesNotExist() {
        assertFalse(gameRepository.replace(123L, new Game(
                "Example Game",
                Year.of(2020),
                Set.of(new Console("Nintendo Switch")),
                null,
                null,
                null,
                null)));
    }

    @Test
    void deletesGameAndCascadesItsConsoleAssociations() {
        long id = gameRepository.save(new Game(
                "Example Game",
                Year.of(2020),
                Set.of(new Console("Nintendo Switch")),
                null,
                null,
                null,
                null));

        assertTrue(gameRepository.deleteById(id));
        assertTrue(gameRepository.findById(id).isEmpty());
        assertEquals(0, jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM game_consoles WHERE game_id = ?",
                Integer.class,
                id));
    }

    @Test
    void returnsFalseWhenDeletingGameThatDoesNotExist() {
        assertFalse(gameRepository.deleteById(123L));
    }

    @Test
    void returnsEmptyWhenGameDoesNotExist() {
        assertTrue(gameRepository.findById(123L).isEmpty());
    }

    @Test
    void rejectsGameWithConsoleOutsideThePersistedCatalogAndRollsBack() {
        Game game = new Game(
                "Example Game",
                Year.of(2020),
                Set.of(new Console("Unseeded Console")),
                null,
                null,
                null,
                null);

        assertThrows(IllegalArgumentException.class, () -> gameRepository.save(game));
        assertEquals(0, jdbcTemplate.queryForObject("SELECT COUNT(*) FROM games", Integer.class));
    }

    @Test
    void rejectsGameWithoutConsoleAssociationAtDatabaseCommit() {
        assertThrows(DataIntegrityViolationException.class, () -> jdbcTemplate.update(
                """
                        INSERT INTO games (title, original_release_year)
                        VALUES (?, ?)
                        """,
                "No Console",
                2020));
    }

    @Test
    void rejectsOrphanedAndDuplicateConsoleAssociations() {
        Console console = insertConsole("Test Console");
        long id = gameRepository.save(new Game(
                "Example Game",
                Year.of(2020),
                Set.of(console),
                null,
                null,
                null,
                null));
        long consoleId = jdbcTemplate.queryForObject(
                "SELECT id FROM consoles WHERE name = ?",
                Long.class,
                console.name());

        assertThrows(DataIntegrityViolationException.class, () -> jdbcTemplate.update(
                "INSERT INTO game_consoles (game_id, console_id) VALUES (?, ?)",
                id,
                consoleId));
        assertThrows(DataIntegrityViolationException.class, () -> jdbcTemplate.update(
                "INSERT INTO game_consoles (game_id, console_id) VALUES (?, ?)",
                Long.MAX_VALUE,
                consoleId));
        assertThrows(DataIntegrityViolationException.class, () -> jdbcTemplate.update(
                "DELETE FROM game_consoles WHERE game_id = ? AND console_id = ?",
                id,
                consoleId));
        assertFalse(gameRepository.findById(id).isEmpty());
        assertEquals(1, jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM game_consoles WHERE game_id = ?",
                Integer.class,
                id));
    }

    @Test
    void rejectsInvalidDomainValuesAtDatabaseBoundary() {
        assertThrows(DataIntegrityViolationException.class, () -> jdbcTemplate.update(
                "INSERT INTO games (title, original_release_year) VALUES (?, ?)",
                " ",
                2020));
        assertThrows(DataIntegrityViolationException.class, () -> jdbcTemplate.update(
                "INSERT INTO games (title, original_release_year, esrb_rating) VALUES (?, ?, ?)",
                "Example",
                2020,
                "UNRATED"));
        assertThrows(DataIntegrityViolationException.class, () -> jdbcTemplate.update(
                """
                        INSERT INTO games (title, original_release_year, max_local_multiplayer_players)
                        VALUES (?, ?, ?)
                        """,
                "Example",
                2020,
                0));
    }

    @Test
    void rejectsBlankAndDuplicateConsoleNames() {
        insertConsole("Test Console");

        assertThrows(DataIntegrityViolationException.class,
                () -> jdbcTemplate.update("INSERT INTO consoles (name) VALUES (?)", " "));
        assertThrows(DataIntegrityViolationException.class,
                () -> jdbcTemplate.update("INSERT INTO consoles (name) VALUES (?)", "Test Console"));
    }

    private Console insertConsole(String name) {
        jdbcTemplate.update("INSERT INTO consoles (name) VALUES (?)", name);
        return new Console(name);
    }

    private long saveGame(String title, int year, String consoleName, EsrbRating rating, Integer players, String comments) {
        return gameRepository.save(new Game(
                title,
                Year.of(year),
                Set.of(new Console(consoleName)),
                rating,
                players,
                null,
                comments));
    }

    private static GameSearchCriteria criteria(String keyword) {
        return criteria(keyword, GameSearchCriteria.SortField.TITLE, GameSearchCriteria.SortDirection.ASC, 0, 20);
    }

    private static GameSearchCriteria criteria(
            String keyword,
            GameSearchCriteria.SortField sort,
            GameSearchCriteria.SortDirection direction) {
        return criteria(keyword, sort, direction, 0, 20);
    }

    private static GameSearchCriteria criteria(
            String keyword,
            GameSearchCriteria.SortField sort,
            GameSearchCriteria.SortDirection direction,
            int page,
            int size) {
        return new GameSearchCriteria(keyword, List.of(), null, null, null, page, size, sort, direction);
    }
}

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
}

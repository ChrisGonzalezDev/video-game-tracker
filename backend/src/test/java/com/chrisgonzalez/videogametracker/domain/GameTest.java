package com.chrisgonzalez.videogametracker.domain;

import org.junit.jupiter.api.Test;

import java.net.URI;
import java.time.Year;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class GameTest {

    private static final Console NINTENDO_SWITCH = new Console("Nintendo Switch");
    private static final Console PLAYSTATION_5 = new Console("PlayStation 5");

    @Test
    void acceptsValidGameWithOptionalFieldsAbsent() {
        Game game = validGame("The Legend of Zelda", Year.of(1986), Set.of(NINTENDO_SWITCH));

        assertEquals("The Legend of Zelda", game.title());
        assertEquals(Year.of(1986), game.originalReleaseYear());
        assertEquals(Set.of(NINTENDO_SWITCH), game.consoles());
        assertNull(game.esrbRating());
        assertNull(game.maxLocalMultiplayerPlayers());
        assertNull(game.coverImageUrl());
        assertNull(game.personalComments());
    }

    @Test
    void acceptsOptionalFieldsAndMultipleConsoles() {
        Game game = new Game(
                "Example Game",
                Year.of(2020),
                Set.of(NINTENDO_SWITCH, PLAYSTATION_5),
                EsrbRating.E10_PLUS,
                4,
                URI.create("https://example.com/cover.jpg"),
                "A personal note."
        );

        assertEquals(Set.of(NINTENDO_SWITCH, PLAYSTATION_5), game.consoles());
        assertEquals(EsrbRating.E10_PLUS, game.esrbRating());
        assertEquals("E10+", game.esrbRating().value());
        assertEquals(4, game.maxLocalMultiplayerPlayers());
        assertEquals(URI.create("https://example.com/cover.jpg"), game.coverImageUrl());
        assertEquals("A personal note.", game.personalComments());
    }

    @Test
    void acceptsEmptyPersonalComments() {
        assertEquals("", validGame("Example", Year.of(2000), Set.of(NINTENDO_SWITCH),
                null, null, null, "").personalComments());
    }

    @Test
    void rejectsNullTitle() {
        assertThrows(NullPointerException.class,
                () -> validGame(null, Year.of(2000), Set.of(NINTENDO_SWITCH)));
    }

    @Test
    void rejectsBlankTitle() {
        assertThrows(IllegalArgumentException.class,
                () -> validGame(" \t ", Year.of(2000), Set.of(NINTENDO_SWITCH)));
    }

    @Test
    void rejectsNullReleaseYear() {
        assertThrows(NullPointerException.class,
                () -> validGame("Example", null, Set.of(NINTENDO_SWITCH)));
    }

    @Test
    void rejectsReleaseYearWithFewerThanFourDigits() {
        assertThrows(IllegalArgumentException.class,
                () -> validGame("Example", Year.of(999), Set.of(NINTENDO_SWITCH)));
    }

    @Test
    void rejectsFutureReleaseYear() {
        assertThrows(IllegalArgumentException.class,
                () -> validGame("Example", Year.now().plusYears(1), Set.of(NINTENDO_SWITCH)));
    }

    @Test
    void rejectsNullConsoleCollection() {
        assertThrows(NullPointerException.class,
                () -> validGame("Example", Year.of(2000), null));
    }

    @Test
    void rejectsEmptyConsoleCollection() {
        assertThrows(IllegalArgumentException.class,
                () -> validGame("Example", Year.of(2000), Set.of()));
    }

    @Test
    void copiesConsoleCollectionToPreventExternalMutation() {
        Set<Console> consoles = new java.util.HashSet<>(Set.of(NINTENDO_SWITCH));
        Game game = validGame("Example", Year.of(2000), consoles);

        consoles.add(PLAYSTATION_5);

        assertEquals(Set.of(NINTENDO_SWITCH), game.consoles());
        assertThrows(UnsupportedOperationException.class,
                () -> game.consoles().add(PLAYSTATION_5));
    }

    @Test
    void supportsOnlyTheDefinedEsrbRatings() {
        assertEquals(Set.of(EsrbRating.EC, EsrbRating.E, EsrbRating.E10_PLUS,
                        EsrbRating.T, EsrbRating.M, EsrbRating.AO, EsrbRating.RP),
                Set.of(EsrbRating.values()));
        assertEquals(EsrbRating.E10_PLUS, EsrbRating.fromValue("E10+"));
        assertThrows(IllegalArgumentException.class, () -> EsrbRating.fromValue("UNRATED"));
    }

    @Test
    void acceptsOnlyPositiveLocalPlayerCounts() {
        assertEquals(1, validGame("Example", Year.of(2000), Set.of(NINTENDO_SWITCH),
                null, 1, null, null).maxLocalMultiplayerPlayers());
        assertThrows(IllegalArgumentException.class, () -> validGame(
                "Example", Year.of(2000), Set.of(NINTENDO_SWITCH), null, 0, null, null));
        assertThrows(IllegalArgumentException.class, () -> validGame(
                "Example", Year.of(2000), Set.of(NINTENDO_SWITCH), null, -1, null, null));
    }

    @Test
    void acceptsOnlyAbsoluteHttpOrHttpsCoverUrlsWithAHost() {
        assertDoesNotThrow(() -> validGame("Example", Year.of(2000), Set.of(NINTENDO_SWITCH),
                null, null, URI.create("http://example.com/cover.png"), null));
        assertDoesNotThrow(() -> validGame("Example", Year.of(2000), Set.of(NINTENDO_SWITCH),
                null, null, URI.create("https://example.com/cover.png"), null));

        assertThrows(IllegalArgumentException.class, () -> validGame(
                "Example", Year.of(2000), Set.of(NINTENDO_SWITCH), null, null,
                URI.create("/cover.png"), null));
        assertThrows(IllegalArgumentException.class, () -> validGame(
                "Example", Year.of(2000), Set.of(NINTENDO_SWITCH), null, null,
                URI.create("ftp://example.com/cover.png"), null));
        assertThrows(IllegalArgumentException.class, () -> validGame(
                "Example", Year.of(2000), Set.of(NINTENDO_SWITCH), null, null,
                URI.create("http:cover.png"), null));
    }

    @Test
    void acceptsLongTextWithoutAnArbitraryMaximumLength() {
        String longTitle = "T".repeat(10_000);
        String longComment = "C".repeat(10_000);

        Game game = validGame(longTitle, Year.of(2000), Set.of(NINTENDO_SWITCH),
                null, null, null, longComment);

        assertEquals(longTitle, game.title());
        assertEquals(longComment, game.personalComments());
    }

    private static Game validGame(String title, Year releaseYear, Set<Console> consoles) {
        return validGame(title, releaseYear, consoles, null, null, null, null);
    }

    private static Game validGame(
            String title,
            Year releaseYear,
            Set<Console> consoles,
            EsrbRating rating,
            Integer maxLocalPlayers,
            URI coverImageUrl,
            String personalComments
    ) {
        return new Game(title, releaseYear, consoles, rating, maxLocalPlayers,
                coverImageUrl, personalComments);
    }
}

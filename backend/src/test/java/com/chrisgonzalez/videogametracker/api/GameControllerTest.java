package com.chrisgonzalez.videogametracker.api;

import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.chrisgonzalez.videogametracker.domain.Console;
import com.chrisgonzalez.videogametracker.domain.EsrbRating;
import com.chrisgonzalez.videogametracker.domain.Game;
import com.chrisgonzalez.videogametracker.persistence.ConsoleRepository;
import com.chrisgonzalez.videogametracker.persistence.GameRepository;
import com.chrisgonzalez.videogametracker.persistence.PersistedGame;
import java.net.URI;
import java.time.Year;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@WebMvcTest(GameController.class)
@Import(ApiExceptionHandler.class)
class GameControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private GameRepository gameRepository;

    @MockitoBean
    private ConsoleRepository consoleRepository;

    @Test
    void returnsGameWithIdAndAllContractFields() throws Exception {
        Game game = new Game(
                "Example Game",
                Year.of(2020),
                Set.of(new Console("Nintendo Switch"), new Console("Atari 2600")),
                EsrbRating.E10_PLUS,
                4,
                URI.create("https://example.com/cover.jpg"),
                "A personal note.");
        when(gameRepository.findPersistedById(42L)).thenReturn(Optional.of(new PersistedGame(42L, game)));

        mockMvc.perform(get("/api/v1/games/42"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.title").value("Example Game"))
                .andExpect(jsonPath("$.originalReleaseYear").value(2020))
                .andExpect(jsonPath("$.consoles[0].name").value("Atari 2600"))
                .andExpect(jsonPath("$.consoles[1].name").value("Nintendo Switch"))
                .andExpect(jsonPath("$.esrbRating").value("E10+"))
                .andExpect(jsonPath("$.maxLocalMultiplayerPlayers").value(4))
                .andExpect(jsonPath("$.coverImageUrl").value("https://example.com/cover.jpg"))
                .andExpect(jsonPath("$.personalComments").value("A personal note."));
    }

    @Test
    void returnsContractErrorWhenGameDoesNotExist() throws Exception {
        when(gameRepository.findPersistedById(42L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/games/42"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("GAME_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Game with the specified identifier was not found."))
                .andExpect(jsonPath("$.details").isArray())
                .andExpect(jsonPath("$.details").isEmpty());
    }

    @Test
    void returnsContractErrorForInvalidGameId() throws Exception {
        mockMvc.perform(get("/api/v1/games/not-an-id"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
                .andExpect(jsonPath("$.details[0].field").value("id"));
    }

    @Test
    void returnsContractErrorForNonPositiveGameId() throws Exception {
        mockMvc.perform(get("/api/v1/games/0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"));
    }

    @Test
    void returnsContractErrorForGameIdOutsideLongRange() throws Exception {
        mockMvc.perform(get("/api/v1/games/9223372036854775808"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"));
    }

    @Test
    void returnsContractErrorWhenAnUnexpectedFailureOccurs() throws Exception {
        doThrow(new IllegalStateException("database failure"))
                .when(gameRepository).findPersistedById(42L);

        mockMvc.perform(get("/api/v1/games/42"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("INTERNAL_SERVER_ERROR"))
                .andExpect(jsonPath("$.details").isEmpty());
    }

    @Test
    void includesNullOptionalFieldsInGameResponse() throws Exception {
        Game game = new Game(
                "Example Game",
                Year.of(2020),
                Set.of(new Console("Nintendo Switch")),
                null,
                null,
                null,
                null);
        when(gameRepository.findPersistedById(42L)).thenReturn(Optional.of(new PersistedGame(42L, game)));

        mockMvc.perform(get("/api/v1/games/42"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.esrbRating").value(org.hamcrest.Matchers.nullValue()))
                .andExpect(jsonPath("$.maxLocalMultiplayerPlayers").value(org.hamcrest.Matchers.nullValue()))
                .andExpect(jsonPath("$.coverImageUrl").value(org.hamcrest.Matchers.nullValue()))
                .andExpect(jsonPath("$.personalComments").value(org.hamcrest.Matchers.nullValue()));
    }

    @Test
    void listsConsolesAsContractObjectsInAscendingNameOrder() throws Exception {
        when(consoleRepository.findAll()).thenReturn(List.of(
                new Console("Nintendo Switch"),
                new Console("Atari 2600")));

        mockMvc.perform(get("/api/v1/consoles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Atari 2600"))
                .andExpect(jsonPath("$[1].name").value("Nintendo Switch"));
    }

    @Test
    void createsGameWithLocationAndCompleteRepresentation() throws Exception {
        when(consoleRepository.findAll()).thenReturn(List.of(new Console("Nintendo Switch")));
        when(gameRepository.save(any(Game.class))).thenReturn(42L);

        mockMvc.perform(post("/api/v1/games")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Example Game",
                                  "originalReleaseYear": 2020,
                                  "consoles": [{"name": "Nintendo Switch"}],
                                  "esrbRating": "E10+",
                                  "maxLocalMultiplayerPlayers": 4,
                                  "coverImageUrl": "https://example.com/cover.jpg",
                                  "personalComments": "A personal note."
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header()
                        .string("Location", org.hamcrest.Matchers.endsWith("/api/v1/games/42")))
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.title").value("Example Game"))
                .andExpect(jsonPath("$.consoles[0].name").value("Nintendo Switch"))
                .andExpect(jsonPath("$.esrbRating").value("E10+"))
                .andExpect(jsonPath("$.maxLocalMultiplayerPlayers").value(4))
                .andExpect(jsonPath("$.coverImageUrl").value("https://example.com/cover.jpg"))
                .andExpect(jsonPath("$.personalComments").value("A personal note."));

        verify(gameRepository).save(new Game(
                "Example Game",
                Year.of(2020),
                Set.of(new Console("Nintendo Switch")),
                EsrbRating.E10_PLUS,
                4,
                URI.create("https://example.com/cover.jpg"),
                "A personal note."));
    }

    @Test
    void rejectsInvalidCreateInputWithoutPersisting() throws Exception {
        when(consoleRepository.findAll()).thenReturn(List.of(new Console("Nintendo Switch")));

        mockMvc.perform(post("/api/v1/games")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "title": " ",
                                  "originalReleaseYear": 2020,
                                  "consoles": [{"name": "Nintendo Switch"}]
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
                .andExpect(jsonPath("$.details[0].field").value("title"));
        verify(gameRepository, never()).save(any(Game.class));
    }

    @Test
    void rejectsUnsupportedConsoleAndUnknownFields() throws Exception {
        when(consoleRepository.findAll()).thenReturn(List.of(new Console("Nintendo Switch")));
        String request = """
                {
                  "title": "Example Game",
                  "originalReleaseYear": 2020,
                  "consoles": [{"name": "Unlisted Console"}]
                }
                """;

        mockMvc.perform(post("/api/v1/games").contentType(APPLICATION_JSON).content(request))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details[0].field").value("consoles"));

        mockMvc.perform(post("/api/v1/games")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Example Game",
                                  "originalReleaseYear": 2020,
                                  "consoles": [{"name": "Nintendo Switch"}],
                                  "unexpected": true
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details[0].field").value("body"));
        verify(gameRepository, never()).save(any(Game.class));
    }

    @Test
    void rejectsFutureYearsAndInvalidOptionalValues() throws Exception {
        when(consoleRepository.findAll()).thenReturn(List.of(new Console("Nintendo Switch")));
        List<String> invalidRequests = List.of(
                """
                        {
                          "title": "Example Game",
                          "originalReleaseYear": 9999,
                          "consoles": [{"name": "Nintendo Switch"}]
                        }
                        """,
                """
                        {
                          "title": "Example Game",
                          "originalReleaseYear": 2020,
                          "consoles": [{"name": "Nintendo Switch"}],
                          "esrbRating": "UNRATED"
                        }
                        """,
                """
                        {
                          "title": "Example Game",
                          "originalReleaseYear": 2020,
                          "consoles": [{"name": "Nintendo Switch"}],
                          "maxLocalMultiplayerPlayers": 0
                        }
                        """,
                """
                        {
                          "title": "Example Game",
                          "originalReleaseYear": 2020,
                          "consoles": [{"name": "Nintendo Switch"}],
                          "coverImageUrl": "ftp://example.com/cover.jpg"
                        }
                        """);

        for (String request : invalidRequests) {
            mockMvc.perform(post("/api/v1/games").contentType(APPLICATION_JSON).content(request))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("INVALID_REQUEST"));
        }
        verify(gameRepository, never()).save(any(Game.class));
    }

    @Test
    void returnsBadRequestForMalformedJson() throws Exception {
        mockMvc.perform(post("/api/v1/games")
                        .contentType(APPLICATION_JSON)
                        .content("{invalid"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
                .andExpect(jsonPath("$.details[0].field").value("body"));
    }

    @Test
    void replacesGameAndClearsOmittedOptionalFields() throws Exception {
        when(consoleRepository.findAll()).thenReturn(List.of(new Console("Nintendo Switch")));
        when(gameRepository.replace(eq(42L), any(Game.class))).thenReturn(true);

        mockMvc.perform(put("/api/v1/games/42")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Updated Game",
                                  "originalReleaseYear": 2021,
                                  "consoles": [{"name": "Nintendo Switch"}]
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.title").value("Updated Game"))
                .andExpect(jsonPath("$.originalReleaseYear").value(2021))
                .andExpect(jsonPath("$.esrbRating").value(org.hamcrest.Matchers.nullValue()))
                .andExpect(jsonPath("$.maxLocalMultiplayerPlayers").value(org.hamcrest.Matchers.nullValue()))
                .andExpect(jsonPath("$.coverImageUrl").value(org.hamcrest.Matchers.nullValue()))
                .andExpect(jsonPath("$.personalComments").value(org.hamcrest.Matchers.nullValue()));

        verify(gameRepository).replace(42L, new Game(
                "Updated Game",
                Year.of(2021),
                Set.of(new Console("Nintendo Switch")),
                null,
                null,
                null,
                null));
    }

    @Test
    void acceptsExplicitNullOptionalFieldsOnReplacement() throws Exception {
        when(consoleRepository.findAll()).thenReturn(List.of(new Console("Nintendo Switch")));
        when(gameRepository.replace(eq(42L), any(Game.class))).thenReturn(true);

        mockMvc.perform(put("/api/v1/games/42")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Updated Game",
                                  "originalReleaseYear": 2021,
                                  "consoles": [{"name": "Nintendo Switch"}],
                                  "esrbRating": null,
                                  "maxLocalMultiplayerPlayers": null,
                                  "coverImageUrl": null,
                                  "personalComments": null
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.esrbRating").value(org.hamcrest.Matchers.nullValue()))
                .andExpect(jsonPath("$.maxLocalMultiplayerPlayers").value(org.hamcrest.Matchers.nullValue()))
                .andExpect(jsonPath("$.coverImageUrl").value(org.hamcrest.Matchers.nullValue()))
                .andExpect(jsonPath("$.personalComments").value(org.hamcrest.Matchers.nullValue()));
    }

    @Test
    void returnsNotFoundWhenReplacingOrDeletingMissingGame() throws Exception {
        when(consoleRepository.findAll()).thenReturn(List.of(new Console("Nintendo Switch")));
        when(gameRepository.replace(eq(42L), any(Game.class))).thenReturn(false);
        when(gameRepository.deleteById(42L)).thenReturn(false);
        String request = """
                {
                  "title": "Example Game",
                  "originalReleaseYear": 2020,
                  "consoles": [{"name": "Nintendo Switch"}]
                }
                """;

        mockMvc.perform(put("/api/v1/games/42").contentType(APPLICATION_JSON).content(request))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("GAME_NOT_FOUND"));

        mockMvc.perform(delete("/api/v1/games/42"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("GAME_NOT_FOUND"));
    }

    @Test
    void deletesGameWithBodylessNoContentResponse() throws Exception {
        when(gameRepository.deleteById(42L)).thenReturn(true);

        mockMvc.perform(delete("/api/v1/games/42"))
                .andExpect(status().isNoContent())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.content().string(""));
        verify(gameRepository).deleteById(42L);
    }

    @Test
    void returnsBadRequestForInvalidMutationIds() throws Exception {
        mockMvc.perform(delete("/api/v1/games/0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"));
    }

    @Test
    void returnsInternalServerErrorWhenMutationFailsUnexpectedly() throws Exception {
        doThrow(new IllegalStateException("database failure")).when(gameRepository).deleteById(42L);

        mockMvc.perform(delete("/api/v1/games/42"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("INTERNAL_SERVER_ERROR"));
    }
}

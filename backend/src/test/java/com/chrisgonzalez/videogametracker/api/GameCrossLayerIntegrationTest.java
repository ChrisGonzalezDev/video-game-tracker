package com.chrisgonzalez.videogametracker.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.ServerSocket;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.yaml.snakeyaml.LoaderOptions;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.constructor.SafeConstructor;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("local")
@Testcontainers
class GameCrossLayerIntegrationTest {

    private static final Path REPOSITORY_ROOT = findRepositoryRoot();
    @Container
    private static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("postgres:17.6-alpine");
    private static final OpenApiContract CONTRACT = OpenApiContract.load(
            REPOSITORY_ROOT.resolve("contracts/openapi.yaml"));

    @DynamicPropertySource
    static void configureDataSource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @LocalServerPort
    private int backendPort;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private Flyway flyway;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void clearDatabase() {
        jdbcTemplate.execute("TRUNCATE TABLE games RESTART IDENTITY CASCADE");
    }

    @Test
    void backendHttpApiPersistsGamesAndMatchesOpenApiContract() {
        assertEquals(2, flyway.info().applied().length);

        JsonNode gameWrite = gameWrite("Backend HTTP Integration Game");
        CONTRACT.assertRequest("post", "/games", gameWrite);

        ResponseEntity<JsonNode> created = request(
                backendBaseUrl().resolve("games"),
                HttpMethod.POST,
                gameWrite);

        assertEquals(HttpStatus.CREATED, created.getStatusCode());
        assertNotNull(created.getHeaders().getLocation());
        CONTRACT.assertResponse("post", "/games", created.getStatusCode(), created.getBody());
        long gameId = created.getBody().path("id").asLong();
        assertTrue(gameId > 0);

        ResponseEntity<JsonNode> retrieved = request(
                backendBaseUrl().resolve("games/" + gameId),
                HttpMethod.GET,
                null);

        assertEquals(HttpStatus.OK, retrieved.getStatusCode());
        CONTRACT.assertResponse("get", "/games/{id}", retrieved.getStatusCode(), retrieved.getBody());
        assertEquals("Backend HTTP Integration Game", retrieved.getBody().path("title").asText());
        assertEquals(2, retrieved.getBody().path("consoles").size());

        ResponseEntity<JsonNode> search = request(
                backendBaseUrl().resolve("games?keyword=Backend%20HTTP%20Integration"),
                HttpMethod.GET,
                null);

        assertEquals(HttpStatus.OK, search.getStatusCode());
        CONTRACT.assertResponse("get", "/games", search.getStatusCode(), search.getBody());
        assertEquals(1, search.getBody().path("totalItems").asInt());

        ResponseEntity<JsonNode> consoles = request(
                backendBaseUrl().resolve("consoles"),
                HttpMethod.GET,
                null);

        assertEquals(HttpStatus.OK, consoles.getStatusCode());
        CONTRACT.assertResponse("get", "/consoles", consoles.getStatusCode(), consoles.getBody());

        ResponseEntity<JsonNode> deleted = request(
                backendBaseUrl().resolve("games/" + gameId),
                HttpMethod.DELETE,
                null);

        assertEquals(HttpStatus.NO_CONTENT, deleted.getStatusCode());
        CONTRACT.assertResponse("delete", "/games/{id}", deleted.getStatusCode(), deleted.getBody());

        ResponseEntity<JsonNode> missing = request(
                backendBaseUrl().resolve("games/" + gameId),
                HttpMethod.GET,
                null);

        assertEquals(HttpStatus.NOT_FOUND, missing.getStatusCode());
        CONTRACT.assertResponse("get", "/games/{id}", missing.getStatusCode(), missing.getBody());
    }

    @Test
    void bffForwardsHttpRequestsToBackendAndPreservesContractResponses() throws Exception {
        try (BffProcess bff = BffProcess.start(
                REPOSITORY_ROOT.resolve("bff"),
                backendBaseUrl())) {
            JsonNode gameWrite = gameWrite("BFF HTTP Integration Game");
            CONTRACT.assertRequest("post", "/games", gameWrite);

            ResponseEntity<JsonNode> created = request(
                    bff.baseUrl().resolve("/api/v1/games"),
                    HttpMethod.POST,
                    gameWrite);

            assertEquals(HttpStatus.CREATED, created.getStatusCode());
            assertNotNull(created.getHeaders().getLocation());
            CONTRACT.assertResponse("post", "/games", created.getStatusCode(), created.getBody());
            long gameId = created.getBody().path("id").asLong();

            ResponseEntity<JsonNode> retrieved = request(
                    bff.baseUrl().resolve("/api/v1/games/" + gameId),
                    HttpMethod.GET,
                    null);

            assertEquals(HttpStatus.OK, retrieved.getStatusCode());
            CONTRACT.assertResponse("get", "/games/{id}", retrieved.getStatusCode(), retrieved.getBody());
            assertEquals("BFF HTTP Integration Game", retrieved.getBody().path("title").asText());

            ResponseEntity<JsonNode> missing = request(
                    bff.baseUrl().resolve("/api/v1/games/999999"),
                    HttpMethod.GET,
                    null);

            assertEquals(HttpStatus.NOT_FOUND, missing.getStatusCode());
            CONTRACT.assertResponse("get", "/games/{id}", missing.getStatusCode(), missing.getBody());
            assertEquals("GAME_NOT_FOUND", missing.getBody().path("code").asText());
        }
    }

    private ResponseEntity<JsonNode> request(URI uri, HttpMethod method, JsonNode body) {
        HttpHeaders headers = new HttpHeaders();
        if (body != null) {
            headers.setContentType(MediaType.APPLICATION_JSON);
        }
        return restTemplate.exchange(
                uri,
                method,
                new HttpEntity<>(body, headers),
                JsonNode.class);
    }

    private URI backendBaseUrl() {
        return URI.create("http://127.0.0.1:" + backendPort + "/api/v1/");
    }

    private JsonNode gameWrite(String title) {
        return objectMapper.createObjectNode()
                .put("title", title)
                .put("originalReleaseYear", 2020)
                .put("esrbRating", "E10+")
                .put("maxLocalMultiplayerPlayers", 4)
                .put("coverImageUrl", "https://example.com/cover.jpg")
                .put("personalComments", "Created by the cross-layer integration test.")
                .set("consoles", objectMapper.createArrayNode()
                        .add(objectMapper.createObjectNode().put("name", "Nintendo Switch"))
                        .add(objectMapper.createObjectNode().put("name", "Sony PlayStation 5")));
    }

    private static Path findRepositoryRoot() {
        Path directory = Path.of("").toAbsolutePath();
        while (directory != null) {
            if (Files.isRegularFile(directory.resolve("contracts/openapi.yaml"))) {
                return directory;
            }
            directory = directory.getParent();
        }
        throw new IllegalStateException("Could not locate contracts/openapi.yaml from the test working directory.");
    }

    private static final class BffProcess implements AutoCloseable {
        private static final Duration STARTUP_TIMEOUT = Duration.ofSeconds(20);
        private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(1))
                .build();

        private final Process process;
        private final URI baseUrl;
        private final StringBuffer output = new StringBuffer();
        private final Thread outputReader;
        private volatile IOException outputFailure;

        private BffProcess(Process process, URI baseUrl) {
            this.process = process;
            this.baseUrl = baseUrl;
            this.outputReader = new Thread(this::captureOutput, "bff-integration-output");
            this.outputReader.setDaemon(true);
            this.outputReader.start();
        }

        static BffProcess start(Path bffDirectory, URI backendUrl) throws Exception {
            int port = findAvailablePort();
            ProcessBuilder builder = new ProcessBuilder(
                    "node",
                    "node_modules/tsx/dist/cli.mjs",
                    "src/index.ts");
            builder.directory(bffDirectory.toFile());
            builder.redirectErrorStream(true);
            builder.environment().put("BACKEND_API_URL", backendUrl.toString());
            builder.environment().put("PORT", Integer.toString(port));

            Process process = builder.start();
            URI baseUrl = URI.create("http://127.0.0.1:" + port);
            BffProcess bff = new BffProcess(process, baseUrl);
            try {
                bff.awaitHealthy();
                return bff;
            } catch (Exception exception) {
                try {
                    bff.close();
                } catch (InterruptedException cleanupException) {
                    exception.addSuppressed(cleanupException);
                    Thread.currentThread().interrupt();
                }
                throw exception;
            }
        }

        URI baseUrl() {
            return baseUrl;
        }

        private void awaitHealthy() throws Exception {
            Instant deadline = Instant.now().plus(STARTUP_TIMEOUT);
            IOException lastConnectionFailure = null;

            while (Instant.now().isBefore(deadline)) {
                if (!process.isAlive()) {
                    throw startupFailure("BFF process exited before becoming healthy.", lastConnectionFailure);
                }
                try {
                    HttpResponse<String> response = HTTP_CLIENT.send(
                            HttpRequest.newBuilder(baseUrl.resolve("/health"))
                                    .timeout(Duration.ofSeconds(2))
                                    .GET()
                                    .build(),
                            HttpResponse.BodyHandlers.ofString());
                    if (response.statusCode() == 200 && response.body().contains("\"status\":\"ok\"")) {
                        return;
                    }
                    throw startupFailure(
                            "BFF health endpoint returned HTTP " + response.statusCode() + ".",
                            lastConnectionFailure);
                } catch (IOException exception) {
                    lastConnectionFailure = exception;
                    Thread.sleep(100);
                }
            }

            throw startupFailure("BFF did not become healthy within " + STARTUP_TIMEOUT + ".", lastConnectionFailure);
        }

        private IllegalStateException startupFailure(String message, Throwable cause) {
            String details = output.toString();
            if (outputFailure != null) {
                details += System.lineSeparator() + "Could not read BFF output: " + outputFailure;
            }
            return new IllegalStateException(message + System.lineSeparator() + details, cause);
        }

        @Override
        public void close() throws InterruptedException {
            process.destroy();
            if (!process.waitFor(5, java.util.concurrent.TimeUnit.SECONDS)) {
                process.destroyForcibly();
                assertTrue(
                        process.waitFor(5, java.util.concurrent.TimeUnit.SECONDS),
                        "BFF process did not stop after it was terminated.");
            }
            assertFalse(process.isAlive(), "BFF process is still running after cleanup.");
            outputReader.join(5_000);
            assertFalse(outputReader.isAlive(), "BFF output reader did not stop after the process exited.");
        }

        private void captureOutput() {
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append(System.lineSeparator());
                }
            } catch (IOException exception) {
                outputFailure = exception;
            }
        }

        private static int findAvailablePort() throws IOException {
            try (ServerSocket socket = new ServerSocket(0)) {
                return socket.getLocalPort();
            }
        }
    }

    private static final class OpenApiContract {
        private final Map<?, ?> document;
        private final ObjectMapper objectMapper = new ObjectMapper();

        private OpenApiContract(Map<?, ?> document) {
            this.document = document;
        }

        static OpenApiContract load(Path path) {
            try (var input = Files.newInputStream(path)) {
                Object parsed = new Yaml(new SafeConstructor(new LoaderOptions())).load(input);
                return new OpenApiContract(asMap(parsed, "OpenAPI document"));
            } catch (IOException exception) {
                throw new IllegalStateException("Could not read OpenAPI contract at " + path, exception);
            }
        }

        void assertRequest(String method, String path, JsonNode body) {
            Map<?, ?> operation = operation(method, path);
            Map<?, ?> requestBody = asMap(operation.get("requestBody"), method + " " + path + " requestBody");
            Map<?, ?> content = asMap(requestBody.get("content"), method + " " + path + " request content");
            Map<?, ?> jsonContent = asMap(content.get("application/json"), method + " " + path + " JSON request");
            assertMatchesSchema(body, asMap(jsonContent.get("schema"), method + " " + path + " request schema"),
                    "request body");
        }

        void assertResponse(String method, String path, HttpStatusCode status, JsonNode body) {
            Map<?, ?> operation = operation(method, path);
            Map<?, ?> responses = asMap(operation.get("responses"), method + " " + path + " responses");
            Object responseDefinition = responses.get(Integer.toString(status.value()));
            assertNotNull(
                    responseDefinition,
                    method.toUpperCase() + " " + path + " does not declare HTTP " + status.value());

            Map<?, ?> response = resolveComponent(responseDefinition, "responses");
            Object contentValue = response.get("content");
            if (contentValue == null) {
                assertNull(body, method.toUpperCase() + " " + path + " must not return a body");
                return;
            }

            Map<?, ?> content = asMap(contentValue, method + " " + path + " response content");
            Map<?, ?> jsonContent = asMap(content.get("application/json"), method + " " + path + " JSON response");
            assertNotNull(body, method.toUpperCase() + " " + path + " returned no JSON body");
            assertMatchesSchema(body, asMap(jsonContent.get("schema"), method + " " + path + " response schema"),
                    "response body");
        }

        private Map<?, ?> operation(String method, String path) {
            Map<?, ?> paths = asMap(document.get("paths"), "OpenAPI paths");
            Map<?, ?> pathItem = asMap(paths.get(path), "OpenAPI path " + path);
            return asMap(pathItem.get(method.toLowerCase()), "OpenAPI operation " + method + " " + path);
        }

        private Map<?, ?> resolveComponent(Object definition, String componentType) {
            Map<?, ?> map = asMap(definition, "OpenAPI " + componentType + " definition");
            Object reference = map.get("$ref");
            if (!(reference instanceof String referencePath)) {
                return map;
            }
            String prefix = "#/components/" + componentType + "/";
            assertTrue(referencePath.startsWith(prefix), "Unsupported OpenAPI reference: " + referencePath);
            Map<?, ?> components = asMap(document.get("components"), "OpenAPI components");
            Map<?, ?> componentGroup = asMap(components.get(componentType), "OpenAPI " + componentType);
            return asMap(componentGroup.get(referencePath.substring(prefix.length())),
                    "OpenAPI reference " + referencePath);
        }

        private void assertMatchesSchema(JsonNode value, Map<?, ?> schema, String location) {
            Object reference = schema.get("$ref");
            if (reference != null) {
                assertTrue(reference instanceof String, location + " has a non-string schema reference");
                assertMatchesSchema(
                        value,
                        resolveComponent(Map.of("$ref", reference), "schemas"),
                        location);
                return;
            }

            Object oneOfValue = schema.get("oneOf");
            if (oneOfValue != null) {
                List<?> branches = asList(oneOfValue, location + " oneOf");
                boolean matched = false;
                for (Object branch : branches) {
                    try {
                        assertMatchesSchema(value, asMap(branch, location + " oneOf branch"), location);
                        matched = true;
                        break;
                    } catch (AssertionError ignored) {
                        // A nullable or polymorphic schema is valid when one branch accepts the value.
                    }
                }
                assertTrue(matched, location + " does not match any oneOf schema branch");
                return;
            }

            Object typeValue = schema.get("type");
            if (typeValue != null) {
                List<?> types = typeValue instanceof List<?> list ? list : List.of(typeValue);
                boolean validType = types.stream().anyMatch(type -> matchesType(value, type));
                assertTrue(validType, location + " has a value with the wrong OpenAPI type: " + value);
                if (value.isNull()) {
                    return;
                }
            }

            Object enumValue = schema.get("enum");
            if (enumValue != null) {
                boolean allowed = asList(enumValue, location + " enum").stream()
                        .map(objectMapper::valueToTree)
                        .anyMatch(value::equals);
                assertTrue(allowed, location + " has a value outside the OpenAPI enum: " + value);
            }
            if (schema.containsKey("const")) {
                assertEquals(objectMapper.valueToTree(schema.get("const")), value,
                        location + " does not match the OpenAPI const value");
            }

            if (value.isObject()) {
                validateObject(value, schema, location);
            } else if (value.isArray()) {
                validateArray(value, schema, location);
            } else if (value.isTextual()) {
                validateString(value, schema, location);
            } else if (value.isNumber()) {
                validateNumber(value, schema, location);
            }
        }

        private void validateObject(JsonNode value, Map<?, ?> schema, String location) {
            Object requiredValue = schema.get("required");
            if (requiredValue != null) {
                for (Object field : asList(requiredValue, location + " required")) {
                    assertTrue(value.has(String.valueOf(field)),
                            location + " is missing required property " + field);
                }
            }

            Map<?, ?> properties = schema.containsKey("properties")
                    ? asMap(schema.get("properties"), location + " properties")
                    : Map.of();
            if (Boolean.FALSE.equals(schema.get("additionalProperties"))) {
                value.fieldNames().forEachRemaining(field ->
                        assertTrue(properties.containsKey(field),
                                location + " contains undeclared property " + field));
            }
            value.fields().forEachRemaining(field -> {
                Object propertySchema = properties.get(field.getKey());
                if (propertySchema != null) {
                    assertMatchesSchema(
                            field.getValue(),
                            asMap(propertySchema, location + "." + field.getKey() + " schema"),
                            location + "." + field.getKey());
                }
            });
        }

        private void validateArray(JsonNode value, Map<?, ?> schema, String location) {
            if (schema.get("minItems") instanceof Number minimum) {
                assertTrue(value.size() >= minimum.intValue(), location + " has fewer than minItems");
            }
            if (Boolean.TRUE.equals(schema.get("uniqueItems"))) {
                Set<JsonNode> unique = new HashSet<>();
                value.forEach(item -> unique.add(item));
                assertEquals(value.size(), unique.size(), location + " contains duplicate items");
            }
            Object itemSchema = schema.get("items");
            if (itemSchema != null) {
                for (int index = 0; index < value.size(); index++) {
                    assertMatchesSchema(
                            value.get(index),
                            asMap(itemSchema, location + " items schema"),
                            location + "[" + index + "]");
                }
            }
        }

        private void validateString(JsonNode value, Map<?, ?> schema, String location) {
            if (schema.get("minLength") instanceof Number minimum) {
                assertTrue(value.asText().length() >= minimum.intValue(), location + " is shorter than minLength");
            }
            if (schema.get("pattern") instanceof String pattern) {
                assertTrue(value.asText().matches(pattern), location + " does not match its OpenAPI pattern");
            }
            if ("uri".equals(schema.get("format"))) {
                URI uri = URI.create(value.asText());
                assertTrue(uri.isAbsolute(), location + " is not an absolute URI");
            }
        }

        private void validateNumber(JsonNode value, Map<?, ?> schema, String location) {
            if (schema.get("minimum") instanceof Number minimum) {
                assertTrue(value.asDouble() >= minimum.doubleValue(), location + " is below minimum");
            }
            if (schema.get("maximum") instanceof Number maximum) {
                assertTrue(value.asDouble() <= maximum.doubleValue(), location + " is above maximum");
            }
        }

        private static boolean matchesType(JsonNode value, Object type) {
            if (!(type instanceof String typeName)) {
                return false;
            }
            return switch (typeName) {
                case "null" -> value.isNull();
                case "object" -> value.isObject();
                case "array" -> value.isArray();
                case "string" -> value.isTextual();
                case "integer" -> value.isIntegralNumber();
                case "number" -> value.isNumber();
                case "boolean" -> value.isBoolean();
                default -> false;
            };
        }

        private static Map<?, ?> asMap(Object value, String description) {
            if (value instanceof Map<?, ?> map) {
                return map;
            }
            throw new AssertionError(description + " is not an object");
        }

        private static List<?> asList(Object value, String description) {
            if (value instanceof List<?> list) {
                return list;
            }
            throw new AssertionError(description + " is not an array");
        }
    }
}

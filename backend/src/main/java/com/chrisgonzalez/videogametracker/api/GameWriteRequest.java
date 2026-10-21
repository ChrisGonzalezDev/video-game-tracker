package com.chrisgonzalez.videogametracker.api;

import com.chrisgonzalez.videogametracker.domain.Console;
import com.chrisgonzalez.videogametracker.domain.EsrbRating;
import com.chrisgonzalez.videogametracker.domain.Game;
import com.fasterxml.jackson.databind.JsonNode;
import java.net.URI;
import java.time.Year;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

final class GameWriteRequest {

    private static final Set<String> FIELDS = Set.of(
            "title",
            "originalReleaseYear",
            "consoles",
            "esrbRating",
            "maxLocalMultiplayerPlayers",
            "coverImageUrl",
            "personalComments");

    private GameWriteRequest() {
    }

    static Game toGame(JsonNode body, List<Console> supportedConsoles) {
        requireObject(body, "body");
        rejectUnknownFields(body, FIELDS, "body");

        String title = requiredText(body, "title");
        if (title.isBlank()) {
            throw invalid("title", "must not be blank");
        }

        JsonNode yearNode = body.get("originalReleaseYear");
        if (yearNode == null || yearNode.isNull()) {
            throw invalid("originalReleaseYear", "is required");
        }
        if (!yearNode.isIntegralNumber() || !yearNode.canConvertToInt()) {
            throw invalid("originalReleaseYear", "must be an integer");
        }
        int yearValue = yearNode.intValue();
        if (yearValue < 1000 || yearValue > 9999) {
            throw invalid("originalReleaseYear", "must be a four-digit year");
        }
        Year releaseYear = Year.of(yearValue);
        if (releaseYear.isAfter(Year.now())) {
            throw invalid("originalReleaseYear", "must not be in the future");
        }

        Set<String> supportedNames = new HashSet<>();
        supportedConsoles.forEach(console -> supportedNames.add(console.name()));
        Set<Console> consoles = parseConsoles(body.get("consoles"), supportedNames);

        EsrbRating rating = parseRating(body.get("esrbRating"));
        Integer maxPlayers = parseOptionalPositiveInteger(body.get("maxLocalMultiplayerPlayers"));
        URI coverImageUrl = parseCoverImageUrl(body.get("coverImageUrl"));
        String personalComments = parseOptionalText(body.get("personalComments"), "personalComments");

        return new Game(title, releaseYear, consoles, rating, maxPlayers, coverImageUrl, personalComments);
    }

    private static Set<Console> parseConsoles(JsonNode consolesNode, Set<String> supportedNames) {
        if (consolesNode == null || !consolesNode.isArray() || consolesNode.isEmpty()) {
            throw invalid("consoles", "must contain at least one supported console");
        }

        Set<Console> consoles = new HashSet<>();
        for (JsonNode consoleNode : consolesNode) {
            requireObject(consoleNode, "consoles");
            rejectUnknownFields(consoleNode, Set.of("name"), "consoles");
            String name = requiredText(consoleNode, "name");
            if (name.isBlank()) {
                throw invalid("consoles", "console name must not be blank");
            }
            if (!supportedNames.contains(name)) {
                throw invalid("consoles", "contains an unsupported console: " + name);
            }
            if (!consoles.add(new Console(name))) {
                throw invalid("consoles", "must not contain duplicate consoles");
            }
        }
        return consoles;
    }

    private static EsrbRating parseRating(JsonNode ratingNode) {
        String value = parseOptionalText(ratingNode, "esrbRating");
        if (value == null) {
            return null;
        }
        try {
            return EsrbRating.fromValue(value);
        } catch (IllegalArgumentException exception) {
            throw invalid("esrbRating", "must be a supported ESRB rating");
        }
    }

    private static Integer parseOptionalPositiveInteger(JsonNode valueNode) {
        if (valueNode == null || valueNode.isNull()) {
            return null;
        }
        if (!valueNode.isIntegralNumber() || !valueNode.canConvertToInt()) {
            throw invalid("maxLocalMultiplayerPlayers", "must be an integer or null");
        }
        int value = valueNode.intValue();
        if (value <= 0) {
            throw invalid("maxLocalMultiplayerPlayers", "must be positive");
        }
        return value;
    }

    private static URI parseCoverImageUrl(JsonNode valueNode) {
        String value = parseOptionalText(valueNode, "coverImageUrl");
        if (value == null) {
            return null;
        }
        URI uri;
        try {
            uri = URI.create(value);
        } catch (IllegalArgumentException exception) {
            throw invalid("coverImageUrl", "must be an absolute HTTP or HTTPS URL");
        }
        String scheme = uri.getScheme();
        if (!uri.isAbsolute()
                || uri.getHost() == null
                || uri.getHost().isBlank()
                || !("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme))) {
            throw invalid("coverImageUrl", "must be an absolute HTTP or HTTPS URL");
        }
        return uri;
    }

    private static String parseOptionalText(JsonNode valueNode, String field) {
        if (valueNode == null || valueNode.isNull()) {
            return null;
        }
        if (!valueNode.isTextual()) {
            throw invalid(field, "must be a string or null");
        }
        return valueNode.textValue();
    }

    private static String requiredText(JsonNode object, String field) {
        JsonNode value = object.get(field);
        if (value == null || value.isNull()) {
            throw invalid(field, "is required");
        }
        if (!value.isTextual()) {
            throw invalid(field, "must be a string");
        }
        return value.textValue();
    }

    private static void requireObject(JsonNode value, String field) {
        if (value == null || !value.isObject()) {
            throw invalid(field, "must be a JSON object");
        }
    }

    private static void rejectUnknownFields(JsonNode object, Set<String> allowedFields, String field) {
        Iterator<String> names = object.fieldNames();
        while (names.hasNext()) {
            String name = names.next();
            if (!allowedFields.contains(name)) {
                throw invalid(field, "contains an unsupported property: " + name);
            }
        }
    }

    private static InvalidRequestException invalid(String field, String message) {
        return new InvalidRequestException(field, message);
    }
}

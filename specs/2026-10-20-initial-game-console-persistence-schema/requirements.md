# Requirements: Initial Game and Console Persistence Schema

## Roadmap phase

**Phase 1.2 - Create the initial database schema**

## Purpose

Provide version-controlled PostgreSQL storage for games, supported consoles, and each game's console associations. The schema and persistence behavior will let later API work build on durable collection data while preserving the rules established by the backend domain.

## Intended users and use cases

- A video game collector needs game details and console associations to persist across application restarts.
- Backend features need a consistent relational representation of games and supported consoles.
- Contributors need repeatable schema setup and tests that verify persistence and relational integrity.

## Scope

- Add Flyway support to the Spring Boot backend and create versioned migrations for games, consoles, and their many-to-many association.
- Represent the existing game details: title, original release year, optional ESRB rating, optional maximum local multiplayer players, optional cover image URL, and optional personal comments.
- Add the persistence mapping and operations needed to store and retrieve games with their console associations.
- Seed the supported-console catalog with released console platforms from generations 2 through 9 in the user-selected Wikipedia list. Do not include first-generation entries, unreleased systems, or hardware revisions; represent regional aliases as one platform name.
- Add focused PostgreSQL-backed tests for clean-database migration, game persistence, console associations, and relational integrity.
- Keep persistence in the backend; do not add HTTP endpoints or frontend behavior.

## Non-goals

- Backend API contracts or endpoints, BFF integration, and frontend/UI work.
- Full-stack Docker Compose, production deployment configuration, or multi-user support.
- Collection search, filtering, sorting, and pagination.
- AI-assisted metadata suggestions.
- Arbitrary maximum lengths for text fields.

## Confirmed decisions

- PostgreSQL is the relational database and Flyway owns versioned schema changes.
- The supported-console catalog consists of the 96 released platform entries in generations 2 through 9 from [Wikipedia's list of home video game consoles](https://en.wikipedia.org/wiki/List_of_home_video_game_consoles). Regional aliases share one catalog entry. The seed migration attributes the adapted list under CC BY-SA 4.0.
- Use Testcontainers with PostgreSQL 17.6 for reproducible PostgreSQL-backed integration tests.
- Keep persistence as Spring JDBC repositories: `GameRepository` saves and retrieves a game by identifier, and `ConsoleRepository` lists supported consoles.
- Games have a many-to-many relationship with consoles: each game has one or more consoles, and a console may be associated with multiple games.
- Persist the fields already established by the domain model: title, original release year, console associations, optional ESRB rating, optional maximum local multiplayer players, optional HTTP(S) cover image URL, and optional personal comments.
- Keep the implementation limited to schema and persistence; HTTP endpoints are out of scope.
- Implement in dependency order: settle schema/catalog prerequisites, add migrations, implement persistence, then verify with PostgreSQL-backed tests.
- Merge readiness requires clean-database migration success, focused PostgreSQL persistence and integrity tests, and a passing backend Maven build.

## Assumptions

- The existing `Game` and `Console` domain records remain the source for application-level validation.
- Persistence requires a stable database identifier for each game and console, even though the current domain records do not yet define identifiers.
- Required and optional database columns, key uniqueness, and foreign keys will reflect the domain and relationship; application rules that cannot be expressed as relational constraints will remain validated in the backend.
- PostgreSQL-backed tests should use a reproducible test setup rather than depend on an undocumented manually prepared database.

## Dependencies and relevant context

- `specs/mission.md` identifies an individual collection manager as the primary user and calls for reproducible local development.
- `specs/tech-stack.md` assigns persistence access to Spring Boot, PostgreSQL for relational storage, and Flyway for migrations.
- `specs/roadmap.md` requires migrations for games and consoles and tests that verify persistence and relational integrity.
- `specs/2026-10-20-game-and-console-domain/requirements.md` defines the game's fields and domain validation. It explicitly deferred the concrete supported-console catalog to this phase, where persistence and seed data were expected to be defined.
- The backend uses Spring JDBC and PostgreSQL. The feature implementation adds Flyway migrations, JDBC repositories, and PostgreSQL-backed Testcontainers tests.
- `specs/2026-10-20-local-postgresql-development-setup/requirements.md` establishes a local PostgreSQL development service and an opt-in backend `local` profile.

## Unresolved questions

No product or architecture decisions remain unresolved for this feature.

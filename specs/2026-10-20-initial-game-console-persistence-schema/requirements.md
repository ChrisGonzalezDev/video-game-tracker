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
- Define and seed the supported-console catalog after its values are confirmed. Do not invent or silently choose console names.
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
- The current backend uses Spring JDBC and includes PostgreSQL as a runtime dependency. It has domain records and unit tests but no Flyway dependency, migrations, or persistence implementation.
- `specs/2026-10-20-local-postgresql-development-setup/requirements.md` establishes a local PostgreSQL development service and an opt-in backend `local` profile.

## Unresolved questions

- **Supported-console catalog:** The supported console names and seed rows have not been provided. Confirm the exact names before implementing the catalog seed migration. Do not invent catalog values. This decision blocks completion of the schema-and-catalog phase until resolved.
- **PostgreSQL-backed test mechanism:** Select a reproducible mechanism compatible with the existing Maven/backend setup during implementation; the user has not prescribed a particular test database tool.
- **Persistence API shape:** The exact repository/DAO API and identifier mapping should follow existing backend patterns as they evolve; no HTTP or external API shape is being decided here.

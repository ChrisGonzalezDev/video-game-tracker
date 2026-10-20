# Requirements: Local PostgreSQL Development Setup

## Roadmap phase

**Phase 0.3 - Provide a local database and configuration baseline**

## Purpose

Give contributors a repeatable way to start PostgreSQL for local development and configure the application to use it without committing credentials. Keep the database setup useful on its own, before application persistence or the integrated full-stack environment is implemented.

## Intended users and use cases

- Contributors need a local PostgreSQL instance and documented connection settings for development.
- Contributors need to provide local credentials without adding them to tracked files.
- Contributors need the database to retain local data across a normal stop and restart.

## Scope

- Add a PostgreSQL-only Docker Compose setup for local development, with PostgreSQL exposed on host port `5432` and a persistent named volume.
- Use `video_game_tracker` as the local database name.
- Define environment-based settings for the database name, username, password, and connection details. Provide a tracked example containing only non-secret placeholders, and ensure the real local environment file is ignored by Git.
- Configure the backend to consume the documented datasource settings through an opt-in local profile. Preserve the backend's ability to start without PostgreSQL when that profile is not enabled.
- Document prerequisites, local configuration, database start/readiness/stop commands, connection settings, persistence, and any destructive reset procedure.
- Update directly related setup and architecture documentation so it distinguishes this database-only setup from the future full-stack Compose environment.

## Non-goals

- Adding game or console tables, Flyway migrations, seed/demo data, or application persistence behavior.
- Implementing or changing backend API or domain behavior.
- Adding the frontend or BFF to the local Compose setup; the full-stack Compose environment remains Phase 4.2.
- Establishing production deployment configuration or committing usable credentials.
- Changing the roadmap, mission, or technology-stack specifications.

## Confirmed decisions

- The setup uses PostgreSQL and environment-based configuration.
- Start with a database-only Compose setup, separate in scope from the later full-stack Compose environment.
- Use a persistent local database volume, expose PostgreSQL on host port `5432`, and name the local database `video_game_tracker`.
- Provide environment variables for the database name, username, password, and connection settings; keep actual credentials out of tracked files.
- Keep schema, migrations, persistence implementation, full-stack Compose, and application CRUD out of this phase.
- Validate database startup and connectivity, persistence across stop/restart, configuration/documentation consistency, and secret safety.

## Assumptions

- The database-only Compose configuration can live at the repository root and later be extended when the integrated environment is implemented.
- The checked-in environment example will use clearly non-secret placeholders; contributors supply their own values in an ignored local environment file.
- The backend's local datasource configuration is opt-in, so the existing standalone backend startup does not acquire a PostgreSQL runtime requirement.
- The backend runs on the host during this phase and uses the documented host connection settings. Compose service-name networking belongs to the later integrated environment.
- A normal Compose stop preserves the named volume. Any procedure that removes that volume must explicitly warn that it permanently deletes local database data.

## Dependencies and relevant context

- `specs/mission.md` identifies an individual collection manager as the primary user and calls for reproducible local development.
- `specs/tech-stack.md` confirms PostgreSQL, Flyway, environment-based configuration, and the boundary where the Spring Boot backend owns persistence access. Docker Compose is for local development and demonstration, not production.
- `specs/roadmap.md` defines Phase 0.3's outcome and completion check. Database schema and migrations belong to Phase 1; the full-stack Compose environment belongs to Phase 4.2.
- `docs/architecture.md` describes `database/` as the planned location for Flyway migrations and data assets, `.env.example` as planned, and root `compose.yaml` as the future full-stack setup.
- `docs/development.md` and the README currently say database and environment-based configuration are not yet implemented and require contributors to keep secrets out of source control.
- The current backend scaffold has no PostgreSQL datasource configuration; its independent startup without a database must be preserved.

## Unresolved questions

No product or architecture decisions block this specification. The exact PostgreSQL image version and final environment-variable names should be selected and documented during implementation; use a supported, explicitly pinned PostgreSQL image and consistent PostgreSQL/Spring Boot conventions.

# Validation: Local PostgreSQL Development Setup

## Acceptance criteria

1. The documented database-only Compose setup starts PostgreSQL on host port `5432`, creates or uses the `video_game_tracker` database, and reports healthy/readiness status.
2. A PostgreSQL client can connect using the documented local environment settings for database name, username, password, and connection details.
3. PostgreSQL uses a persistent local volume. A test value written through a database client remains available after a normal stop and restart. Any reset procedure that removes the volume warns that local data will be permanently deleted.
4. The tracked environment example contains no usable credentials. The actual local environment file is ignored by Git, and inspection of tracked changes finds no real credentials or secrets.
5. The backend can use the documented datasource settings when its opt-in local profile is enabled, and the existing standalone backend startup remains possible without PostgreSQL when the profile is disabled.
6. The README and development/architecture documentation accurately describe prerequisites, settings, commands, readiness, connection behavior, persistence, and the distinction between this database-only setup and the Phase 4.2 full-stack environment.
7. No application tables, migrations, seed data, CRUD/persistence behavior, or frontend/BFF Compose services are required for this phase.

## Checks

- From a clean local configuration, follow the exact Compose command documented by the implementation; verify service readiness and establish a PostgreSQL client connection with the documented settings.
- Write a test value using the database client, stop and restart the database without removing its volume, and verify the value remains available.
- Start the backend with the documented local profile and datasource variables while PostgreSQL is running; verify it can initialize its datasource. Start it without the local profile and with PostgreSQL stopped; verify the standalone startup remains available.
- Inspect the staged/changed files and Git ignore behavior to confirm no actual credentials are tracked and the local environment file is ignored.
- Check that documented variable names, defaults/placeholders, ports, service names, and commands match the checked-in configuration.

Use the exact commands and health checks established by the implementation. These are proposed checks, not results; do not report them as passed unless actually run.

## Completion and merge readiness

The phase is complete when the database-only setup is documented and starts reliably with secret-safe environment configuration, PostgreSQL accepts a client connection, local data survives a normal restart, the backend can opt into the datasource configuration without losing standalone startup, and all acceptance criteria pass. No migration, application CRUD, or full-stack Compose behavior is required for merge readiness.

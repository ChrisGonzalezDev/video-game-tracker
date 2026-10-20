# Plan: Local PostgreSQL Development Setup

## Task groups

1. **Establish local database and secret-handling configuration**
   - Add a PostgreSQL-only Compose service exposed on host port `5432`, using the `video_game_tracker` database and a persistent named volume.
   - Define the environment variables for the database and connection settings. Add a non-secret environment example and ensure the real local environment file is ignored.
   - Pin and document a supported PostgreSQL image version; do not add usable credentials or secrets to tracked files.
   - **Completion check:** A contributor can supply local settings and start the database using the documented Compose configuration; the configuration fails clearly when required settings are missing rather than silently using credentials.

2. **Configure opt-in backend datasource settings**
   - Add backend configuration that consumes the documented environment-based datasource settings when the local profile is enabled.
   - Preserve the backend's default ability to start without PostgreSQL; do not add schema, migrations, or domain persistence behavior.
   - **Completion check:** The backend can connect using the documented local settings when opted in, and its standalone startup remains independent of PostgreSQL when the local profile is not enabled.

3. **Document the local database workflow**
   - Update the README and development/architecture guidance with prerequisites, environment-file setup, start and readiness commands, host connection settings, normal stop behavior, and the consequences of a volume-removing reset.
   - Clearly distinguish the database-only setup from the future full-stack Compose environment.
   - **Completion check:** Every documented setting and command matches the checked-in configuration, and no documentation presents local credentials as production-ready.

4. **Verify startup, connectivity, persistence, and secret safety**
   - Follow the documented setup from a clean local configuration, verify PostgreSQL readiness and a client connection, and confirm a test value survives a normal stop and restart.
   - Verify backend behavior with the local profile enabled and disabled, and inspect tracked files for actual credentials.
   - **Completion check:** Database setup and backend configuration meet the acceptance criteria below without requiring migrations or application CRUD behavior.

# Development Workflow

The repository is being built incrementally. Follow this feature-oriented workflow as application modules and their verification commands are introduced. The frontend and BFF starter scaffolds use Node.js 22.12 or newer; the backend targets JDK 17 and Spring Boot 3.5 with Maven Wrapper. The local PostgreSQL service is database-only; the backend has game and console CRUD plus collection search, while frontend and BFF collection behavior remain planned.

## Feature workflow

1. **Agree on scope.** Start from an issue or an explicitly scoped change. State the user outcome, acceptance criteria, relevant edge cases, and non-goals. Keep the work small enough to review and verify.
2. **Identify affected areas.** Trace the feature through the relevant frontend, BFF, backend, API contract, database, and test boundaries. Read the current module guidance before relying on a planned directory or command. Do not add scaffolding outside the agreed scope.
3. **Implement the behavior.** Make the smallest complete change in the layer that owns the behavior. Preserve the boundaries described in the [architecture guide](./architecture.md): the SPA handles presentation, the BFF adapts frontend requests, and the backend owns application rules and persistence access. Validate at the client for usability and at the server for correctness; handle failures explicitly.
4. **Test the changed behavior.** Add or update focused tests at the appropriate scope. The intended stack is Jest and MSW for frontend unit/component tests, Jest for BFF unit tests, JUnit and Spring Boot Test for backend tests, integration tests for cross-component and persistence behavior, OpenAPI compatibility checks for contract changes, and Playwright for critical end-to-end workflows. Use only suites and commands that are present and documented for the affected module; module-specific commands and exact versions will be established with its build configuration.
5. **Update contracts and documentation.** When API behavior changes, update the selected OpenAPI source and verify compatibility for both the BFF and backend. When persistence changes, add the corresponding Flyway migration and update relevant setup or data documentation. Update user-facing and contributor documentation whenever behavior, configuration, or workflow changes. The OpenAPI source-of-truth and generation workflow remains undecided; do not assume one.
6. **Run and report verification.** Run the focused checks available for the changed module, then any broader checks required by the repository. Record what passed and any checks that could not run; do not report unexecuted checks as successful.
7. **Open a pull request.** Summarize the user-visible change, implementation boundaries, contract or migration impact, tests and checks actually run, and any remaining limitations. Link the issue where applicable and keep the diff focused.
8. **Check merge readiness.** Review the implementation and confirm that required checks pass. Merge only after configured required checks pass; if no checks are configured yet, do not imply that CI verification occurred.

## Running the starter modules

Install Node.js 22.12 or newer, npm, and JDK 17 or newer (the backend targets Java 17). Maven is provided by the checked-in wrapper; a separate Maven installation is not required. Docker Engine or Docker Desktop with the Compose plugin is required only for the optional local database. Each application module can still be started without the other modules or PostgreSQL.

### Local PostgreSQL database

The root `compose.yaml` starts PostgreSQL only; it does not start the frontend, BFF, or backend. It uses the pinned `postgres:17.6-alpine` image, publishes port `5432`, and stores data in the named `postgres-data` volume. This is the Phase 0.3 development database setup, not the planned Phase 4.2 full-stack Compose environment.

From the repository root, create the ignored local environment file and replace the username and password placeholders with values for local development:

```powershell
Copy-Item .env.example .env
```

The file defines `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, and `POSTGRES_PORT`. Compose requires the database name, username, and password to be set; it fails with a clear error if any is missing. Do not commit `.env` or use these local credentials in production.

Start the database, then check that Compose reports it healthy:

```powershell
docker compose up -d --wait postgres
docker compose ps
```

The service health check uses `pg_isready`. To run a client bundled in the PostgreSQL container:

```powershell
docker compose exec postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

For a `psql` client installed on the host, connect to host `localhost`, port `5432`, database `video_game_tracker`, and the username and password from `.env`:

```powershell
psql -h localhost -p 5432 -U <local-username> -d video_game_tracker
```

The password is requested by `psql`. The same settings configure the backend's opt-in `local` Spring profile. When the backend starts with that profile, Flyway applies the schema and seeds 96 released console platforms from generations 2 through 9. The seed migration documents its Wikipedia source and license attribution. To run the backend from PowerShell, load the simple key/value `.env` entries into the current process and enable that profile:

```powershell
Get-Content .env | ForEach-Object {
    if ($_ -match '^(?<name>[^#=]+)=(?<value>.*)$') {
        Set-Item -Path "Env:$($matches.name)" -Value $matches.value
    }
}
$env:SPRING_PROFILES_ACTIVE = "local"
Set-Location backend
.\mvnw.cmd spring-boot:run
```

When `local` is not active, the backend does not configure or require a datasource and can start with PostgreSQL stopped. Stop PostgreSQL normally with `docker compose down`; this preserves `postgres-data`. **Removing the volume permanently deletes all local database data:** only use `docker compose down --volumes` when that data can be discarded.

The environment variables, Compose setup, and backend datasource properties are local development settings, not production configuration.

### Frontend

From `frontend/`, run `npm install`, `npm run dev`, and `npm run build`. The starter page is served at `http://localhost:3000`.

### BFF

From `bff/`, run `npm install`, `npm run dev`, and `npm run build`. The standalone health response is available at `http://localhost:3001/health` and returns `{"status":"ok"}`. For the compiled production entry point, run `npm start` after `npm run build`.

### Backend

From `backend/`, build with `./mvnw package` and start with `./mvnw spring-boot:run`. On Windows, use `mvnw.cmd package` and `mvnw.cmd spring-boot:run`. The Spring Boot Actuator health endpoint is `http://localhost:8080/actuator/health`; it does not require PostgreSQL. The build requires JDK 17.

The PostgreSQL migration and persistence integration test uses Testcontainers and requires Docker. Run it from `backend/` with `.\mvnw.cmd -Dtest=GameRepositoryIntegrationTest test`. It creates a disposable PostgreSQL 17.6 container and applies the Flyway migration to a clean database.

## Cross-cutting conventions

- Keep the React SPA, Express BFF, Spring Boot API, and PostgreSQL responsibilities separate.
- Keep API paths explicitly versioned; the planned backend API uses `/api/v1`.
- Keep credentials and secrets out of source control; use the ignored `.env` file for the local PostgreSQL service and environment-based configuration for the opt-in backend datasource.
- Use Flyway for version-controlled database schema changes.
- Treat Docker Compose as a local development and demonstration environment, not a production deployment configuration.
- Keep AI-generated metadata optional and subject to user review and confirmation before saving.
- Prefer accessible, responsive behavior and consistent validation and error handling.

The frontend, BFF, and backend scaffold commands documented above are runnable. The database-only Compose setup, backend `local` profile, and PostgreSQL persistence integration tests are implemented. Treat the full-stack Compose environment, end-to-end tests, and CI examples in the README as planned until their corresponding files and configuration exist.

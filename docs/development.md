# Development Workflow

The repository is being built incrementally. Follow this feature-oriented workflow as application modules and their verification commands are introduced. The frontend and BFF use Node.js 22.12 or newer; the backend targets JDK 17 and Spring Boot 3.5 with Maven Wrapper. The full-stack local Compose environment runs the frontend, BFF, backend, and PostgreSQL together. Application modules can still be started independently for development.

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

Install Node.js 22.12 or newer, npm, and JDK 17 or newer (the backend targets Java 17). Maven is provided by the checked-in wrapper; a separate Maven installation is not required. Docker Engine or Docker Desktop with the Compose plugin is required for the local Compose environment. Each application module can still be started without the other modules or PostgreSQL.

### Local PostgreSQL database

The root `compose.yaml` defines PostgreSQL and the full-stack local demonstration. To start only PostgreSQL for module development, select the database service; it uses the pinned `postgres:17.6-alpine` image, publishes the configured host port (default `5432`), and stores data in the named `postgres-data` volume.

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

### Full-stack local demonstration

From the repository root, create the ignored local environment file and replace the credential placeholders with local values:

```powershell
Copy-Item .env.example .env
```

Start the frontend, BFF, backend, PostgreSQL, migrations, and demo data with one command:

```powershell
docker compose up -d --build --wait
docker compose ps
```

The frontend is available at `http://localhost:3000`. It proxies `/api` requests to the BFF at `http://localhost:3001`; the BFF reaches the backend using the Compose service name `backend`, and the backend connects to `postgres`. The backend health endpoint is `http://localhost:8080/actuator/health`. PostgreSQL is available to host tools at `localhost:<POSTGRES_PORT>` (default `5432`).

Compose waits for PostgreSQL and the migrated backend to become healthy before running the idempotent demo-data seed and starting the BFF and frontend. The collection includes three demo games on first startup. Normal shutdown preserves both the demo games and any collection changes:

```powershell
docker compose down
```

Do not add `--volumes` unless you intend to permanently delete the local database. To start the full stack again, run the same `docker compose up -d --build --wait` command.

### Frontend

From `frontend/`, run `npm install` and `npm run dev` to open the collection view at `http://localhost:3000`. The Vite development server forwards relative `/api` requests to the BFF at `http://localhost:3001`; start the BFF separately as described below. The frontend uses the BFF for collection search, filters, sorting, pagination, game details, supported consoles, and game create/edit/delete operations. TanStack Query caches server state and refreshes collection data after successful mutations.

To run the frontend without Docker, the BFF, or the backend, use the opt-in browser mock mode:

```powershell
npm run dev:mock
```

MSW intercepts the same `/api/v1` requests using the fixtures and handlers shared with Jest tests. The mock collection supports browsing, search, filters, sorting, pagination, game details, supported consoles, and game create/edit/delete operations. Changes remain in memory for the current page session and reset when the page reloads. The regular `npm run dev` command continues to proxy API requests to the BFF. Mock mode is development-only; the browser worker and mock handlers are excluded from the production build.

Run `npm run build` to verify the production bundle and `npm test` to run the frontend Jest and MSW tests.

### BFF

From `bff/`, run `npm install` and `npm run dev`. The BFF listens on port
`3001` by default; set `PORT` to override it. It provides `GET /health` and
forwards the game and console routes under `/api/v1` to the Spring Boot API:
`GET` and `POST /api/v1/games`, `GET /api/v1/games/{id}`,
`PUT /api/v1/games/{id}`, `DELETE /api/v1/games/{id}`, and
`GET /api/v1/consoles`.

To run the BFF without the backend or Docker, start its opt-in mock mode from
`bff/`:

```powershell
npm run dev:mock
```

The mock mode uses fixed, contract-shaped responses for the game collection,
game operations, and supported consoles. Create, replace, and delete requests
return representative responses but do not change the fixture data; repeated
requests and restarts return the same mock data. Requests still use the BFF's
normal validation and response/error mapping. This mode is for local
development and demonstration, not production. The ordinary `npm run dev` and
`npm start` commands continue to use the live backend client.

The backend API base URL is configurable with `BACKEND_API_URL` and defaults
to `http://localhost:8080/api/v1`. For example, set it before starting the BFF
when the backend uses a different host or port. Build with `npm run build` and
run the BFF Jest tests with `npm test`. For the compiled production entry point,
run `npm start` after `npm run build`.

Successful downstream responses retain their status, body, and relevant
headers. Valid downstream 4xx responses use the OpenAPI `ApiError` shape
(`code`, `message`, and `details`) and retain their status. Invalid downstream
error responses and backend failures return HTTP 502 with a generic
`INTERNAL_SERVER_ERROR` `ApiError`; backend details are not sent to callers.
Requests rejected by the BFF return HTTP 400 with an `INVALID_REQUEST`
`ApiError`.

### Backend

From `backend/`, build with `./mvnw package` and start with `./mvnw spring-boot:run`. On Windows, use `mvnw.cmd package` and `mvnw.cmd spring-boot:run`. The Spring Boot Actuator health endpoint is `http://localhost:8080/actuator/health`; it does not require PostgreSQL. The build requires JDK 17.

### Cross-layer integration tests

The backend integration suite uses Testcontainers and requires Docker. It
starts a disposable PostgreSQL 17.6 container, applies the Flyway migrations,
and exercises the backend over HTTP. A second test starts the real BFF with
`tsx` and sends HTTP requests through it to the running backend, including a
downstream not-found response. Both suites check exercised request, response,
and status definitions against `contracts/openapi.yaml`; they do not require
the local PostgreSQL Compose service or the full-stack Compose environment.

Install the BFF dependencies once from `bff/`:

```powershell
npm ci
```

Then run the backend unit and integration tests from `backend/`:

```powershell
.\mvnw.cmd test
```

The BFF must be installed because the backend integration test starts its
TypeScript entry point directly. Run the BFF unit tests independently from
`bff/` with `npm test`. Validate the OpenAPI document separately from
`contracts/` with:

```powershell
npm ci
npm run validate
```

These checks require JDK 17 or newer, Node.js 22.12 or newer, npm, and Docker
with a working Docker Engine. The tests create and clean up their own
containers and service processes.

### Browser end-to-end tests

Run the full-stack Compose environment from the repository root before running
the browser suite. From `frontend/`, install dependencies and the Chromium
browser once, then run the Playwright tests:

```powershell
npm ci
npx playwright install chromium
npm run test:e2e
```

The suite uses the frontend at `http://localhost:3000` by default. Set
`PLAYWRIGHT_BASE_URL` to target another accessible frontend URL. Normal game
workflows run through the browser and BFF; the API-error check uses Playwright
request routing to simulate a service failure. The collection workflow creates
a uniquely named game and deletes it after the test, including when assertions
fail. If a test process is forcibly terminated, inspect the collection for any
test game left behind before removing it. Do not stop the Compose stack with
`docker compose down --volumes`, since that deletes the persistent local
database.

## Cross-cutting conventions

- Keep the React SPA, Express BFF, Spring Boot API, and PostgreSQL responsibilities separate.
- Keep API paths explicitly versioned; the backend API uses `/api/v1`.
- Keep credentials and secrets out of source control; use the ignored `.env` file for the local PostgreSQL service and environment-based configuration for the opt-in backend datasource.
- Use Flyway for version-controlled database schema changes.
- Treat Docker Compose as a local development and demonstration environment, not a production deployment configuration.
- Keep AI-generated metadata optional and subject to user review and confirmation before saving.
- Prefer accessible, responsive behavior and consistent validation and error handling.

The frontend, BFF, and backend module commands documented above are runnable. The full-stack local Compose environment, backend `local` profile, PostgreSQL persistence integration tests, and Chromium Playwright browser suite are implemented. GitHub Actions CI examples remain planned.

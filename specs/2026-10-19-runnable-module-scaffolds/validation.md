# Validation: Runnable Module Scaffolds

## Acceptance criteria

1. `frontend/` contains a minimal React/TypeScript application and provides:
   - A documented development command that starts the application.
   - A documented build command that completes successfully.
   - A visible minimal page when the BFF is not running.
2. `bff/` contains a minimal Node.js/Express application and provides:
   - A documented development/start command that starts the application.
   - A documented build command that completes successfully.
   - An observable minimal response when the backend is not running.
3. `backend/` contains a minimal Java/Spring Boot application and provides:
   - A documented Maven Wrapper command that starts the application.
   - A documented Maven Wrapper build command that completes successfully.
   - A startup/readiness signal without PostgreSQL or either other application module running.
4. Each module can be started and built independently; no frontend-to-BFF, BFF-to-backend, or backend-to-database connection is required for these checks.
5. Setup and run documentation names the actual prerequisites, commands, and local URLs/ports established by the module configuration. JavaScript package management uses npm; backend build/run instructions use the Maven Wrapper, including the Windows invocation.
6. The frontend build tool and JDK baseline are explicitly selected and reflected in the relevant module configuration or setup guidance before the implementation is considered complete.
7. The change remains limited to runnable scaffolds and their setup documentation. It does not add game/console behavior, database assets, cross-layer integration, Docker Compose, CI, or full-stack tests.

## Checks

Run the following checks from each module directory after implementing the corresponding configuration:

- **Frontend:** from `frontend/`, run `npm install`, `npm run build`, and `npm run dev`; verify the page at `http://localhost:3000`.
- **BFF:** from `bff/`, run `npm install`, `npm run build`, and `npm run dev`; verify `http://localhost:3001/health` returns `{"status":"ok"}`.
- **Backend:** from `backend/`, run `./mvnw package` and `./mvnw spring-boot:run`; on Windows, use `mvnw.cmd package` and `mvnw.cmd spring-boot:run`. Verify `http://localhost:8080/actuator/health` reports `UP`.
- For each module, observe its page, response, or readiness signal while the other application modules are stopped and, for the backend, while PostgreSQL is unavailable.

Use the exact commands checked into or documented by each module if implementation selects a different script name or build lifecycle. These are proposed checks, not results; do not report them as passed unless actually run.

## Completion and merge readiness

The phase is complete when all three module configurations provide their documented build and development/start entry points; each module starts independently with the required observable signal; all module builds pass; the setup documentation matches the implementation; and the frontend-tool and JDK-baseline decisions are recorded.

## Verification record

- **Frontend:** `npm install`, clean `npm ci`, and `npm run build` passed. `npm run dev` returned HTTP 200 at `http://localhost:3000/`, and the page rendered its scaffold title and running status in the browser with the BFF stopped. This independence check was repeated.
- **BFF:** `npm install`, clean `npm ci`, and `npm run build` passed. Both `npm run dev` and `npm start` returned HTTP 200 from `http://localhost:3001/health` with `{"status":"ok"}` while the backend was stopped. The independence check was repeated with the backend stopped.
- **Backend wrapper:** `mvnw.cmd -v` successfully ran Maven 3.9.11 with JDK 21.0.2.
- **Backend build/start:** With `JAVA_HOME` and `PATH` set for `C:\Users\Chris\AppData\Local\mise\installs\java\21.0.2`, `mvnw.cmd package` passed. `mvnw.cmd spring-boot:run` started Spring Boot, and its health endpoint returned `{"status":"UP"}` from `http://localhost:8080/actuator/health` without PostgreSQL or the other application modules. After the readiness check, the validation session stopped the long-running server; the runner reported exit code `-1` during that stop. Startup and readiness passed; graceful shutdown was not an acceptance criterion.
- **Dependency audit:** npm reported zero vulnerabilities in each module.

All module builds and independent startup/readiness checks passed.

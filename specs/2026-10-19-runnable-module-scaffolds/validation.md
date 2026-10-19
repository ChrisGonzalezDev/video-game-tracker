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

- **Frontend:** install dependencies with `npm install`, run the documented development command (the README currently proposes `npm run dev`), and run the configured build command (expected to be documented as `npm run build` if that script is provided).
- **BFF:** install dependencies with `npm install`, run the documented development command (the README currently proposes `npm run dev`), and run the configured build command.
- **Backend:** run the Maven Wrapper build (`./mvnw package`; on Windows, `mvnw.cmd package`) and start the application using the documented command (`./mvnw spring-boot:run`; on Windows, `mvnw.cmd spring-boot:run`).
- For each module, observe its page, response, or readiness signal while the other application modules are stopped and, for the backend, while PostgreSQL is unavailable.

Use the exact commands checked into or documented by each module if implementation selects a different script name or build lifecycle. These are proposed checks, not results; do not report them as passed unless actually run.

## Completion and merge readiness

The phase is complete when all three module configurations provide their documented build and development/start entry points; each module starts independently with the required observable signal; all module builds pass; the setup documentation matches the implementation; and the unresolved frontend-tool and JDK-baseline decisions have been recorded. The change is ready to merge when these criteria are verified and no Phase 0.3 database or later integration work has been pulled into scope.

# Plan: Runnable Module Scaffolds

## Task groups

1. **Establish module build conventions**
   - Confirm the frontend development/build tool and backend JDK baseline, using npm for JavaScript package management and Maven Wrapper for the backend.
   - Define the minimum prerequisites and scripts/commands each module will expose. Keep the module boundaries and the planned `frontend/`, `bff/`, and `backend/` layout.
   - **Completion check:** The selected tools and runtime requirements are recorded in the module configuration or adjacent setup documentation, and each module has an agreed development/start and build entry point.

2. **Create the frontend scaffold**
   - Add a minimal React/TypeScript application with an observable initial page and independent development and production-build commands.
   - Avoid requests to the BFF and avoid collection behavior.
   - **Completion check:** The documented frontend development command starts the application and displays the minimal page with the BFF stopped; its build command completes.

3. **Create the BFF scaffold**
   - Add a minimal Express application with an observable standalone response and independent development/start and build commands.
   - Avoid requiring the Spring Boot backend or implementing downstream-client behavior.
   - **Completion check:** The documented BFF development command starts and returns its minimal response with the backend stopped; its build command completes.

4. **Create the backend scaffold**
   - Add a minimal Spring Boot application with a standalone readiness signal and Maven Wrapper commands for running and building it.
   - Avoid PostgreSQL, migrations, and domain/API behavior.
   - **Completion check:** The documented backend run command starts without PostgreSQL or other application modules, and the Maven Wrapper build completes.

5. **Document and verify the module entry points**
   - Update the project setup/run documentation with actual prerequisites, module commands, ports or local URLs where applicable, and platform-specific Maven Wrapper invocation.
   - Verify each module in isolation using the documented development/start and build commands.
   - **Completion check:** Documentation commands match checked-in configuration, and all three modules independently start and build without later-phase dependencies.

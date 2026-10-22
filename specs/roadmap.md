# Roadmap

Implement the core collection workflow before optional AI-assisted metadata. Phases follow the README's foundation, backend, frontend, BFF, and full-stack integration sequence. Each phase has a focused outcome and a completion check.

## Phase 0 — Foundation

### 0.1 Establish repository conventions [Complete]

- **Outcome:** Repository structure, module boundaries, and feature-oriented development conventions are documented.
- **Completion check:** The repository has a clear location for the frontend, BFF, backend, API contracts, database assets, tests, and architecture documentation.

### 0.2 Create runnable module scaffolds [Complete]

- **Outcome:** Frontend, BFF, and backend modules have build and development entry points.
- **Completion check:** Each module's documented development command starts that module without requiring the other application modules.

### 0.3 Provide a local database and configuration baseline [Complete]

- **Outcome:** PostgreSQL and environment-based local configuration are available for development.
- **Completion check:** A developer can configure the database without committing secrets, and the local database can be started using the documented setup.

## Phase 1 — Backend and persistence

### 1.1 Define the game and console domain [Complete]

- **Outcome:** Game details and supported consoles have explicit domain models and validation rules.
- **Completion check:** Unit tests cover required fields, supported values, and the game-to-console relationship.

### 1.2 Create the initial database schema [Complete]

- **Outcome:** Flyway migrations create the relational tables and relationships for games and consoles.
- **Completion check:** Migrations apply to a clean PostgreSQL database, and tests verify persistence and relational integrity.

### 1.3 Define the versioned backend API contract [Complete]

- **Outcome:** The game and console API shapes, validation errors, and response behavior are documented in OpenAPI.
- **Completion check:** Contract documentation covers the planned `/api/v1` endpoints and passes the project's selected validation workflow.

### 1.4 Implement game and console read endpoints [Complete]

- **Outcome:** Clients can retrieve a game and the supported console list.
- **Completion check:** Backend tests verify successful reads and the expected not-found behavior.

### 1.5 Implement game create, update, and delete [Complete]

- **Outcome:** Clients can create, edit, and delete games with server-side validation.
- **Completion check:** Backend tests cover valid operations, invalid input, and consistent error responses.

### 1.6 Add collection search and pagination [Complete]

- **Outcome:** The games endpoint supports keyword search, combined filters, sorting, and predictable pagination.
- **Completion check:** Tests verify individual and combined query criteria, sort behavior, and pagination metadata.

## Phase 2 — Frontend

### 2.1 Build the application shell and collection view

- **Outcome:** Users can open the SPA and browse a collection view backed by the agreed API shapes.
- **Completion check:** Frontend tests cover the main collection view and loading, empty, and error states.

### 2.2 Add game details and collection forms

- **Outcome:** Users can view a game's details and enter or edit game information.
- **Completion check:** Tests verify form validation and the user flows for viewing, creating, and editing a game.

### 2.3 Add collection search and filters

- **Outcome:** Users can search and filter games by the supported collection fields.
- **Completion check:** Tests verify search/filter interactions, combined criteria, sorting, and pagination controls.

## Phase 3 — BFF integration

### 3.1 Implement BFF routes and backend client

- **Outcome:** The Express BFF exposes the frontend-facing routes and communicates with the Spring Boot API.
- **Completion check:** BFF tests verify request handling, input validation, and downstream client behavior.

### 3.2 Map backend responses and errors

- **Outcome:** Backend responses and failures are translated into predictable BFF responses for the frontend.
- **Completion check:** Tests cover successful response transformation and representative downstream error mappings.

### 3.3 Connect the frontend to the BFF

- **Outcome:** Collection reads and game mutations flow through TanStack Query and the BFF.
- **Completion check:** Frontend and BFF integration tests verify requests, cache updates or invalidation, and visible error handling.

## Phase 4 — Full-stack verification and local demonstration

### 4.1 Add cross-layer integration tests

- **Outcome:** Backend persistence and BFF-to-backend communication are verified together.
- **Completion check:** Integration tests exercise REST endpoints and persistence against PostgreSQL, with OpenAPI compatibility checks.

### 4.2 Complete the Docker Compose environment

- **Outcome:** The frontend, BFF, backend, and PostgreSQL can run as a local demonstration stack with migrations, sample data, and health checks.
- **Completion check:** A clean environment starts with the documented Compose command, services communicate by Compose service names, and the documented stop procedure works.

### 4.3 Verify critical user workflows end to end

- **Outcome:** Browser tests cover the core collection-management experience.
- **Completion check:** Playwright verifies creating and viewing a game, searching/filtering the collection, editing details, deleting a game, and handling API errors.

### 4.4 Enforce continuous integration quality gates

- **Outcome:** GitHub Actions runs the relevant build, test, contract, and container checks for pushes and pull requests.
- **Completion check:** Required checks pass on the main branch, and merging is gated on the configured required checks.

## Phase 5 — Optional AI-assisted entry

### 5.1 Decide AI provider and integration boundaries

- **Outcome:** The provider, configuration requirements, and failure behavior are decided before implementation.
- **Completion check:** The selected approach is documented, including how secrets are configured and how provider failures are surfaced.

### 5.2 Propose and validate game metadata

- **Outcome:** A user can request metadata suggestions from a title or description, review and edit the proposal, and explicitly confirm before saving.
- **Completion check:** Tests verify suggestions are validated, remain editable, are never saved without user confirmation, and degrade clearly when the provider is unavailable.

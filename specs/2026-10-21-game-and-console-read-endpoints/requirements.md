# Game and Console Read Endpoints — Requirements

## Purpose

Implement the backend read operations that let clients retrieve one game by ID and list the supported console catalog, using the established `/api/v1` OpenAPI contract.

## Users and use cases

- A collector's future frontend can load the details for a selected game.
- A client can load the supported console catalog for display and use in game-related workflows.
- Backend and BFF contributors can rely on responses and errors that match the maintained API contract.

## Scope

- Implement `GET /api/v1/games/{id}`:
  - Return the matching game, including its positive integer ID and all contract-defined game fields.
  - Return `404` with the contract-defined API error when no game exists for the ID.
  - Return `400` for an invalid ID and the documented `500` shape for unexpected errors, as applicable to the existing backend error-handling conventions.
- Implement `GET /api/v1/consoles`:
  - Return the supported console catalog using the contract's console representation.
  - Order consoles by name ascending.
- Add focused backend tests for both successful reads, missing-game behavior, and the console catalog response.
- Keep endpoint behavior consistent with the current Java domain, JDBC persistence, and OpenAPI definitions.

## Non-goals

- Implementing game creation, update, deletion, collection search, filters, sorting, or pagination.
- Implementing BFF routes, frontend behavior, or cross-layer integration.
- Changing the game domain, database schema, migrations, or supported console catalog.
- Changing the OpenAPI contract or generating API code from it.
- Adding authentication, multi-user behavior, or AI-assisted metadata.

## Confirmed decisions

- The feature covers only the contract-defined game-by-ID and supported-console read operations.
- The game-not-found response must use the OpenAPI `404` response and its `ApiError` shape (`code`, `message`, and `details`).
- The console list is returned in ascending name order.
- Implementation work follows three ordered groups: game read endpoint, console list endpoint, and focused endpoint tests.
- Completion requires contract-aligned responses, the missing-game behavior, a name-ordered console catalog, focused backend tests, and successful Maven verification.
- The existing `/api/v1` OpenAPI contract remains authoritative for response fields, status codes, and error schemas.

## Assumptions and dependencies

- Existing `GameRepository.findById` and `ConsoleRepository` provide the persistence operations needed for these reads.
- The backend continues to use the existing Spring Boot, JDBC, and Maven setup; implementation should follow repository patterns rather than introduce an unnecessary service layer.
- The maintained contract in `contracts/openapi.yaml` defines the game response, console response, and error representations.

## Relevant context

- `specs/roadmap.md` identifies this as Phase 1.4, before game mutations and collection search.
- `specs/mission.md` establishes the backend as owner of versioned REST endpoints and server-side behavior.
- `specs/tech-stack.md` requires the browser to use the BFF rather than call the backend directly; this feature implements backend endpoints only.
- The existing Java `Game` domain record does not carry the database ID, while the API contract's game response does. The endpoint response mapping must include the persisted ID without changing the domain model.
- `GameRepository.findById` returns an optional game and joins associated consoles. The existing console persistence component supplies the supported catalog.

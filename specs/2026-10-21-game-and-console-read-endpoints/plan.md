# Game and Console Read Endpoints — Plan

## 1. Implement game retrieval by ID

**Outcome:** The Spring Boot backend exposes the contract-defined game read operation and maps persisted game data, including its database ID, to the API response.

**Tasks:**

1. Add the endpoint adapter using the existing backend conventions and route it under `/api/v1`.
2. Use the existing game lookup behavior and map the result to the OpenAPI game representation.
3. Return the documented `GAME_NOT_FOUND` API error when the ID is not found; handle invalid IDs and unexpected failures using the established backend error conventions.

**Completion check:** A request for an existing ID returns the contract-shaped game response, and a missing ID returns the documented `404` response.

## 2. Implement supported-console listing

**Outcome:** The backend exposes the supported console catalog in the representation and order defined by the API contract.

**Tasks:**

1. Add the `/api/v1/consoles` read operation using the existing console persistence component.
2. Return console objects with their contract-defined names, ordered by name ascending.

**Completion check:** A request returns the supported catalog in ascending name order using the OpenAPI console response shape.

## 3. Add focused backend endpoint tests

**Outcome:** Automated tests verify observable success and not-found behavior for the read endpoints.

**Tasks:**

1. Test successful game retrieval, including the response ID, game fields, and associated consoles.
2. Test a missing game ID and verify the HTTP status and API error body.
3. Test the console-list response, including its representation and ordering.
4. Run the focused tests and the backend Maven verification required by the project.

**Completion check:** Tests cover both successful read operations and the expected missing-game behavior, and backend Maven verification succeeds.

## Boundaries

- Keep the work within the Spring Boot backend and its tests.
- Do not implement game mutations, search/pagination, BFF or frontend integration, or database changes.
- Keep response and error behavior aligned with `contracts/openapi.yaml`; do not revise the contract within this phase.

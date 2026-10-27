# Requirements: BFF Docker-Free Mock Mode

## Roadmap trace

- **Phase:** 6.2 — Run the BFF on mocked backend responses without Docker
- **Roadmap outcome:** An opt-in configuration lets the BFF serve requests from mocked backend responses that follow the API contract, while its validation and error mapping still run.
- **Roadmap completion check:** A documented command starts the BFF in mock mode without the backend or Docker, and tests verify success and error responses.

## Purpose and users

Let a developer or portfolio viewer run the Express BFF independently of the Spring Boot backend and Docker. The BFF should expose its existing frontend-facing routes and exercise the same request validation and backend-response normalization used by the live configuration.

## Scope

- Add an explicit opt-in way to start the BFF using a mock backend client instead of making HTTP requests to `BACKEND_API_URL`.
- Return deterministic, API-contract-shaped mock responses for the existing game and console routes:
  - List games, including accepted collection query parameters.
  - Create, retrieve, replace, and delete a game.
  - List supported consoles.
- Keep mock responses fixed: create, replace, and delete return their defined responses but do not mutate the fixture collection or persist data.
- Include representative backend error responses so the existing response normalization and error mapping are exercised in mock mode.
- Preserve the BFF's existing route validation, `/health` endpoint, and live backend client behavior.
- Document mock-mode startup, prerequisites, response behavior, and limitations in the development documentation; update the README status only as appropriate.

## Non-goals

- Changes to the OpenAPI contract, Spring Boot backend, persistence, or application rules.
- Stateful mock CRUD or persistence across requests or restarts.
- Changes to default development or production-style startup, which continue to use the live backend client.
- The backend's in-memory `mock` profile, frontend mock mode, or full-stack Compose changes.
- Authentication, multi-user ownership, or production deployment configuration.

## Confirmed decisions

- The selected roadmap item is Phase 6.2, **Run the BFF on mocked backend responses without Docker**.
- The mock response set is fixed rather than stateful: mutations do not alter the fixture collection.
- Mock mode is opt-in. Existing BFF request validation and response/error normalization remain in the request path.

## Assumptions and dependencies

- The existing `BackendClient` interface is the boundary for substituting mocked backend responses without changing the route layer.
- `contracts/openapi.yaml` remains the source for mock success and error response shapes.
- The BFF's current Jest tests and TypeScript build are the relevant verification practices.
- The proposed local command is `npm run dev:mock` from the `bff` module; it must select the mock client explicitly and must not change the default `dev` or `start` behavior.
- Mocked collection responses are fixed fixtures and need not vary based on collection query parameters; the BFF continues to validate and forward those parameters through its existing route behavior.

## Relevant context

- The request path remains browser / React SPA → Express BFF → Spring Boot API → PostgreSQL in the integrated configuration. This feature substitutes only the BFF's downstream backend client for local, Docker-free demonstrations.
- The BFF already implements game and console routes, validates search query parameters, game IDs, and JSON request bodies, and normalizes downstream responses and errors.
- The frontend already has a separate MSW mock mode. This phase is limited to the BFF and does not connect or coordinate the two mock modes.

## Unresolved decisions

- The user did not specify a preferred command name or documentation location. `npm run dev:mock` and the existing development guide are proposed conventions to confirm during implementation if repository conventions suggest otherwise.

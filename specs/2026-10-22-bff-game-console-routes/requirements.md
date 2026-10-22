# BFF Game and Console Routes — Requirements

## Purpose

Let the frontend access the versioned game collection API through the Express
BFF, preserving the boundary that the browser does not call the Spring Boot
backend directly. This completes [roadmap Phase 3.1](../roadmap.md), before
downstream response/error translation and live frontend integration.

## User and use cases

- **Primary user:** An individual managing a personal video game collection.
- **Access collection data:** Retrieve supported consoles and browse or retrieve
  games through the BFF.
- **Manage collection data:** Create, replace, and delete games through the BFF.
- **Connect the BFF to the backend:** Configure the downstream API URL for
  local development and alternate runtime environments.

## Scope

- Retain the existing `GET /health` response and standalone BFF startup behavior.
- Add frontend-facing routes corresponding to the maintained OpenAPI operations:
  - `GET /api/v1/games`, forwarding supported search, filter, sorting, and
    pagination query parameters.
  - `POST /api/v1/games`, forwarding the JSON game representation.
  - `GET /api/v1/games/{id}`.
  - `PUT /api/v1/games/{id}`, forwarding the JSON game representation.
  - `DELETE /api/v1/games/{id}`.
  - `GET /api/v1/consoles`.
- Implement a typed backend API client configured with `BACKEND_API_URL`,
  defaulting to `http://localhost:8080/api/v1` for local development.
- Perform the route-level request checks needed to safely handle query
  parameters, path IDs, and JSON request bodies. The backend remains
  authoritative for domain validation.
- Forward downstream response status and body without introducing a distinct
  frontend response schema in this phase. Preserve bodyless `204` responses.
- Surface downstream request failures as failed HTTP requests; do not return a
  success-shaped fallback. The precise standardized response/error translation
  is Phase 3.2.
- Add Jest tests for the backend client and BFF HTTP routes using a mocked
  downstream backend.

## Confirmed decisions

- The selected roadmap phase is Phase 3.1, **Implement BFF routes and backend
  client**.
- The BFF exposes the game and console operations documented by
  `contracts/openapi.yaml`, using `/api/v1` paths, and retains `/health`.
- `BACKEND_API_URL` has a local-development default of
  `http://localhost:8080/api/v1`.
- The BFF forwards request data and downstream status/body; the Spring Boot
  backend owns authoritative domain validation.
- Phase 3.2 owns standardized response and error mapping. Phase 3.3 owns live
  frontend/TanStack Query integration.
- The BFF package currently has build, development, and start scripts but no
  Jest setup or test script; adding focused Jest test support is within scope.

## Non-goals

- Changes to backend domain behavior, persistence, or API contract.
- Translating backend response shapes or defining standardized frontend error
  envelopes beyond ensuring downstream failures do not appear successful.
- Connecting frontend collection reads or mutations to the BFF.
- Full-stack Compose changes, cross-layer integration tests, or end-to-end
  browser workflows.
- Authentication, multi-user ownership, or production deployment configuration.

## Assumptions and dependencies

- The maintained OpenAPI contract at `contracts/openapi.yaml` remains the source
  for backend request and response shapes.
- The backend implements the contracted game search, create, read, replace,
  delete, and console-list operations under `/api/v1`.
- A caller may override `BACKEND_API_URL` when the backend is not reachable at
  the local-development default.
- Jest is the planned BFF unit-test runner; the tests can inject or mock
  downstream HTTP behavior without requiring a running backend.
- The exact response/error normalization and frontend-facing error contract
  remain for Phase 3.2.

## Unresolved decisions

None identified for this phase.

# Requirements: Frontend MSW Mock Mode

## Roadmap trace

- **Phase:** 6.1 — Run the frontend on MSW mocks without Docker
- **Roadmap outcome:** An opt-in local mock mode runs the frontend against MSW handlers that follow the API contract, without the BFF, backend, or Docker.
- **Roadmap completion check:** A documented command starts the frontend in mock mode and the main collection flows work; mocks are excluded from production builds and shared with the Jest tests.

## Purpose and users

Let a developer or portfolio viewer explore and verify the frontend collection experience without starting Docker, the Express BFF, or the Spring Boot backend. The mode should use the existing frontend request path and API shapes so mocked interactions exercise the same UI and data-source behavior as the integrated application.

## Scope

- Add an explicit opt-in command for starting the frontend in browser mock mode.
- Intercept the frontend's existing `/api/v1` requests using MSW browser handlers.
- Support the main collection workflows: browse, search, filter, sort, paginate, view details, create, edit, and delete games, and retrieve supported consoles.
- Keep fixtures and handlers aligned with the existing API contract and reusable by browser mock mode and Jest tests.
- Keep mock data in memory; changes made during a session are not required to survive a page reload.
- Document the mock-mode command, prerequisites, and behavior in the development documentation and update the related README status description.
- Keep the mock mode opt-in. The normal development request path continues to use the Vite `/api` proxy, and production builds do not activate or ship the mock runtime.

## Non-goals

- Mock modes for the BFF or backend; these are separate roadmap items.
- Changes to the API contract, backend, BFF, or application rules.
- Persistent mock data across page reloads.
- AI-assisted metadata suggestions or production deployment configuration.

## Confirmed decisions

- The feature is limited to the frontend MSW mock mode in Phase 6.1.
- Mock mutations are in-memory and reset on reload.
- Work is sequenced as reusable handlers and fixtures, browser startup wiring and opt-in command, then documentation.
- Completion requires the opt-in frontend to work without the other application services, preserve normal behavior, share handlers with Jest, and exclude mocks from production output.

## Assumptions and dependencies

- The frontend already uses relative `/api/v1` requests through its BFF data source, and its normal Vite development server proxies `/api` to the BFF.
- MSW is already present as a frontend development dependency and is currently used with `msw/node` in Jest.
- Existing backend and BFF API shapes and validation/error behavior are the contract for fixtures and handlers.
- The frontend module is independently runnable with its existing Node.js and npm prerequisites.

## Relevant context

- The application boundary is browser/React SPA → Express BFF → Spring Boot API → PostgreSQL. Browser mocks replace network responses only in the opt-in local frontend mode; they do not change this architecture or default path.
- The roadmap requires the browser mock handlers to be shared with Jest tests and excluded from production builds.
- Mocked collection workflows should use the existing UI and query behavior rather than introducing a separate mock-only interface.

## Unresolved decisions

- None identified for this phase.

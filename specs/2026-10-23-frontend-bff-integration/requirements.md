# Frontend–BFF Integration Requirements

**Roadmap phase:** 3.3 — Connect the frontend to the BFF
**Status:** Implemented and validated

## Purpose

Connect the collection experience to persisted application data through the existing browser → Express BFF → Spring Boot API path. The individual collection owner should be able to browse, search, filter, and manage games using the application services rather than the in-memory fixture as the running app's default.

## Users and use cases

- As the collection owner, I can browse and search the collection returned by the services.
- As the collection owner, I can open a game's details and create or edit a game using service-backed data.
- As the collection owner, I can delete a game after confirming the action.
- As the collection owner, I can understand loading and request failures and recover or cancel without losing the collection context.

## Scope

- Use the relative BFF `/api/v1` routes as the frontend's only application API path.
- Replace the fixture-backed default with an HTTP-backed implementation of the collection data source. Keep the fixture data source injectable for isolated UI tests.
- Use TanStack Query for collection, game detail, and supported console server state.
- Preserve the existing collection search, console/rating/player filters, sorting, and pagination when constructing collection requests.
- Connect collection reads, game detail and console reads, and create, update, and delete mutations to the existing BFF endpoints.
- Add a delete flow to the frontend. Require explicit confirmation; cancellation must not send a delete request. On success, refresh affected collection data and return to a sensible collection view. On failure, keep the game available and show a recoverable error.
- Preserve understandable loading, empty, and error states for reads and mutations.
- Add focused frontend tests using the existing Jest, Testing Library, and MSW stack. Update directly relevant frontend setup documentation if behavior or configuration requires it.

## Non-goals

- Changing backend or BFF routes, request/response contracts, or error mappings.
- Full-stack integration tests, Playwright workflows, Docker Compose completion, or CI quality gates.
- AI-assisted metadata entry, multi-user support, authentication, or new collection fields/features.
- Direct browser requests to the Spring Boot API.

## Confirmed decisions

- The target is roadmap phase 3.3, including collection reads and game mutations.
- TanStack Query is the confirmed client-side server-state technology.
- The browser communicates through the BFF; the BFF already exposes game CRUD and console routes.
- This phase includes a frontend delete flow, even though the current frontend does not yet expose one.
- The fixture data source remains available for test injection.

## Assumptions

- The existing BFF routes and payloads are sufficient for the frontend flows; any discovered contract mismatch must be surfaced rather than worked around with an undocumented API change.
- The current UI's visual and accessibility conventions should guide the new delete confirmation and error presentation.
- Successful create, update, and delete operations should refresh or invalidate affected TanStack Query data rather than rely on a full-page reload.

## Dependencies and relevant context

- Roadmap phases 3.1 (BFF routes/backend client) and 3.2 (response/error mapping) are complete.
- Frontend collection views, details, forms, and search/filter controls already exist and currently use an injectable, in-memory data source.
- The frontend uses React, TypeScript, MUI, TanStack Query, Jest, Testing Library, and MSW.
- The BFF exposes `/api/v1/games`, `/api/v1/games/:id`, and `/api/v1/consoles`, including game deletion.
- Architectural boundary: browser → React SPA → Express BFF → Spring Boot API → PostgreSQL.

## Unresolved questions

None identified for this phase. If implementation discovers an API-contract gap or a conflict with existing interaction conventions, resolve it explicitly before expanding scope.

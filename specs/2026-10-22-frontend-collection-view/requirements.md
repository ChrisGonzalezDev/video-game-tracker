# Frontend Collection View — Requirements

## Purpose

Replace the frontend scaffold welcome placeholder with an accessible,
responsive application shell and a collection view, giving an individual
collector a first usable way to see the games in their collection. This
completes [roadmap Phase 2.1](../roadmap.md) and establishes the presentation
foundation for later frontend and BFF phases.

## User and use case

- **Primary user:** An individual managing a personal video game collection.
- **Use case:** The collector opens the application and can understand the
  collection view, see representative game entries, and receive clear feedback
  while collection data is loading, when no games are available, or when data
  cannot be displayed.

## Scope

- Replace the current frontend welcome placeholder with the application shell
  and collection view.
- Present collection entries using the established React, TypeScript, and MUI
  stack and the existing game/page response shape.
- Provide distinct loading, empty, and recoverable error states.
- Keep the view responsive and accessible, following the existing dark visual
  direction.
- Establish frontend Jest/MSW test support and component tests for the main
  collection view and its required states.
- Use a typed, injectable collection-data boundary with deterministic local
  fixture/mock data until live BFF integration is introduced in Phase 3.

## Confirmed decisions

- The frontend must not call the Spring Boot backend directly. Live requests
  are deferred until the BFF routes and frontend connection are implemented
  in Phase 3.
- This phase uses local fixture/mock data behind an injectable, typed boundary;
  it does not claim to provide live collection data.
- The initial visual direction follows the existing dark scaffold and uses the
  confirmed MUI component stack.
- Tests use the confirmed Jest and MSW frontend testing stack.
- Loading, empty, and error presentations are part of the collection view,
  rather than being deferred to a later integration phase.

## Non-goals

- Game detail, create, or edit forms (Phase 2.2).
- Search, filters, sorting, or pagination controls (Phase 2.3).
- BFF routes, live frontend-to-BFF requests, or cross-layer integration tests
  (Phase 3).
- Direct browser-to-backend requests.
- Changes to backend behavior, API contract, persistence, or application
  ownership/authentication.

## Assumptions and dependencies

- The existing backend collection/page response contract is the reference for
  the typed view data; see the maintained
  [OpenAPI contract](../../contracts/openapi.yaml).
- The existing frontend module and build configuration remain the foundation;
  dependencies and scripts needed for MUI and Jest/MSW may be added as required
  to meet the confirmed stack and phase completion checks.
- The frontend owns presentation and browser interaction. A later phase will
  replace or connect the temporary data source through the BFF without
  bypassing the architectural boundary.

## Unresolved decisions

None identified for this phase. Live BFF route behavior and integration details
remain intentionally deferred to Phase 3.

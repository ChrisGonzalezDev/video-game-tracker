# Game Details and Collection Forms — Requirements

## Purpose

Let an individual collector view a game's details and enter or edit games in
their collection. This completes [roadmap Phase 2.2](../roadmap.md), building on
the collection view from Phase 2.1 and preparing the frontend for later BFF
integration.

## User and use cases

- **Primary user:** An individual managing a personal video game collection.
- **View details:** From the collection, the user opens a game to inspect its
  recorded information.
- **Create a game:** The user enters game information, reviews validation
  feedback, and saves a new game to the collection.
- **Edit a game:** The user changes an existing game's information and saves
  the update.
- **Cancel:** The user can leave a create or edit form without applying
  unsaved changes.

## Scope

- Provide dedicated in-app views for game details and create/edit forms.
- Let users open a game's details from the collection and access create and
  edit actions from the relevant views.
- Display the game's title, original release year, supported consoles, ESRB
  rating, maximum local multiplayer players, cover image URL, and personal
  comments, with optional values clearly represented when absent.
- Provide create and edit fields for the game write properties in the existing
  OpenAPI contract: title, original release year, consoles, ESRB rating,
  maximum local multiplayer players, cover image URL, and personal comments.
- Validate user input consistently with the contract:
  - title is nonblank;
  - release year is an integer from 1000 through the current year;
  - at least one supported console is selected, without duplicates;
  - ESRB rating is one of `EC`, `E`, `E10+`, `T`, `M`, `AO`, or `RP`, or is
    unspecified;
  - an entered player count is a positive integer;
  - an entered cover image URL is an absolute HTTP or HTTPS URL.
- Show accessible, actionable validation and save-error feedback.
- Preserve the existing responsive dark visual direction, React, TypeScript,
  MUI, and Jest frontend patterns.
- Use an injectable typed frontend data source and an in-memory fixture-backed
  implementation for reads and mutations. Changes last only for the current
  app session and reset on reload; live persistence is deferred to Phase 3.

## Confirmed decisions

- The selected roadmap phase is Phase 2.2, **Game details and collection
  forms**.
- Users prefer dedicated detail and form views rather than dialogs or inline
  panels.
- Fixture-backed create/edit changes remain in memory for the current app
  session and reset on reload until BFF integration.
- The maintained OpenAPI contract is the reference for the game fields and
  validation limits.
- The browser must not call the Spring Boot API directly. Phase 3.3 connects
  frontend collection reads and game mutations through the BFF and TanStack
  Query.

## Non-goals

- Game deletion.
- Search, filters, sorting, or pagination controls (Phase 2.3).
- Live BFF requests, TanStack Query integration for these flows, or
  cross-layer integration tests (Phase 3).
- Changes to backend behavior, persistence, or the OpenAPI contract.
- Authentication, multi-user ownership, or AI-generated metadata suggestions.

## Assumptions and dependencies

- The frontend continues to use the typed collection/game representations
  established for Phase 2.1 and aligns write fields with
  [the OpenAPI contract](../../contracts/openapi.yaml).
- The injectable fixture-backed data source can provide a supported-console
  catalog and session-scoped create/update behavior without introducing
  browser-to-backend requests.
- The existing React application shell and Jest test setup remain the
  foundation.
- Phase 3.3 will replace or connect the temporary data boundary to BFF routes,
  with TanStack Query managing the live request lifecycle and cache updates.

## Unresolved decisions

None identified for this phase.

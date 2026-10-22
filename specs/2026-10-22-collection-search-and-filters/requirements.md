# Collection Search and Filters — Requirements

## Purpose

Let an individual collector quickly find games in their collection by searching,
filtering, sorting, and paging through results. This completes
[roadmap Phase 2.3](../roadmap.md), building on the collection and game
management views from Phase 2.1 and Phase 2.2.

## User and use cases

- **Primary user:** An individual managing a personal video game collection.
- **Find games:** Search by a title or personal comment and narrow results by
  console, ESRB rating, and local multiplayer player count.
- **Explore results:** Choose a supported sort order and move through a
  predictable page of matches.
- **Refine results:** Combine search and filters, then clear criteria to return
  to the full collection.

## Scope

- Add accessible collection controls for:
  - Case-insensitive keyword search across game titles and personal comments.
  - Console selection, matching a game associated with any selected console.
  - Exact ESRB rating.
  - Inclusive minimum and maximum local-player counts.
  - Sorting by title or original release year, ascending or descending.
  - Previous/next pagination using zero-based pages and a page size of 20.
- Combine different filter categories with AND. Games without a recorded local
  player count do not match a player-range filter.
- Apply search, filters, and sorting before pagination. Use game ID ascending
  as the stable tie-breaker for sort results.
- Reset to page 0 whenever the keyword, filters, or sort criteria change.
- Show result counts, clear/reset affordances, and a distinct no-match state.
- Keep the existing empty-collection, loading, and collection-load error
  behavior, as well as game details and create/edit flows.
- Use the existing typed, fixture-backed frontend data boundary. Filtering and
  pagination remain client-side until the BFF is introduced in Phase 3.
- Preserve the responsive dark visual direction, React, TypeScript, MUI, and
  Jest frontend patterns.

## Confirmed decisions

- The selected roadmap phase is Phase 2.3, **Add collection search and
  filters**.
- Search/filter semantics match the maintained
  [OpenAPI contract](../../contracts/openapi.yaml) and the backend behavior
  defined in Phase 1.6.
- Collection queries are fixture-backed and client-side for this phase; no
  live backend or BFF requests are added.
- Search and filter state is not persisted in the URL.
- Changing search, filter, or sort criteria resets pagination to page 0.
- The page size is 20, matching the API's default page size.

## Non-goals

- BFF routes, live API requests, TanStack Query integration, or cross-layer
  integration tests (Phase 3).
- Backend, persistence, or OpenAPI contract changes.
- URL-persisted query state.
- Fuzzy search, relevance ranking, or filter/sort fields beyond those already
  supported by the API contract.
- Changes to game details, create/edit behavior, deletion, authentication,
  multi-user ownership, or AI-generated metadata.

## Assumptions and dependencies

- The frontend's typed game, console, and page representations remain aligned
  with the maintained OpenAPI contract.
- The fixture collection data source can filter, sort, and paginate its full
  in-memory collection without changing game mutation behavior.
- The existing React application shell and Jest setup remain the foundation.
- Phase 3 will connect the frontend query behavior to the BFF; this phase must
  not introduce browser-to-backend calls.
- The backend contract defines case-insensitive substring matching on title
  and personal comments; exact rating matching; inclusive player bounds;
  case-insensitive title sorting; and game ID ascending as the stable
  tie-breaker.

## Unresolved decisions

None identified for this phase.

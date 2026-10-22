# Game Collection Search and Pagination — Requirements

## Purpose

Implement collection search, filters, sorting, and pagination in the versioned
backend API so an individual collector can find games in a growing personal
collection. This completes [roadmap Phase 1.6](../roadmap.md) and provides
backend behavior for the later frontend and BFF phases.

## User and use case

- **Primary user:** An individual managing a personal video game collection.
- **Use case:** The collector searches by a title or personal comment, narrows
  the results by console, rating, or local multiplayer player count, and reads
  results in a predictable order and page size.

## Scope

- Implement collection search through `GET /api/v1/games` in the Spring Boot
  backend.
- Support keyword search, console and rating filters, inclusive local-player
  range filters, sorting, and zero-based pagination.
- Return the documented page metadata and game representations.
- Validate query values and return the standardized API error response for
  invalid requests.
- Preserve existing game-by-ID and console-list behavior.
- Add backend controller and PostgreSQL persistence tests for search behavior.

## Confirmed decisions and contract

The maintained [OpenAPI contract](../../contracts/openapi.yaml) is the source
of truth for request and response semantics:

- `keyword` is a case-insensitive substring match against title or personal
  comments.
- Repeated `console` parameters match a game associated with any selected
  console. Different filter categories combine with AND. Console names must
  exactly match catalog entries; an unknown console filter returns no matches.
- `rating` matches the exact ESRB rating. `minPlayers` and `maxPlayers` are
  inclusive bounds on the recorded local player count. A range filter excludes
  games without a recorded count. `minPlayers > maxPlayers` is invalid.
- Results sort by `title` or `originalReleaseYear`, ascending or descending.
  Title sorting is case-insensitive. Game ID ascending is always the stable
  tie-breaker.
- `page` is a zero-based index (default `0`). `size` defaults to `20` and must
  be from `1` through `100`. A page beyond the last page has an empty `items`
  array.
- The response contains `items`, `page`, `size`, `totalItems`, and
  `totalPages`. `totalItems` is counted before pagination, and `totalPages` is
  zero when there are no matching games.
- Invalid query values return `400 Bad Request` with code `INVALID_REQUEST`
  and the documented `ApiError` shape. Unexpected failures retain the generic
  `500 Internal Server Error` response.
- The API remains under `/api/v1`; the BFF and SPA are not part of this phase.

## Non-goals

- Frontend search controls, URL state, BFF routes, or cross-layer integration.
- Changes to game CRUD behavior, game or console domain rules, or the database
  schema unless implementation uncovers a concrete defect required to meet
  the existing contract.
- Full-text search, fuzzy matching, relevance ranking, or additional sort
  fields.
- Authentication, multi-user collection ownership, or production deployment.
- Changes to the OpenAPI contract when its existing search semantics can be
  implemented as documented.

## Assumptions and dependencies

- The existing games and game-console relational schema contains all fields
  required by the search filters and sort options.
- Existing domain, persistence, API response, and error-mapping conventions
  should be reused where they fit the contract.
- The backend module's Spring Boot and JUnit setup is the verification
  baseline. PostgreSQL-backed persistence tests use the repository's existing
  Testcontainers setup and require Docker.
- The current Redocly validation command remains the contract check if the
  OpenAPI file needs a justified change.

## Unresolved decisions

None identified for this phase. If implementation reveals a mismatch between
the existing schema or API behavior and the OpenAPI contract, resolve it before
changing the contract or behavior.

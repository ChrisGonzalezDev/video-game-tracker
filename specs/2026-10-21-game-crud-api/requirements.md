# Game CRUD API — Requirements

## Purpose

Implement the backend operations that let the personal collection owner add,
replace, and remove games through the versioned REST API. This completes
[roadmap Phase 1.5](../roadmap.md) and establishes the backend operations that
later BFF and frontend phases will consume.

## User and use case

- **Primary user:** An individual cataloging and maintaining a personal video
  game collection.
- **Use case:** A client creates a game, replaces its details when they change,
  or deletes it when it should no longer appear in the collection.

## Scope

- Implement `POST /api/v1/games`, `PUT /api/v1/games/{id}`, and
  `DELETE /api/v1/games/{id}` in the Spring Boot backend.
- Persist game details and supported-console associations using the existing
  relational schema.
- Validate requests on the server and return the documented API error shape.
- Preserve existing game and console read behavior.
- Add backend controller and persistence tests for successful and invalid
  operations.

## Confirmed decisions and contract

The maintained [OpenAPI contract](../../contracts/openapi.yaml) is the source
of truth for request and response semantics:

- Create accepts a `GameWrite` body with a nonblank title, a four-digit
  original release year that is not in the future, and at least one supported
  console. Optional ESRB rating, local-player count, cover URL, and personal
  comments may be null or omitted. Success returns `201 Created`, the created
  game including its identifier, and a `Location` header for that resource.
- Replace accepts the complete `GameWrite` representation. The same required
  fields and validation apply. Omitted or null optional fields are cleared.
  Success returns `200 OK` and the updated game.
- Delete returns `204 No Content` with no response body. A missing game returns
  the documented not-found error.
- Console names must exactly match the supported console catalog. Invalid
  values, malformed or nonpositive IDs, and invalid game fields return
  `400 Bad Request` using the existing `ApiError` response. Unexpected
  failures retain the generic `500 Internal Server Error` response.
- The API remains under `/api/v1`; the browser-facing BFF and SPA are not part
  of this phase.

## Non-goals

- Frontend or BFF routes, forms, cache behavior, and user workflows.
- Collection search, filters, sorting, or pagination (roadmap Phase 1.6).
- Changes to the database schema or seed data unless implementation uncovers a
  necessary schema defect; any such change must be justified and coordinated
  with the existing API contract.
- Authentication, multi-user collection ownership, or production deployment.
- Changes to the OpenAPI contract when existing semantics can be implemented
  as documented.

## Assumptions and dependencies

- The existing `games` and `game_consoles` tables and supported-console catalog
  are sufficient for create, replace, and delete.
- Existing domain validation, persistence mapping, and API error types should
  be reused where they fit the contract.
- The backend module's Spring Boot and JUnit test setup is the verification
  baseline. PostgreSQL-backed persistence tests use the repository's existing
  integration-test setup.

## Unresolved decisions

None identified for this phase. If implementation reveals a concrete mismatch
between the OpenAPI contract and existing domain or schema constraints, resolve
it before changing the contract or behavior.

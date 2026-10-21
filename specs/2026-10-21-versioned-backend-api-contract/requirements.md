# Versioned Backend API Contract — Requirements

## Purpose

Define a precise, maintainable OpenAPI contract for the planned versioned backend API so future backend and BFF work can implement and consume consistent request, response, and error shapes.

## Users and use cases

- A game collector's future frontend/BFF needs a stable contract for browsing and managing the collection.
- Backend and BFF contributors need shared definitions for game and console data, query parameters, successful responses, and errors.
- Maintainers need a repeatable way to validate contract changes.

## Scope

The contract covers the seven operations currently planned in the README, all under `/api/v1`:

| Method | Path | Intended behavior |
| --- | --- | --- |
| `GET` | `/games` | Search, filter, sort, and paginate games |
| `GET` | `/games/{id}` | Retrieve one game |
| `POST` | `/games` | Create a game |
| `PUT` | `/games/{id}` | Update a game |
| `DELETE` | `/games/{id}` | Delete a game |
| `GET` | `/consoles` | List supported consoles |
| `GET` | `/health` | Report backend health |

The contract will describe game and console schemas in a way consistent with the existing domain and persistence model. Game attributes include title, original release year, associated consoles, ESRB rating, maximum local multiplayer players, cover image URL, and personal comments. It will specify relevant constraints, request and response schemas, search and filter parameters, pagination metadata, success behavior, validation failures, not-found behavior, and health responses.

The OpenAPI document will be maintained as a source of truth under `contracts/`, separate from backend implementation. A repository command will validate it using a selected OpenAPI validator.

## Non-goals

- Implementing backend controllers, endpoints, services, or persistence behavior.
- Implementing the BFF, frontend, or cross-layer integration.
- Changing the existing domain model, database schema, or migration history.
- Adding authentication, multi-user behavior, or AI-assisted metadata.
- Selecting or implementing code generation from the contract.
- Editing the roadmap, mission, technology-stack document, or application documentation as part of the feature implementation.

## Confirmed decisions

- The contract is a maintained OpenAPI document under `contracts/`.
- It covers the seven planned `/api/v1` operations listed above.
- Contract validation must be reproducible through a repository command, and the command must be documented for maintainers.
- Contract authoring and validation are within Phase 1.3; implementing the API is not.
- The contract uses OpenAPI 3.1.0 and Redocly CLI pinned as a development dependency of the `contracts/` package. `npm run validate` runs the contract check from that directory.
- Search uses a case-insensitive substring over title and personal comments. Supplied filter categories combine with AND; repeated console names match any supplied console. Console names must exactly match the supported catalog. Player bounds are inclusive, exclude games without a recorded player count, and a minimum greater than a maximum is invalid.
- Pagination is zero-based (`page` defaults to 0); `size` defaults to 20 and is limited to 1-100. Sorting supports title and original release year, ascending or descending, defaults to title ascending, sorts titles case-insensitively, and always uses ascending game ID as a stable tie-breaker. Out-of-range pages return no items; `totalPages` is zero for an empty result and otherwise the ceiling of total items divided by page size.
- Game responses include a read-only positive integer ID; console values are represented by their names. Create and replacement requests require a nonblank title, a valid release year, and at least one supported console. Optional values may be omitted or null. `PUT` replaces the full representation and clears omitted optional values.
- Create returns `201` with the created game and a `Location` header; replacement returns `200` with the game; deletion returns `204` without a body. Malformed or invalid requests return `400`; missing games return `404`; unexpected server errors return `500`.
- Errors use `{code, message, details}`, where `details` is a list of field-level errors (empty when no specific field applies). Health returns `200` with `{status: "ok"}` when available and `503` with `{status: "unavailable"}` when unavailable.
- The API contract defines no authentication requirement. The validator suppresses the missing-license warning because the repository declares no API license and suppresses the 4xx-operation warning for console-list and health operations that accept no application-level input.

## Domain constraints

The following rules reflect existing game-domain constraints: titles and console names are nonblank; release years have four digits and are not in the future; every game has at least one supported console; ESRB values are `EC`, `E`, `E10+`, `T`, `M`, `AO`, or `RP`; local multiplayer counts are positive when present; and cover image URLs are absolute HTTP or HTTPS URLs. The contract documents the future-year rule in prose because the upper bound changes over time.

## Assumptions and dependencies

- The existing `Game`, `Console`, and `EsrbRating` domain types and the initial database schema describe the current supported game data.
- The README's seven endpoint descriptions are the intended Phase 1.3 endpoint inventory.
- This specification depends on the repository's existing Java/Maven backend structure only as context; no backend implementation is required to author or validate the contract.

## Relevant context

- `specs/roadmap.md` defines Phase 1.3 as documenting game/console API shapes, validation errors, and response behavior in OpenAPI.
- `README.md` lists the planned endpoints under `/api/v1` and gives a search example using `keyword`, `rating`, `page`, and `size`.
- `docs/architecture.md` describes `contracts/` as a possible OpenAPI location and identifies the source-of-truth workflow as undecided.
- The existing Java `Game` record requires a nonblank title, a four-digit non-future release year, and at least one console. Its optional fields include ESRB rating, maximum local multiplayer players, cover image URL, and personal comments. Cover URLs must be absolute HTTP(S) URLs; maximum local player count must be positive when present.

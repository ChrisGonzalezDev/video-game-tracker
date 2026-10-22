# Game Collection Search and Pagination — Implementation Plan

## 1. Implement search query validation and API response handling

**Outcome:** `GET /api/v1/games` accepts the documented search parameters and
returns a correctly shaped paged response.

**Work:** Add query parsing and contract defaults, validate page and size
bounds, sort field and direction, rating and player-range values, and the
relationship between `minPlayers` and `maxPlayers`. Reuse the standardized
`400` error handling. Return the documented `GamePage` representation,
including page metadata.

**Completion check:** Controller tests verify defaults, accepted parameters,
the response fields, and `INVALID_REQUEST` responses for invalid values.

## 2. Add filtered, sorted, paged persistence search

**Outcome:** The persistence layer returns only games matching the supplied
criteria, in the requested stable order, with accurate pagination totals.

**Work:** Implement parameterized database queries for keyword matching across
title and personal comments, repeated-console matching, exact rating,
inclusive player-count bounds, combined filters, supported sorting, and page
offset/size. Compute the total matching count before pagination. Preserve
games with any selected console semantics and exclude null player counts only
when a player-range filter is present.

**Completion check:** PostgreSQL-backed tests verify individual and combined
filters, unknown-console no-match behavior, both sort directions, stable ID
tie-breaking, total counts, and page contents.

## 3. Verify regression and contract compatibility

**Outcome:** Search behavior is covered at API and PostgreSQL persistence
scopes, while existing backend behavior and the maintained API contract remain
valid.

**Work:** Run the backend test suite and the documented OpenAPI validation
command if the contract changed to resolve a confirmed discrepancy. Keep any
contract changes limited to a justified mismatch.

**Completion check:** All backend tests pass, existing game and console read
tests remain green, and OpenAPI validation passes if contract files changed.

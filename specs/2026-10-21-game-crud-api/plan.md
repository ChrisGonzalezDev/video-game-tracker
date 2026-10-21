# Game CRUD API — Implementation Plan

## 1. Add transactional game persistence operations

**Outcome:** The persistence layer can create a game, replace all persisted
game fields and console associations, and delete a game without leaving
orphaned association rows.

**Work:** Reuse the existing schema and mapping conventions. Ensure writes are
transactional, reject unsupported consoles without partial persistence, and
distinguish a missing game when replacing or deleting.

**Completion check:** PostgreSQL-backed tests verify created and replaced game
fields and console associations, deletion of the game and its associations,
missing-game behavior, and rollback on invalid associations.

## 2. Expose validated backend mutation endpoints

**Outcome:** The Spring API implements the three documented game mutation
routes while preserving existing read endpoints.

**Work:** Add request-body mapping and validation, route handlers, and response
construction. Match the contract for `201` plus `Location` on create, `200`
with the replaced representation on update, and bodyless `204` on delete.
Return the standardized `400`, `404`, and `500` error shapes for applicable
failure cases.

**Completion check:** Controller tests cover successful status codes and
response fields, create `Location`, empty delete response, invalid input,
unsupported consoles, invalid IDs, missing games, and unexpected failures.

## 3. Verify regression and contract compatibility

**Outcome:** The backend mutation behavior is covered end to end at the
appropriate unit, controller, and persistence scopes, with the documented API
contract still valid.

**Work:** Run the backend test suite and validate the OpenAPI document if the
contract was changed to resolve a confirmed discrepancy.

**Completion check:** All backend tests pass; the contract validation command
passes if contract files changed; existing game and console read tests remain
green.

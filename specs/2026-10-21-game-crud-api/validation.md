# Game CRUD API — Validation

## Acceptance criteria

### Create

- A valid request persists all supplied fields and supported-console
  associations.
- The response is `201 Created`, contains the persisted game representation
  with a positive ID, and includes a `Location` header identifying that game.
- A blank title, invalid/future release year, invalid optional values, empty
  console list, unsupported console, or malformed request returns `400` with
  code `INVALID_REQUEST` and the documented error structure.

### Replace

- A valid `PUT` replaces all game fields and console associations rather than
  leaving prior values or associations behind.
- Omitted and explicitly null optional fields are stored and returned as null.
- A missing game returns `404` with code `GAME_NOT_FOUND`; invalid IDs or
  request values return the standardized `400` response.

### Delete

- Deleting an existing game returns `204 No Content` with no response body and
  removes its game-console associations.
- Deleting a nonexistent game returns `404` with code `GAME_NOT_FOUND`;
  malformed or nonpositive IDs return the standardized `400` response.

### Regression and errors

- Existing `GET /api/v1/games/{id}` and `GET /api/v1/consoles` behavior remains
  covered and passing.
- Unexpected failures continue to produce the generic `500` response with
  code `INTERNAL_SERVER_ERROR`; they are not reported as successful mutations.
- No BFF, frontend, or search behavior is added as part of this phase.

## Checks

From the repository root, run the backend test suite:

```powershell
Set-Location backend
.\mvnw.cmd test
```

If a confirmed contract discrepancy requires editing the OpenAPI document,
validate it from the contracts directory:

```powershell
Set-Location contracts
npm run validate
```

## Complete and mergeable when

- All acceptance criteria above are covered by automated tests at controller
  and PostgreSQL persistence scopes where applicable.
- The backend test suite passes, and OpenAPI validation passes if the contract
  changed.
- Existing backend reads and standardized API errors remain compatible.
- No unrelated roadmap phase or application layer has been pulled into scope.

# Game Collection Search and Pagination — Validation

## Acceptance criteria

### Search and filters

- Omitting all query parameters returns the first page, uses the default page
  size of `20`, and sorts by title ascending with game ID ascending as the
  tie-breaker.
- Keyword search matches case-insensitive substrings in either title or
  personal comments.
- Repeated console filters match games on any selected console. An unknown
  console filter produces no matches.
- Rating matching is exact. Inclusive minimum/maximum local-player filters
  exclude games without a recorded player count when either bound is applied.
- Supplied filter categories combine with AND; automated tests cover each
  filter independently and representative combinations across categories.

### Sorting and pagination

- Both supported sort fields (`title`, `originalReleaseYear`) work in
  ascending and descending directions; title ordering is case-insensitive.
- Games with equal sort values remain ordered by ID ascending in either
  direction.
- Page indexes are zero-based. Requested page and size are reflected in the
  response, `totalItems` describes all matches before pagination, and
  `totalPages` is the ceiling of `totalItems / size` (zero when there are no
  matches).
- The default size is `20`; sizes from `1` through `100` are accepted.
  Negative pages, sizes outside the allowed range, invalid sort/rating values,
  invalid player bounds, and `minPlayers > maxPlayers` return `400` with code
  `INVALID_REQUEST` and the documented error structure.
- A valid page beyond the last page returns an empty `items` array and retains
  the correct total metadata.

### Regression and contract

- Existing `GET /api/v1/games/{id}` and `GET /api/v1/consoles` behavior remains
  covered and passing.
- Unexpected failures continue to produce the generic `500` response with
  code `INTERNAL_SERVER_ERROR`; they are not returned as successful searches.
- The response matches the documented `GamePage` shape and existing game
  representation. No frontend or BFF behavior is added in this phase.
- If the OpenAPI contract changes to resolve a confirmed mismatch, its
  validation command passes.

## Checks

From the repository root, run the backend tests:

```powershell
Set-Location backend
.\mvnw.cmd test
```

The persistence integration test uses Testcontainers and requires Docker. It
can be run directly from `backend/` with:

```powershell
.\mvnw.cmd -Dtest=GameRepositoryIntegrationTest test
```

If the OpenAPI contract changes, validate it from `contracts/`:

```powershell
npm run validate
```

## Complete and mergeable when

- Automated controller and PostgreSQL persistence tests cover the acceptance
  criteria above.
- The backend test suite passes, including the persistence integration tests.
- OpenAPI validation passes if the contract changed.
- Existing game and console read behavior and standardized API errors remain
  compatible.
- No later roadmap phase or unrelated application layer has been pulled into
  scope.

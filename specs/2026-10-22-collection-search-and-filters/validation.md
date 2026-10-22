# Collection Search and Filters — Validation

## Acceptance criteria

### Search and filtering

- A case-insensitive keyword substring matches game titles and personal
  comments.
- Console selection returns games associated with any selected console.
- ESRB rating matches exactly.
- Minimum and maximum local-player filters are inclusive; either bound can be
  used independently, games without a recorded player count are excluded, and
  different filter categories combine with AND.
- Clearing criteria returns the unfiltered collection.
- Changing keyword, filters, or sorting resets results to page 0.

### Sorting and pagination

- Users can sort by title or original release year in ascending or descending
  order.
- Title sorting is case-insensitive. Games with equal sort values are ordered
  by game ID ascending.
- Results are filtered and sorted before pagination.
- Pagination is zero-based with a page size of 20. Previous/next controls
  cannot navigate outside the available pages.
- `totalItems` reflects all matches before pagination; `totalPages` is zero
  for no matches; an out-of-range page contains no items.

### UI, behavior, and boundaries

- Search/filter/sort controls and pagination have accessible names, keyboard
  operation, and visible focus.
- The result count reflects matches, and no matches are presented distinctly
  from a truly empty collection.
- Existing loading, collection-load error and retry, game details, and
  create/edit flows remain functional.
- The UI remains readable and operable without horizontal page overflow at
  viewport widths of 320px and 1280px.
- Collection query behavior remains fixture-backed and client-side. No BFF
  request, direct browser-to-backend call, API change, or unrelated feature is
  introduced.

### Automated verification

- Focused Jest tests cover each query criterion, combined filters, sorting and
  stable tie-breaking, page metadata/navigation, page reset, empty/no-match
  states, and accessible collection interactions.
- Existing frontend tests for collection loading, empty and error states, game
  details, and create/edit behavior continue to pass.
- The frontend production build succeeds.

## Checks

From the repository root, run the frontend tests:

```powershell
Set-Location frontend
npm test
```

Run the frontend production build:

```powershell
Set-Location frontend
npm run build
```

Verify the collection view at 320px and 1280px viewport widths. Controls and
results should remain readable and operable without horizontal page overflow.

## Complete and mergeable when

- All search, filter, sorting, pagination, page-reset, and no-match criteria
  above are implemented and covered by passing focused Jest tests.
- Existing collection and game detail/create/edit tests pass.
- The frontend production build passes.
- Keyboard and responsive checks pass at both specified viewport widths.
- The implementation remains within the frontend-only scope and preserves the
  planned BFF integration boundary.

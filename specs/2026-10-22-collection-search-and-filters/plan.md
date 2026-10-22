# Collection Search and Filters — Plan

## 1. Extend the typed collection query boundary

**Outcome:** The fixture-backed data source accepts the search, filter, sort,
and page criteria needed by the collection view and returns correctly ordered
page metadata.

**Tasks:**

- Define typed collection query criteria using the existing game and console
  types.
- Filter by case-insensitive title/comment keyword, selected consoles, exact
  ESRB rating, and inclusive player bounds; combine categories with AND and
  selected consoles with OR.
- Sort by title or original release year in either direction, using game ID
  ascending as a stable tie-breaker.
- Apply zero-based pagination with a page size of 20 after filtering and
  sorting; return accurate `totalItems` and `totalPages`.
- Add focused data-source tests for individual and combined criteria,
  ordering/tie-breaking, pagination metadata, and empty or out-of-range pages.

**Completion check:** Data-source tests verify each documented query behavior
and the returned items and metadata for the requested page.

## 2. Add collection search and filter interactions

**Outcome:** Users can adjust query criteria from the collection view and see
the matching page of results.

**Tasks:**

- Add labeled, keyboard-operable controls for keyword, console, rating,
  minimum/maximum player counts, sort field/direction, and clearing criteria.
- Wire control changes to the typed query boundary; reset to page 0 whenever
  keyword, filter, or sort criteria change.
- Add previous/next controls that respect the current page and result count.
- Display the matching result count and a distinct no-matches state without
  conflating it with an empty collection.
- Preserve the existing loading, load-error/retry, details, and create/edit
  behavior.
- Add focused component tests for control interactions, combined criteria,
  page reset/navigation, result and empty states, and accessibility.

**Completion check:** Component tests demonstrate that changing controls
updates visible results and metadata, and pagination and reset controls behave
as specified.

## 3. Verify compatibility and responsive behavior

**Outcome:** Collection search and filters are covered by the frontend quality
checks and remain usable at narrow and desktop viewport widths.

**Tasks:**

- Run the focused frontend Jest tests and the frontend production build.
- Verify keyboard operation, visible focus, and readable controls/results at
  viewport widths of 320px and 1280px.
- Confirm the existing collection, details, create, and edit tests still pass.
- Confirm no live API/BFF calls or unrelated application changes were added.

**Completion check:** The frontend tests and build pass, responsive checks show
no horizontal page overflow, and existing collection-management behavior
remains covered.

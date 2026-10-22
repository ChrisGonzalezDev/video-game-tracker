# Frontend Collection View — Validation

## Acceptance criteria

### Collection view

- The SPA opens to the application shell and collection view instead of the
  scaffold welcome placeholder.
- Representative fixture games render using typed data aligned with the
  documented game/page response shape.
- Loading, empty, and recoverable error conditions each produce a distinct,
  understandable view; an error is not presented as an empty successful
  collection.
- The temporary collection data source is injectable and deterministic for
  tests. No browser request goes directly to the Spring Boot backend.
- The view follows the established dark visual direction, uses the confirmed
  React/TypeScript/MUI stack, and exposes accessible names and state messages.
- At a narrow viewport (320px) and a wide viewport (1280px), the collection
  remains readable and operable without horizontal page overflow.
- Game detail/edit/create forms, search/filter/sort/pagination controls, and
  live BFF integration are not added in this phase.

### Automated verification

- Focused Jest component tests verify representative collection rendering and
  each required loading, empty, and error state.
- The frontend production build succeeds.
- Existing scaffold/module behavior remains runnable apart from replacing the
  welcome placeholder with the collection view.

## Checks

From the repository root, run the frontend build:

```powershell
Set-Location frontend
npm run build
```

Run the focused frontend Jest tests using the test script established in this
phase:

```powershell
npm test
```

Verify the responsive layout in a browser at 320px and 1280px viewport widths;
the page should not overflow horizontally and the collection content and
status messages should remain usable.

## Complete and mergeable when

- The frontend build and focused component tests pass.
- Tests cover representative collection data and separate loading, empty, and
  error presentations.
- The application shell and collection remain accessible and usable at narrow
  and wide viewport sizes.
- The temporary fixture-backed boundary is typed and injectable, and no direct
  browser-to-backend request or later-phase feature has been introduced.

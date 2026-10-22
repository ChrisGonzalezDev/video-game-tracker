# Game Details and Collection Forms — Validation

## Acceptance criteria

### Details and navigation

- A user can open a game from the collection in a dedicated detail view and
  return to the collection.
- The detail view displays the selected game's title, original release year,
  consoles, ESRB rating, maximum local multiplayer player count, cover image
  URL, and personal comments. Missing optional values are presented clearly
  rather than as misleading data.
- The user can open a create form from the collection and an edit form for an
  existing game. The edit form is pre-populated with the selected game's
  values.
- Primary navigation, actions, and form controls have accessible names,
  keyboard operation, and visible focus.

### Create and edit

- A valid create submission adds a game to the fixture-backed collection with
  an ID and current values, and the created game can be opened in details.
- A valid edit submission updates the selected game in the collection and
  detail view without changing its ID.
- Changes remain available within the current app session and reset on
  reload. No backend persistence is claimed.
- Canceling a create or edit returns without changing collection data.
- Data-source save failures are shown as understandable, recoverable errors;
  failed submissions do not appear as successful mutations.

### Validation and boundaries

- Blank or whitespace-only titles are rejected.
- Release year must be a whole number from 1000 through the current year.
- At least one distinct supported console must be selected.
- ESRB rating must be one of `EC`, `E`, `E10+`, `T`, `M`, `AO`, or `RP`, or
  left unspecified.
- An entered maximum local multiplayer count must be a positive whole number.
- An entered cover image URL must be absolute and use HTTP or HTTPS.
- Validation feedback identifies the relevant field and is accessible.
- The UI remains usable without horizontal page overflow at viewport widths
  of 320px and 1280px.
- No game-delete flow, search/filter/sort/pagination controls, direct
  browser-to-backend call, or live BFF integration is introduced.

### Automated verification

- Focused Jest tests cover detail rendering, create and edit flows, validation,
  cancel behavior, and recoverable save failures.
- Existing collection-view tests continue to cover representative game
  rendering and loading, empty, and collection-load error states.
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

Verify the details and form views in a browser at 320px and 1280px viewport
widths. The controls and content should remain readable and operable without
horizontal page overflow.

## Complete and mergeable when

- The frontend tests cover detail, create, edit, validation, cancel, save
  errors, and the existing collection states, and pass.
- The frontend production build passes.
- Users can complete the required view/create/edit flows with accessible,
  contract-aligned forms and responsive views.
- The in-memory data boundary supports the flows without introducing
  out-of-scope features or bypassing the planned BFF integration boundary.

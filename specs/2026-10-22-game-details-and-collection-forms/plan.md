# Game Details and Collection Forms — Plan

## Task groups

1. **Extend the typed game data boundary**
   - Reuse the existing game type and add typed operations needed to retrieve a
     game, create a game, and update a game.
   - Provide supported-console options and deterministic in-memory fixture
     behavior, including generated IDs and updated collection/page data.
   - Keep the boundary injectable and avoid direct HTTP requests or live
     TanStack Query integration.
   - **Completion check:** Focused tests can read, create, and update games
     through the typed data source, and changes are visible within the current
     app session.

2. **Add dedicated game detail and navigation views**
   - Let a user open a selected game from the collection in a dedicated detail
     view, and return to the collection.
   - Present all game fields with optional values handled clearly and provide
     an edit action.
   - Provide a create action from the collection and preserve the existing
     application shell and responsive, accessible presentation.
   - **Completion check:** A selected fixture game opens in its own detail
     view with the correct fields, and collection/detail navigation and
     create/edit actions are operable by keyboard and pointer.

3. **Add create and edit forms**
   - Build typed forms for the contract's game write fields, pre-populating
     values when editing.
   - Validate required and optional values against the OpenAPI contract and
     make field errors accessible.
   - Implement submit, cancel, success feedback, and visible recoverable
     data-source error behavior without applying changes on cancel or failed
     saves.
   - **Completion check:** Valid create and edit submissions update the
     in-memory data source and displayed collection; invalid submissions do
     not mutate it.

4. **Verify user flows and responsive behavior**
   - Add focused Jest component and interaction tests for detail, create,
     edit, contract-aligned validation, cancellation, and save errors.
   - Retain or adjust collection-view tests as needed to prevent regressions
     in existing loading, empty, and error states.
   - Verify usable layout at narrow and wide viewport sizes and run the
     frontend production build.
   - **Completion check:** Focused tests and production build pass, and the
     detail and form views remain usable at 320px and 1280px widths.

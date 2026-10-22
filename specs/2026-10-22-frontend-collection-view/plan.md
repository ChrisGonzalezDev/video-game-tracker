# Frontend Collection View — Plan

## Task groups

1. **Establish frontend test support and collection view types**
   - Add the Jest/MSW test configuration and npm scripts needed by frontend
     component tests.
   - Define or reuse typed view data aligned with the documented collection
     page and game representations.
   - Provide deterministic fixture/mock data behind an injectable collection
     data boundary; do not make direct requests to the backend.
   - **Completion check:** The frontend test runner can execute a focused
     component test, and fixtures satisfy the typed collection data shape.

2. **Build the application shell and collection view**
   - Replace the welcome placeholder with a responsive, accessible MUI shell
     that follows the current dark visual direction.
   - Render representative collection entries and distinct loading, empty,
     and recoverable error states through the agreed data boundary.
   - Keep forms, search/filter controls, and live BFF integration out of scope.
   - **Completion check:** The shell renders the collection and each required
     state using the typed boundary, with no direct browser-to-backend calls.

3. **Verify collection presentation and states**
   - Add focused component tests for representative game entries and the
     loading, empty, and error states.
   - Verify accessible names/roles for primary content and state messaging.
   - Check that the layout remains usable at narrow and wide viewport sizes.
   - **Completion check:** Focused tests and the frontend build pass, and the
     collection layout is usable at both viewport sizes.

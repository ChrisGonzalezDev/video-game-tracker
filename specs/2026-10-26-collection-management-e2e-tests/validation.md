# Validation — Collection Management Browser E2E Tests

## Acceptance criteria

1. **Playwright setup:** The repository has a documented, repeatable Playwright command and browser setup that runs against the full-stack Compose frontend.
2. **Create and view:** A browser test creates a uniquely identified game through the application and verifies that its saved details can be viewed.
3. **Search and filter:** A browser test finds the created test game through the supported collection search/filter controls and verifies matching results.
4. **Edit:** A browser test changes the test game's details through the application and verifies the updated values are shown.
5. **Delete:** A browser test deletes its test game through the application and verifies it no longer appears in the collection.
6. **API error handling:** A deterministic simulated API failure produces a visible, accurate error state; the browser does not indicate that the failed operation succeeded.
7. **Isolation and cleanup:** Test data is uniquely identifiable, does not alter the Compose demo records, and is cleaned up after successful runs and test failures. Repeated runs do not depend on records left by prior runs.
8. **Existing behavior:** Relevant frontend build and Jest checks continue to pass, and the full-stack Compose services remain available through their documented workflow.
9. **Operational safety:** Test prerequisites, command, and cleanup behavior are documented; normal Compose shutdown preserves persistent application data.

## Verification checks

- Follow the documented setup to start the full-stack environment with `docker compose up -d --build --wait` and verify service health.
- Run the documented Playwright command against the frontend at `http://localhost:3000`.
- Confirm the test suite exercises the UI through the frontend and BFF for normal operations; only the API-error scenario is simulated in the browser.
- Repeat the suite to verify that unique test data and cleanup make runs independent.
- Run the frontend build and Jest suite using the existing module commands.
- Use the documented normal Compose shutdown procedure; do not remove or overwrite a user's existing database volume during validation.

## Complete and mergeable when

All acceptance criteria pass, the browser checks cover every Phase 4.3 workflow, and the documented test procedure can be followed without modifying demo records or losing persistent data. This specification does not claim that any checks have been run.

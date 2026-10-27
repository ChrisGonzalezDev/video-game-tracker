# Plan: Frontend MSW Mock Mode

## 1. Create reusable API-aligned fixtures and handlers

**Outcome:** Browser mock mode and Jest tests use the same deterministic MSW handlers for the frontend's supported API requests.

**Work:**

- Add fixtures and handlers for collection reads, game details, supported consoles, and game create/update/delete requests.
- Implement collection query behavior needed by search, console/rating/player filters, sorting, and pagination.
- Return contract-shaped success and representative error responses.
- Use the shared handlers in the Jest MSW setup while preserving the ability for individual tests to override handlers.

**Completion check:** Jest exercises the shared handlers for the supported request paths, query behavior, mutations, and representative errors; existing tests can still override responses.

## 2. Add opt-in browser worker startup

**Outcome:** Developers can start the frontend alone in mock mode, while default development and production behavior remain unchanged.

**Work:**

- Add and register the MSW browser worker using the existing MSW dependency.
- Add a clearly named opt-in npm command (proposed: `npm run dev:mock`) that enables mock mode.
- Start the worker before rendering the application when mock mode is enabled, and surface worker startup failures rather than silently falling back to live requests.
- Ensure regular development still uses the existing `/api` proxy and production builds do not include or activate browser mock handlers or the worker runtime.

**Completion check:** The opt-in command serves the frontend with its API requests handled by MSW and no BFF/backend/Docker; the regular development command retains its proxy behavior, and production output has no active or shipped mock runtime.

## 3. Document usage and verify the feature

**Outcome:** A developer can follow repository documentation to run and validate the frontend mock mode.

**Work:**

- Document the opt-in command, prerequisites, in-memory reset behavior, and the flows supported by the mock mode in the development guide.
- Update the relevant README capability/status description to reflect the delivered frontend mock mode without claiming that the BFF or backend mock modes are complete.
- Run the focused frontend tests and production build, and verify default and mock startup paths.

**Completion check:** Documentation accurately describes the frontend-only scope and its limits; the acceptance checks in `validation.md` pass.

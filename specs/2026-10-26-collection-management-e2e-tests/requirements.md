# Requirements — Collection Management Browser E2E Tests

## Roadmap phase

**Phase 4.3 — Verify critical user workflows end to end**

## Purpose and users

Give the individual game collector and portfolio reviewers confidence that the deployed local application supports its core collection-management workflows through the browser, across the frontend, BFF, backend, and database.

## Scope

- Add Playwright-based browser tests and a documented way to run them against the full-stack Docker Compose environment.
- Verify that a user can create a game and view its details.
- Verify that a user can find a game using collection search and filters.
- Verify that a user can edit game details and delete the game.
- Verify that a representative API failure is presented as a clear, visible error in the browser.
- Use uniquely identifiable test-created records and clean them up without changing the deterministic demo records.
- Keep tests repeatable and independent of data left by earlier runs.

## Non-goals

- Adding or changing collection features, business rules, API contracts, or persistence behavior.
- Adding GitHub Actions workflows or merge gates (Phase 4.4).
- Production browser testing, deployment, or load/performance testing.
- Testing every browser or device configuration.

## Relevant context

- The application request path is browser / React SPA → Express BFF → Spring Boot API → PostgreSQL. Browser tests must exercise the user-facing application and must not bypass the BFF for normal workflow operations.
- The Compose environment provides the frontend at `http://localhost:3000`, with the BFF, backend, and database behind it.
- The frontend uses React, TypeScript, MUI, and TanStack Query. Frontend component tests use Jest and MSW; Playwright is the stack's end-to-end test technology.
- The application is a single-user local demonstration, not a production multi-user service.

## Confirmed decisions

- The tests will target the full-stack Compose demonstration rather than mocked application layers.
- Test records will be uniquely identifiable and cleaned up; deterministic demo records will not be modified.
- The API-error workflow will simulate a representative failing browser request and assert the visible user-facing behavior.
- Coverage is limited to the critical workflows named in Phase 4.3; CI integration is out of scope.

## Assumptions

- Docker Engine / Docker Desktop with Docker Compose and the documented local `.env` configuration are available when running the end-to-end suite.
- A single initial Playwright browser target is sufficient for this phase; additional cross-browser coverage can be added separately if needed.
- Tests can use existing accessible labels, roles, and user-facing controls, adding test-specific selectors only where necessary.

## Dependencies

- The Phase 4.2 full-stack Compose environment must be available and healthy before browser tests run.
- The existing create, detail, search/filter, edit, delete, and error-handling flows remain the behavior under test.

## Unresolved questions

No product or architecture decisions remain unresolved for this phase. The initial browser target and test implementation details may be selected consistently with the existing tooling and local-only scope.

# Implementation Plan — Collection Management Browser E2E Tests

## 1. Add Playwright setup and execution workflow

Add Playwright configuration, its dependency and scripts, and a test location that is distinct from the frontend Jest suite. Configure the browser tests to use the documented frontend URL and require the full-stack Compose environment to be ready before execution.

**Completion check:** The documented Playwright command starts the configured browser suite against the local Compose frontend without changing the existing unit-test command.

## 2. Implement isolated collection workflow coverage

Add test helpers for uniquely identifying test-created games and cleaning them up without touching demo data. Exercise creating a game, viewing its details, finding it through search and filters, editing its details, and deleting it through the browser.

**Completion check:** Browser assertions verify each requested user-visible workflow, and test-created records are cleaned up even when a test fails.

## 3. Verify visible API failure handling

Simulate a representative failed API request in the browser and assert that the relevant collection workflow displays a clear error state without presenting the failed operation as successful.

**Completion check:** The test deterministically reaches the failure state and verifies its visible message or recovery affordance.

## 4. Document and validate the E2E workflow

Document prerequisites, Compose startup, test execution, browser setup, and safe cleanup in the existing project guidance. Run the browser suite and relevant frontend checks against the configured local environment.

**Completion check:** A developer can follow the documentation from a clean local setup, execute the suite, and stop the Compose environment without losing persistent data.

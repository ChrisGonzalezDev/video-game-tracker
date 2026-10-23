# Plan: Backend-to-PostgreSQL Integration Verification

## 1. Establish backend HTTP integration coverage

**Outcome:** The backend integration suite starts the Spring application with a
disposable PostgreSQL Testcontainer and exercises implemented REST behavior
through HTTP.

**Work:**

- Reuse the existing JUnit, Spring Boot Test, Testcontainers, and Flyway setup.
- Add HTTP-level coverage for representative implemented operations, including
  persistence across API requests, migration setup, and relational behavior.
- Ensure each test run starts from a clean test database and releases its
  resources.

**Completion check:** The backend integration suite passes against its own
PostgreSQL container without using a pre-existing local database.

## 2. Verify BFF-to-backend communication over HTTP

**Outcome:** A repeatable integration path exercises the actual Express BFF
against a live Spring Boot backend using the test database.

**Work:**

- Add the smallest suitable harness to start and stop the backend and BFF for
  integration tests without relying on Docker Compose.
- Verify representative BFF requests reach the backend and return expected
  success responses.
- Verify a representative backend error is translated or forwarded according
  to the existing BFF behavior.
- Keep the checks runnable independently from the frontend and browser.

**Completion check:** The integration path passes using real HTTP between BFF
and backend, and reliably cleans up its processes and database container.

## 3. Check API contract compatibility and document execution

**Outcome:** Integration coverage checks exercised backend behavior against the
maintained OpenAPI contract, and developers have reproducible run instructions.

**Work:**

- Validate representative implemented request and response shapes/statuses
  against `contracts/openapi.yaml`.
- Retain the existing OpenAPI document validation workflow and identify both
  structural contract validation and runtime compatibility checks.
- Document required tools, Docker availability, setup, and exact commands for
  the backend integration tests, BFF-to-backend integration path, and contract
  checks.

**Completion check:** The documented commands run the required checks
independently of Compose, and the contract validation and implemented-operation
compatibility checks pass.

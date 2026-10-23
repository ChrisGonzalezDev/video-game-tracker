# Validation: Backend-to-PostgreSQL Integration Verification

## Acceptance criteria

1. The backend integration suite starts a disposable PostgreSQL instance with
   Testcontainers and applies the Flyway migrations to the test database.
2. HTTP-level tests exercise implemented backend endpoints and verify that
   representative game data and console relationships persist and can be read
   back through the API.
3. The BFF-to-backend integration path sends requests over HTTP to a live
   Spring Boot backend; representative success and downstream error behavior
   match the existing API and BFF response semantics.
4. The exercised implemented backend operations have automated compatibility
   checks for the relevant OpenAPI request, response, and status definitions.
   The maintained contract also passes its existing Redocly validation.
5. Tests initialize and clean up their own database and service resources.
   They pass without a pre-existing local database or the Phase 4.2 Compose
   application stack.
6. Test prerequisites and exact commands are documented. Docker is explicitly
   required for the Testcontainers-backed run.
7. Existing backend and BFF tests continue to pass; no production feature or
   behavior changes are required by this phase.

## Required checks

Run the following from the repository root in an environment with Docker
available:

```powershell
cd backend
.\mvnw.cmd test
```

```powershell
cd bff
npm test
```

```powershell
cd contracts
npm run validate
```

The implementation must document any dedicated integration-test command or
selector added for the BFF-to-backend path and include it in the verification
instructions. The backend test command must execute the PostgreSQL-backed
integration tests. The BFF integration checks must target the live backend,
not only the existing mocked-client unit tests.

## Complete and mergeable when

- All acceptance criteria are met by automated tests and documented execution
  instructions.
- Required checks pass in a Docker-enabled environment, including the backend
  PostgreSQL integration tests, BFF tests and live-backend integration path,
  and OpenAPI validation/compatibility checks.
- Test failures identify the failing layer or contract check rather than
  silently skipping required coverage.
- The test suite does not depend on a developer's local database state or the
  future full-stack Compose environment.

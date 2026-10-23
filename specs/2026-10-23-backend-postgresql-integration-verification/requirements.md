# Requirements: Backend-to-PostgreSQL Integration Verification

## Roadmap phase

Phase 4.1 — Add cross-layer integration tests.

## Purpose

Provide repeatable evidence that the implemented Spring Boot REST API works with
PostgreSQL persistence and that requests passing through the Express BFF reach
the backend and return the expected responses. This advances the project's
full-stack verification without changing application behavior.

## Users and use cases

- Developers can run integration checks locally to verify backend and
  BFF-to-backend behavior across real HTTP and database boundaries.
- Reviewers can use the checks and their documented commands to evaluate
  persistence, API behavior, and contract compatibility.

## Scope

- Exercise implemented backend REST endpoints over HTTP with a PostgreSQL
  database started for the test run.
- Verify Flyway migrations and representative persistence behavior, including
  that API writes can be read back through the API and that relational data is
  handled consistently.
- Exercise the BFF against a live backend over HTTP, verifying representative
  request forwarding and downstream response/error mapping.
- Check the exercised, implemented API behavior for compatibility with the
  maintained OpenAPI contract at `contracts/openapi.yaml`.
- Document the test prerequisites and commands, including the Docker
  requirement for PostgreSQL Testcontainers.

## Non-goals

- Implementing or changing product features or production API behavior.
- Building the full-stack Docker Compose environment (Phase 4.2).
- Browser-based end-to-end workflows (Phase 4.3).
- Adding or changing GitHub Actions quality gates (Phase 4.4).
- Testing contract operations that are not implemented yet.
- Replacing the existing unit, component, or repository-level tests.

## Confirmed decisions

- Use PostgreSQL Testcontainers for isolated database-backed tests; Docker is an
  acceptable prerequisite.
- Exercise the BFF and backend through HTTP rather than substituting a mocked
  backend in the cross-layer path.
- Keep the integration checks independently runnable and do not depend on the
  future full-stack Compose environment.
- Use the maintained OpenAPI contract as the compatibility reference.

## Assumptions

- Integration tests may use existing Java/JUnit/Spring Boot and
  Node.js/Jest/Express test conventions, adding only the minimum harness or
  test configuration needed to coordinate live services.
- Tests will create and clean up their own database and service resources and
  will not depend on a developer's persistent local database state.
- Contract compatibility checks will cover implemented operations exercised by
  the integration tests; broader contract generation or source-of-truth changes
  are outside this phase.

## Dependencies and relevant context

- The backend already has a repository-level integration test using PostgreSQL
  Testcontainers and Flyway, with Testcontainers test dependencies in
  `backend/pom.xml`.
- The BFF has route and backend-client unit tests; the cross-layer test must add
  coverage with an actual backend HTTP server.
- `contracts/openapi.yaml` is the maintained OpenAPI 3.1 contract, and
  `contracts/README.md` documents its Redocly validation command.
- The intended request path is browser / BFF / Spring Boot API / PostgreSQL.
  This phase verifies backend through persistence and BFF-to-backend behavior;
  it does not add browser testing.
- No unresolved product or architecture decisions remain for this spec.

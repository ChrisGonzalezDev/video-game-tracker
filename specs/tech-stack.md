# Technology Stack

The following choices and responsibilities are confirmed by the project README and the user's confirmation.

## Components and responsibilities

| Layer or concern | Confirmed technology | Responsibility |
| --- | --- | --- |
| Frontend | React, TypeScript, MUI | Single-page application, user interface, and reusable, feature-oriented components |
| Client-side data | TanStack Query | API request lifecycle, client-side caching, mutations, and query invalidation |
| Frontend tests and local mocks | Jest, MSW | Unit and component tests, plus an implemented opt-in Docker-free frontend mock mode using mocked API interactions |
| Backend-for-frontend (BFF) | Node.js, Express | Frontend-facing HTTP API, request orchestration, downstream client, and error mapping |
| Application backend | Java, Spring Boot | Versioned REST endpoints, validation, application/domain rules, and persistence access |
| Backend tests | JUnit, Spring Boot Test | Unit and integration tests for backend behavior |
| Relational database | PostgreSQL | Persistent storage for games, consoles, and their relationships |
| Database migrations | Flyway | Version-controlled database schema changes |
| API contract | OpenAPI | Documented request and response structures and contract validation |
| End-to-end tests | Playwright | Browser-based verification of complete user workflows |
| Local full-stack environment | Docker, Docker Compose | Repeatable local development and demonstration environment |
| Continuous integration | GitHub Actions | Automated builds, tests, and quality checks for pushes and pull requests |

## Architectural boundaries

The confirmed request path is:

```text
Browser / React SPA -> Express BFF -> Spring Boot REST API -> PostgreSQL
```

- The SPA owns presentation and browser interactions; TanStack Query manages client-side server state.
- The BFF presents a frontend-facing API and communicates with the backend. The browser does not access PostgreSQL or bypass the BFF to call the backend.
- The Spring Boot service owns application rules, server-side validation, REST endpoints, and access to persistence.
- PostgreSQL stores relational application data. Flyway migrations own versioned schema changes.
- OpenAPI documents the API contract used by the BFF and backend; contract compatibility should be verified when the API changes.
- Each layer should remain modular, independently testable, and responsible for its own concerns.

## Engineering practices and constraints

- Use explicit REST API versioning; the backend API is documented under `/api/v1`.
- Validate input on both client and server, and handle HTTP errors consistently across the BFF and frontend.
- Test behavior at appropriate scopes: unit/component, integration, contract, and end-to-end.
- Use migrations and reproducible seed/demo data for database setup.
- Use environment-based configuration and keep secrets out of source control.
- Support opt-in mock modes so each module can run without Docker: the frontend's MSW mode and the BFF's fixed-response mock mode are implemented; an in-memory repository under a Spring `mock` profile for the backend remains planned. Mock modes must not affect default or production-style builds.
- Use Docker Compose for local development and demonstration; do not treat that setup as production deployment configuration.
- Preserve accessible and responsive UI behavior.
- Run relevant automated build and test quality checks in GitHub Actions.

## Unresolved decisions

- **OpenAPI source of truth and generation workflow:** The README allows a maintained contract under `contracts/`, backend-generated documentation, or a combination. The final workflow is not yet selected.
- **AI provider and integration details:** AI-assisted metadata entry is a future enhancement. The provider, API, and implementation details remain undecided; any generated data must remain a user-reviewed suggestion.
- **Exact tool and runtime versions:** Use the versions specified by the individual module build configurations; this document does not establish new version pins.

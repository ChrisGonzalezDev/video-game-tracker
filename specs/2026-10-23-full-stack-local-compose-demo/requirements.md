# Requirements — Full-stack Local Compose Demo

## Roadmap phase

**Phase 4.2 — Complete the Docker Compose environment**

## Purpose and users

Enable the individual game collector and portfolio reviewers to start and explore the complete application locally using one documented Docker Compose workflow.

## Scope

- Provide container build definitions and Compose services for the React frontend, Express BFF, Spring Boot backend, and PostgreSQL.
- Configure the application services to communicate through Compose service names.
- Apply the existing Flyway schema migrations and provide deterministic sample game data for the local demonstration.
- Include health checks and readiness ordering so dependent services start after their prerequisites are ready.
- Use environment-based configuration and local secrets supplied through the ignored `.env` file, with `.env.example` as the template.
- Keep the database on persistent storage; normal shutdown must preserve its data.
- Document setup, startup, service access and health verification, configuration, and shutdown.

## Non-goals

- Production deployment configuration or hosting.
- GitHub Actions quality gates (Phase 4.4).
- Playwright end-to-end workflows (Phase 4.3).
- AI-assisted metadata entry or changes to collection functionality.

## Relevant context

- The current root `compose.yaml` starts PostgreSQL only.
- The intended request path is browser/frontend → BFF → backend → PostgreSQL; the browser must not bypass the BFF to call the backend.
- Flyway owns schema migrations, including the existing supported-console seed.
- The project describes Docker Compose as a local development and demonstration environment, not a production deployment.
- The README documents the host-side service URLs and the `.env.example` setup pattern.

## Confirmed decisions

- The frontend will be built and served from a container for the Compose demonstration, rather than run as a development server.
- Demo game data will use a separate, idempotent SQL seed and will not be mixed into schema migrations.
- Services will use Compose DNS names for service-to-service connections while retaining documented host-accessible ports.
- The `.env` file remains local and uncommitted; setup instructions will continue to use `.env.example`.
- A normal `docker compose down` must preserve the database volume. Removing stored data is not part of the normal stop procedure.

## Assumptions and dependencies

- Docker Engine and Docker Compose are available to the user.
- The existing frontend, BFF, backend, and database modules remain the application components and architectural boundaries.
- Existing application migrations and configuration can initialize the schema and support runtime connections within Compose.
- Demo data should be deterministic and safe to apply on repeated startup without creating duplicate records.

## Unresolved questions

No product or architecture decisions remain unresolved from the agreed scope. Container base images and implementation details of health probes may be selected during implementation, consistent with the existing module toolchains and local-only purpose.

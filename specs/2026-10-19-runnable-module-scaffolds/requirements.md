# Requirements: Runnable Module Scaffolds

## Roadmap phase

**Phase 0.2 - Create runnable module scaffolds**

## Purpose

Provide contributors with runnable starting points for the frontend, BFF, and backend. Each module must be buildable and startable on its own, so work can proceed within a layer before the other application modules exist.

## Intended users and use cases

- Contributors need to start and build the layer they are working on without first configuring or starting the other application modules.
- Portfolio viewers need to see the confirmed React/TypeScript, Express, and Spring Boot stack represented by runnable module entry points.

## Scope

- Create a minimal React and TypeScript SPA scaffold in `frontend/`, with independent development and build entry points.
- Create a minimal Node.js and Express BFF scaffold in `bff/`, with independent development and build/start entry points.
- Create a minimal Java and Spring Boot backend scaffold in `backend/`, with independent run and build entry points using the Maven Wrapper.
- Provide an observable indication that each module starts, such as a minimal frontend page, a lightweight BFF response, or a backend readiness signal. Do not add collection or domain behavior.
- Document prerequisites and the exact working setup, development, and build commands in the project documentation. Keep documentation consistent with the actual module configuration and note platform-specific Maven Wrapper invocation where needed.
- Keep each module independently startable: the frontend does not require the BFF, the BFF does not require the backend, and the backend scaffold does not require PostgreSQL.

## Non-goals

- Implementing game or console domain behavior, collection workflows, or the API contract.
- Connecting the frontend to the BFF or the BFF to the backend.
- Adding PostgreSQL configuration, migrations, or seed data (Phase 0.3).
- Adding Docker Compose, CI workflows, cross-layer integration, or end-to-end tests.
- Building feature-level UI or backend API behavior, persistence, or test infrastructure beyond what is needed to verify the scaffolds. A minimal startup/readiness signal remains in scope.
- Changing the mission, technology-stack, or roadmap documents as part of the implementation.

## Confirmed decisions

- The modules use the technology choices in `specs/tech-stack.md`: React and TypeScript for the frontend, Node.js and Express for the BFF, and Java and Spring Boot for the backend.
- Follow the README's proposed JavaScript package-manager convention of npm and backend build convention of Maven Wrapper.
- Use Vite as the frontend development server and production build tool.
- Require Node.js 22.12 or newer for the frontend and BFF toolchain.
- Target Java 17 with Spring Boot 3.5 for the backend; pin the exact Spring Boot patch release in `backend/pom.xml`.
- Each module must have its own build and development/start entry points, and its documented development command must work without the other application modules.
- Keep the architecture boundaries from `specs/tech-stack.md`: browser presentation belongs to the SPA, frontend-facing HTTP handling belongs to the BFF, and application rules and persistence access belong to the backend.
- The scaffolds remain minimal and do not introduce database or cross-module dependencies.

## Assumptions

- The repository's existing `frontend/`, `bff/`, and `backend/` layout is the intended module structure.
- Document the module commands and local URLs only after confirming them against the checked-in configurations; reserve proposed setup examples for later roadmap capabilities.
- A minimal page, response, or readiness signal is sufficient evidence that a module has started; the scaffolds do not need to implement application behavior.

## Dependencies and relevant context

- `specs/mission.md` defines the personal collection product and its guiding principle that future AI suggestions remain subject to user review.
- `specs/tech-stack.md` defines the layer technologies and architectural boundaries.
- `specs/roadmap.md` defines the outcome and completion check for Phase 0.2; Phase 0.3 separately covers local database and configuration.
- `docs/architecture.md` identifies `frontend/`, `bff/`, and `backend/` as the module locations and distinguishes the starter scaffolds from planned capabilities.
- `docs/development.md` and the README document module prerequisites, commands, ports, and readiness URLs that match each build configuration.
- The frontend and BFF use the README's npm convention; the backend uses the checked-in Maven Wrapper.

## Unresolved questions

None. The frontend tool and JDK baseline are resolved in the confirmed decisions above.

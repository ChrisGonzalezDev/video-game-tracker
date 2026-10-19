# Requirements: Repository Conventions

## Roadmap phase

**Phase 0.1 - Establish repository conventions**

## Purpose

Document the repository layout, application-layer boundaries, and feature-oriented development workflow so contributors and portfolio viewers can understand where work belongs and how it should be delivered.

## Intended users and use cases

- Contributors need to find the appropriate location for frontend, BFF, backend, API contract, database, test, and architecture work.
- Contributors need a shared understanding of layer responsibilities and the request path through the application.
- Contributors need a consistent workflow for proposing, implementing, testing, documenting, and reviewing a feature.
- Portfolio viewers need an accurate explanation of the intended architecture and engineering practices.

## Scope

- Add `docs/architecture.md` to document the repository structure, the purpose of each area, planned versus existing areas, system boundaries, and request flow.
- Add `docs/development.md` to document feature-oriented development and contribution conventions, including issue scope and acceptance criteria, implementation, tests, contract/documentation updates, and pull request verification.
- Align README summaries and links with the two detailed guides.
- Keep the documentation consistent with `specs/mission.md`, `specs/tech-stack.md`, and the current roadmap.

## Non-goals

- Creating application modules, runnable scaffolds, tests, contracts, database assets, CI workflows, or Docker configuration.
- Implementing application behavior or deciding detailed API, domain, or database designs.
- Introducing commands, tools, or policies not supported by the project documentation or module configuration.
- Updating the roadmap, mission, or technology-stack specification as part of this feature.

## Confirmed decisions

- Keep architecture and development guidance in two focused documents: `docs/architecture.md` and `docs/development.md`.
- Retain the README as the project overview and align its summaries and links with those documents.
- Preserve the architecture in which the browser uses the React SPA, the SPA communicates through the Express BFF, the BFF calls the Spring Boot API, and the backend accesses PostgreSQL.
- Clearly label planned repository areas and capabilities; documentation must not imply that planned modules are already implemented.

## Assumptions

- The README's documented repository layout is the intended starting point and should be clarified, not replaced with an unrelated structure.
- Existing project guidance remains authoritative where it is consistent with the mission and technology-stack specifications.
- The workflow should emphasize small, feature-oriented changes and appropriate tests without imposing additional tooling.

## Dependencies and relevant context

- `specs/mission.md` defines product intent, primary users, and guiding principles.
- `specs/tech-stack.md` defines the layer technologies, responsibilities, and architectural boundaries.
- `specs/roadmap.md` defines the Phase 0.1 outcome and completion check.
- The README already contains a high-level repository tree, architectural principles, a development workflow, and pointers to the planned architecture and development documents.

## Unresolved questions

None identified for this phase. Implementation details should follow the existing repository content and the confirmed decisions above.

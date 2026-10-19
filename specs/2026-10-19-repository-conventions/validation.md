# Validation: Repository Conventions

## Acceptance criteria

1. `docs/architecture.md` exists and describes:
   - The purpose of the frontend, BFF, backend, API contracts, database assets, tests, and architecture documentation locations.
   - Which locations or capabilities are planned rather than implemented.
   - The responsibilities of the React SPA, Express BFF, Spring Boot API, and PostgreSQL database.
   - The request path from browser through SPA, BFF, and backend to the database.
2. `docs/development.md` exists and presents a feature-oriented workflow that covers issue scope and acceptance criteria, implementation, appropriate tests, contract and documentation changes, pull request verification, and merge readiness.
3. README summaries and links correspond to the focused guides and do not contradict their description of the architecture, layout, or workflow.
4. The three documents agree with `specs/mission.md` and `specs/tech-stack.md`; no planned module, tool, command, or capability is claimed to be implemented without supporting repository evidence.
5. The change adds or updates documentation only. It does not create application modules, contracts, tests, database assets, CI, or infrastructure implementation.

## Review checks

- Review the documentation as a set against the mission, technology-stack specification, and Phase 0.1 roadmap outcome.
- Verify each documentation link added or changed in the README points to an existing file.
- Compare the documented repository structure with the actual repository and preserve explicit planned-versus-existing distinctions.
- Check for contradictory layer responsibilities, request-flow descriptions, development steps, or merge criteria.

## Completion and merge readiness

The feature is complete when all acceptance criteria are met, the focused guides and README are mutually consistent, and the documentation accurately reflects the repository without introducing implementation work. Do not claim that tests, builds, or other checks were run unless they are actually executed; no application-level test command is required for this documentation-only phase.

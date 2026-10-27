# Requirements: README Status and Documentation Refresh

## Roadmap phase

**Phase 5.2 — Bring project status and README documentation up to date**

## Purpose

Bring the root README into agreement with the repository's implemented capabilities, project status, and local setup so an individual collector or portfolio reviewer can understand what is available now and what remains planned. The README should also explain that the maintainer chose technologies they are already familiar with and uses specification-driven development to demonstrate AI-assisted engineering practices.

## Intended users and use cases

- A portfolio viewer evaluating the project's purpose, technology choices, architecture, and engineering workflow.
- A contributor following the README to understand implemented functionality and run the local demonstration.
- A prospective user checking whether collection, search, and game-management workflows are available.

## Scope

- Reconcile README status statements and feature descriptions with the completed roadmap phases and the current repository.
- Correct stale or contradictory descriptions of implemented behavior, including game CRUD and search, frontend-to-BFF integration, end-to-end tests, and the Compose demonstration stack.
- Keep not-yet-implemented roadmap work, including optional CI quality gates and AI-assisted game entry, clearly marked as planned.
- Align API endpoint status, setup prerequisites and commands, testing references, and roadmap/specification links with the implementation and existing project guidance.
- Add a concise explanation that the maintainer selected technologies with which they were already familiar.
- Describe the use of specification-driven development to iterate on the project as an example of AI-assisted development practice, without implying that AI-produced suggestions are authoritative or that planned AI metadata entry is already implemented.

## Non-goals

- Changing application code, runtime behavior, API contracts, or project configuration.
- Editing the roadmap, mission, technology-stack document, or detailed contributor guides.
- Implementing CI workflows, AI-provider integration, or other roadmap features.
- Claiming the project is production-ready or more complete than supported by repository evidence.
- Rewriting the README's content beyond what is needed to make its status, features, and setup guidance accurate and useful.

## Confirmed decisions

- The selected phase is the earliest incomplete roadmap item, Phase 5.2.
- The README should mention the maintainer's familiarity with the selected technologies.
- The README should mention specification-driven development as an iterative practice that demonstrates AI-assisted development techniques.
- The root README is the documentation surface in scope for the implementation; other documentation remains unchanged.

## Assumptions

- The roadmap is authoritative for project phase status; current source, tests, configuration, and existing development guidance are authoritative for implemented behavior and commands.
- README wording should distinguish implemented collection and local-demo capabilities from the optional CI and AI roadmap work.
- Preserve the README's existing UTF-16 encoding during a content-only update unless conversion to UTF-8 is explicitly chosen; avoid an incidental whole-file encoding change.

## Dependencies and relevant context

- `specs/roadmap.md` marks phases through Phase 5.1 complete; Phase 5.2 is incomplete, while Phase 6 CI and Phase 7 AI are later optional work.
- `specs/mission.md` describes the individual collector and portfolio audience; `specs/tech-stack.md` records the confirmed frontend, BFF, backend, database, testing, and local-environment responsibilities.
- The README currently contains contradictions, including stale API operation status and outdated statements about end-to-end coverage.
- The repository contains backend game CRUD and search, BFF game and console routes, frontend Playwright workflow tests, and a full-stack Compose environment. Verify precise statements against those sources when implementing.
- The README is UTF-16 encoded. No encoding conversion is required to satisfy this phase.

## Unresolved questions

- Whether to normalize the README to UTF-8 remains undecided. The implementation should preserve its current encoding unless the maintainer explicitly requests conversion.
- The exact concise wording of the project-status label is open; select wording that accurately reflects the completed core workflow and remaining planned work without implying production readiness.

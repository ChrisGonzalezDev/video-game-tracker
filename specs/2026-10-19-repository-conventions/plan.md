# Plan: Repository Conventions

## Task groups

1. **Document repository structure and status**
   - Define the purpose of the frontend, BFF, backend, contracts, database assets, tests, architecture documentation, and supporting project files.
   - Distinguish planned locations and capabilities from those present in the repository.
   - **Completion check:** Every location required by Phase 0.1 has a clear purpose, and planned components are not presented as implemented.

2. **Document architecture boundaries**
   - Describe the responsibilities of the React SPA, Express BFF, Spring Boot backend, and PostgreSQL database.
   - Describe the request and response flow across those components and the role of OpenAPI, Flyway, and relevant test scopes.
   - **Completion check:** `docs/architecture.md` agrees with the mission and technology-stack specifications and accurately describes the confirmed architecture.

3. **Document development conventions**
   - Specify a feature-oriented workflow from issue scope and acceptance criteria through implementation, tests, contract/documentation updates, and pull request review.
   - Retain the existing guidance on required checks and merging only after checks pass without adding unsupported tools or commands.
   - **Completion check:** `docs/development.md` provides an actionable, ordered contribution workflow consistent with existing project practices.

4. **Align the README**
   - Update README summaries and documentation links to point to the focused architecture and development guides.
   - Remove or revise duplicated statements only as needed to prevent contradictory or stale guidance.
   - **Completion check:** README navigation resolves to the new documents, and overview guidance agrees with both guides.

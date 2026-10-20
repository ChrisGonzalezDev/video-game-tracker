# Requirements: Game and Console Domain Model

## Roadmap phase

**Phase 1.1 - Define the game and console domain**

## Purpose

Define backend domain models for games and consoles, with explicit validation rules for the collection details identified in the README. This establishes the domain behavior that persistence and API work in later phases can build on.

## Intended users and use cases

- A game collector needs to record and manage accurate details about games in a personal collection.
- Backend features need consistent domain rules for valid game details and their association with consoles.
- Contributors need domain behavior that can be tested independently of persistence and HTTP APIs.

## Scope

- Define typed Java domain models for a game and a console.
- Define and enforce the game fields and validation rules listed below.
- Require each game to be associated with one or more console model instances.
- Add focused backend unit tests for valid and invalid domain values and the game-to-console relationship.
- Add only the Maven test dependency required to run the agreed JUnit tests.

## Confirmed decisions

- A game's title is required and must not be blank.
- A game's original release year is required, must be a four-digit year, and must not be later than the current calendar year.
- A game must be associated with one or more consoles.
- ESRB rating, maximum local multiplayer players, cover image URL, and personal comments are optional.
- If present, the maximum local multiplayer player count must be a positive integer.
- If present, the cover image URL must be absolute and use HTTP or HTTPS.
- Supported ESRB values are `EC`, `E`, `E10+`, `T`, `M`, `AO`, and `RP`. Unrated or unknown is represented by an absent rating.
- Do not impose arbitrary maximum lengths on text fields in this phase.
- Define a typed console model and nonempty game-to-console association, but defer the concrete supported-console catalog to Phase 1.2, where persistence and seed data are defined.
- Keep this feature limited to domain modeling and unit-level validation. Database schema, migrations, API endpoints, and UI are out of scope.
- Implement in dependency order: model and rules, behavior, then focused JUnit tests.
- Completion requires the backend build and focused JUnit tests to pass. Add only the test dependency needed by the current Maven configuration.

## Assumptions

- Domain validation belongs in the backend and should be testable without starting Spring Boot or connecting to PostgreSQL.
- Console catalog membership cannot be checked against a fixed allowlist until Phase 1.2 defines the supported values. This phase validates the type and nonempty association; catalog membership is deferred.
- An optional personal comment may be absent or empty; no maximum length is introduced in this phase.

## Dependencies and relevant context

- `specs/mission.md` establishes the personal collection use case and requires user-reviewed AI suggestions rather than authoritative generated data.
- `specs/tech-stack.md` assigns domain rules and server-side validation to the Spring Boot backend, with JUnit and Spring Boot Test as the backend testing stack.
- `specs/roadmap.md` requires explicit game details, supported console values, and a game-to-console relationship, with unit tests for required fields, supported values, and that relationship.
- The README identifies the game details in scope: title, original release year, one or more consoles, ESRB rating, maximum local multiplayer player count, cover image URL, and personal comments.
- The backend currently contains a runnable Spring Boot scaffold; game and console domain models and a test suite are not yet present.

## Unresolved questions

- The concrete supported-console catalog is deferred to Phase 1.2.
- No other product decisions remain unresolved for this phase.

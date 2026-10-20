# Plan: Game and Console Domain Model

## Roadmap phase

**Phase 1.1 - Define the game and console domain**

## Ordered task groups

### 1. Define the domain model and invariants

**Outcome:** Backend domain types represent a game and console, including all confirmed game details and the required console association, without depending on persistence or HTTP.

**Completion check:** The model has a required nonblank title, a required valid original release year, an optional ESRB rating constrained to the confirmed set, optional positive local-player count, optional absolute HTTP(S) cover URL, optional personal comments, and at least one console model instance. Text fields have no arbitrary maximum length. Concrete console catalog membership remains deferred.

### 2. Implement domain validation

**Outcome:** Invalid domain values cannot be represented as valid game instances, and valid values can be created and used without a database or web request.

**Completion check:** Construction or the project's chosen domain validation mechanism consistently rejects blank titles, invalid or future release years, unsupported ESRB ratings, nonpositive player counts, invalid cover URLs, and missing console associations.

### 3. Add focused JUnit tests

**Outcome:** The domain rules and game-to-console relationship have executable regression coverage.

**Completion check:** JUnit tests cover valid and invalid examples for every confirmed validation rule, optional fields both absent and present, one or more console associations, and the deferred boundary that catalog membership is not yet enforced. The Maven test dependency is added only if needed by the current build.

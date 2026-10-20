# Validation: Game and Console Domain Model

## Acceptance criteria

- The backend contains typed domain models for games and consoles; the game model has no persistence or HTTP-layer dependency.
- A title containing non-whitespace text is accepted; a missing, empty, or whitespace-only title is rejected.
- A four-digit original release year no later than the current calendar year is accepted; a missing, malformed, or future year is rejected.
- Each game requires at least one console model instance; an empty association is rejected, and one or more associations are accepted.
- ESRB rating may be absent. When present, only `EC`, `E`, `E10+`, `T`, `M`, `AO`, and `RP` are accepted.
- Maximum local multiplayer players may be absent. When present, positive integers are accepted and zero or negative values are rejected.
- Cover image URL may be absent. When present, an absolute HTTP or HTTPS URL is accepted; relative URLs and other schemes are rejected.
- Personal comments may be absent or empty; no arbitrary maximum text length is imposed.
- The concrete supported-console catalog is not invented or hard-coded in this phase. A console catalog and membership validation are addressed with the schema and seed data in Phase 1.2.
- Focused JUnit tests cover each rule, and the backend build and test suite pass.

## Checks

From the repository root on Windows, run the backend Maven Wrapper build and tests:

```powershell
Set-Location backend
.\mvnw.cmd test
.\mvnw.cmd package
```

The test command must compile and execute the focused JUnit domain tests with no failures. The package command must complete successfully. If the repository later documents a narrower test selector, it may be used in addition to the module test command.

## Completion and merge readiness

- All acceptance criteria above are implemented and verified by automated tests.
- The relevant backend test and package commands pass.
- The change stays within Phase 1.1: no database schema or migration, API endpoint, frontend, or BFF work is included.
- No unresolved product decision blocks implementation; the console catalog is explicitly deferred to Phase 1.2.

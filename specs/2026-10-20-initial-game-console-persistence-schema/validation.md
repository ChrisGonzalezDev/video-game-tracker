# Validation: Initial Game and Console Persistence Schema

## Acceptance criteria

- A clean PostgreSQL database can be initialized by the backend's Flyway migrations without manual schema creation.
- The schema contains relational storage for games, supported consoles, and game-console associations, with foreign keys and uniqueness rules that prevent dangling or duplicate relationships.
- The migration seeds the 96 released console platforms from generations 2 through 9 in the user-confirmed source scope, with regional aliases represented once and source attribution included.
- A persisted game can be read back with its title, original release year, optional ESRB rating, optional maximum local multiplayer player count, optional cover image URL, personal comments, and all associated consoles preserved.
- Required game data is enforced, optional fields may be absent, and persistence rejects games with no console association.
- Invalid or orphaned console associations cannot be persisted.
- Focused PostgreSQL-backed tests are reproducible and do not depend on an undocumented preconfigured local database.
- The backend Maven build and focused persistence/migration tests pass before the feature is considered complete and ready to merge.

## Checks

Run the backend build from `backend/` using the repository's Maven Wrapper:

```powershell
.\mvnw.cmd package
```

Run focused persistence and migration tests using the test selectors established by the implementation, for example:

```powershell
.\mvnw.cmd -Dtest=<persistence-test-class> test
```

The implementation must also demonstrate migration against a clean PostgreSQL database using the selected reproducible test setup. The exact test class names and database-test command are not established yet and should be documented when implemented.

## Merge-readiness conditions

- The supported-console catalog follows the user-confirmed generations 2–9 scope and contains exactly 96 entries.
- All migrations apply to a clean PostgreSQL database.
- Focused tests cover persisted game fields, game-console association round trips, and relational integrity, including invalid or missing associations.
- The backend Maven build and focused PostgreSQL-backed tests pass.
- Any checks that cannot be run are reported as outstanding; they are not represented as successful.

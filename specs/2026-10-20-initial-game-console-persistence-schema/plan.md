# Plan: Initial Game and Console Persistence Schema

## Roadmap phase

**Phase 1.2 - Create the initial database schema**

## Task groups

1. **Resolve the console catalog and persistence test setup**
   - Use the user-confirmed scope: released home console platforms from generations 2 through 9 in the linked source, excluding unreleased systems and regional aliases as separate entries.
   - Use PostgreSQL Testcontainers for reproducible integration tests.
   - **Completion check:** The catalog scope and source attribution are recorded, and integration tests use a disposable PostgreSQL database.

2. **Add Flyway migrations for the relational schema**
   - Add Flyway to the backend and create versioned migrations for games, consoles, and the game-console association.
   - Add keys, foreign keys, uniqueness, nullability, and domain-aligned constraints; avoid arbitrary text length limits.
   - Add catalog seed data using only released systems in the confirmed generations 2 through 9 scope, with source attribution.
   - **Completion check:** All migrations apply in order to a clean PostgreSQL database and seed the 96-entry catalog in the confirmed scope.

3. **Implement game persistence**
   - Map the existing domain fields to the schema and provide backend persistence operations for storing and retrieving games and their console associations.
   - Preserve domain validation, including the requirement that each persisted game has at least one console.
   - **Completion check:** Focused persistence tests round-trip game fields and console associations without losing optional values or violating domain rules.

4. **Verify migration and relational integrity**
   - Add PostgreSQL-backed tests for migration startup, persistence, foreign-key behavior, uniqueness, and required relationships.
   - Run the backend Maven build and relevant focused tests.
   - **Completion check:** Clean-database migration, persistence/integrity tests, and the backend build all pass; no check is reported as passing unless it was run.

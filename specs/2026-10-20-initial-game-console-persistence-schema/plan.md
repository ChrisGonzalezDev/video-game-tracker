# Plan: Initial Game and Console Persistence Schema

## Roadmap phase

**Phase 1.2 - Create the initial database schema**

## Task groups

1. **Resolve the console catalog and persistence test setup**
   - Confirm the exact supported-console names before writing catalog seed data.
   - Select a reproducible PostgreSQL-backed test mechanism compatible with the backend's Maven configuration.
   - **Completion check:** Catalog values and the test-database approach are recorded in the implementation change; no unsupported values are assumed.

2. **Add Flyway migrations for the relational schema**
   - Add Flyway to the backend and create versioned migrations for games, consoles, and the game-console association.
   - Add keys, foreign keys, uniqueness, nullability, and domain-aligned constraints; avoid arbitrary text length limits.
   - Add catalog seed data using only the values confirmed in Task Group 1.
   - **Completion check:** All migrations apply in order to a clean PostgreSQL database, and the resulting schema and catalog match the confirmed model.

3. **Implement game persistence**
   - Map the existing domain fields to the schema and provide backend persistence operations for storing and retrieving games and their console associations.
   - Preserve domain validation, including the requirement that each persisted game has at least one console.
   - **Completion check:** Focused persistence tests round-trip game fields and console associations without losing optional values or violating domain rules.

4. **Verify migration and relational integrity**
   - Add PostgreSQL-backed tests for migration startup, persistence, foreign-key behavior, uniqueness, and required relationships.
   - Run the backend Maven build and relevant focused tests.
   - **Completion check:** Clean-database migration, persistence/integrity tests, and the backend build all pass; no check is reported as passing unless it was run.

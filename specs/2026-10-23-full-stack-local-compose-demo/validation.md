# Validation — Full-stack Local Compose Demo

## Acceptance criteria

1. **Configuration and builds:** `docker compose config` succeeds and `docker compose build` builds the frontend, BFF, and backend images.
2. **One-command startup:** On a clean checkout with Docker Compose and documented local `.env` values, the documented Compose command starts PostgreSQL and all three application services without requiring manual module startup.
3. **Readiness:** Compose reports each service healthy or ready, and application services do not report ready before their required dependencies are available.
4. **Service communication:** The frontend is reachable at its documented host URL; collection requests pass through the BFF to the backend and PostgreSQL. Container-to-container connections use Compose service names, not `localhost`.
5. **Migrations and demonstration data:** Flyway applies the existing schema migrations, supported consoles are present, and deterministic sample games can be read through the normal collection UI or API.
6. **Persistent normal shutdown:** Create or otherwise verify a game record, run the documented normal `docker compose down`, then start the stack again. The record remains available and the demo seed does not create duplicates.
7. **Documentation and secret handling:** The documented setup, configuration, host URLs, health verification, and shutdown procedure match the Compose implementation; local credentials come from `.env` and no secret is committed.

## Verification checks

- Run `docker compose config` to validate interpolation and the resolved service configuration.
- Build all Compose application images.
- Use a clean, disposable Compose project for startup and persistence checks so validation does not remove or overwrite a user's existing database volume.
- Start the stack using the documented command and check service status/health.
- Open the frontend and verify that a collection read succeeds through the BFF and backend with migrated database state and sample game data.
- Stop and restart with the documented non-destructive procedure; confirm application data remains and the seed is idempotent.
- Run relevant existing module tests if implementation changes application runtime configuration or request behavior.

## Complete and mergeable when

All seven acceptance criteria pass, the documented setup is accurate for a clean local environment, and the Compose stack can be stopped normally without losing persistent database data. This specification does not claim that any of these checks have been run.

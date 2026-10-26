# Implementation Plan — Full-stack Local Compose Demo

## 1. Define container builds and runtime configuration

Create container build definitions for the frontend, BFF, and backend, and establish the environment variables and internal URLs each service needs in Compose. Build the frontend as a static bundle served by its container.

**Completion check:** Each application image builds from the repository, and its runtime configuration supports Compose service-name connections without relying on `localhost` for another container.

## 2. Wire the complete Compose stack

Extend the root Compose configuration to include the frontend, BFF, backend, and existing PostgreSQL service. Configure host ports, persistent database storage, readiness-aware dependencies, and health checks. Ensure backend startup applies Flyway migrations and add a separate idempotent SQL seed for deterministic demo games.

**Completion check:** Compose configuration resolves all required services and settings; the stack can start in dependency order with migrations and demo data available.

## 3. Document local setup and operation

Update the relevant README and development instructions with prerequisites, `.env.example` setup, the full-stack startup command, host URLs and health verification, configuration, and data-preserving shutdown guidance.

**Completion check:** A new user can follow the documented steps without manual module startup, and the instructions accurately describe the implemented service names, URLs, and data behavior.

## 4. Verify the integrated local demonstration

Validate the rendered Compose configuration and image builds, then exercise startup, service readiness and communication, migrations, sample data, and persistence through a normal stop/restart cycle using a clean disposable Compose project.

**Completion check:** Every acceptance criterion in `validation.md` is demonstrated without deleting a user's existing Compose volume.

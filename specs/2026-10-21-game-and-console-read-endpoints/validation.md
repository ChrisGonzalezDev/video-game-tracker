# Game and Console Read Endpoints — Validation

## Acceptance criteria

1. **Game retrieval:** `GET /api/v1/games/{id}` returns `200` and a game response containing its positive integer database ID and all contract-defined game fields when the game exists.
2. **Missing game:** A request for an ID with no matching game returns `404` with a valid contract-shaped API error whose code is `GAME_NOT_FOUND`.
3. **Invalid ID and server failures:** Invalid identifiers and unexpected failures use the applicable documented status and error behavior, with no success-shaped fallback response.
4. **Console catalog:** `GET /api/v1/consoles` returns `200` with the supported console catalog in the contract-defined representation, ordered by name ascending.
5. **Persistence fidelity:** A retrieved game's associated consoles and nullable optional fields reflect persisted data; endpoint mapping does not change the domain or persistence model.
6. **Automated coverage:** Backend tests verify successful game retrieval, missing-game status and error body, successful console listing, and console ordering.
7. **Scope:** No mutation, search/pagination, BFF/frontend, schema, or migration work is needed to satisfy this phase.

## Checks

- Run focused backend tests for the game and console read endpoints.
- From `backend/`, run the project's Maven verification command (for example, `.\mvnw.cmd verify`).
- Compare response fields, status codes, and error schemas with `contracts/openapi.yaml`.
- Verify that the console ordering assertion checks ascending names and that the missing-game test checks both `404` and `GAME_NOT_FOUND`.

## Complete and mergeable when

- All acceptance criteria pass.
- Both read operations are reachable under `/api/v1` and use the maintained OpenAPI contract.
- Focused backend tests and Maven verification succeed.
- No validation check is described as having run until implementation is completed and the check has actually been executed.

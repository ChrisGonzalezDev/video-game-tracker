# Validation: BFF Docker-Free Mock Mode

## Acceptance criteria

- From the `bff` module, the documented mock command starts the BFF without a running Spring Boot backend, PostgreSQL, or Docker.
- The mock-mode BFF returns the existing `/health` response and contract-shaped responses for each supported game and console route.
- Mocked create, replace, and delete responses are deterministic and do not mutate the fixture collection or persist across requests or restarts.
- Invalid route inputs continue to receive the existing BFF validation response without being treated as successful mock operations.
- At least one representative backend error response is passed through the existing normalization/error-mapping path and produces the expected HTTP status and `ApiError` body.
- The default development and start commands continue to use the live backend client and respect `BACKEND_API_URL`; mock behavior is not selected unless explicitly requested.
- The development documentation identifies prerequisites, startup command, fixed-response behavior, and the absence of persistence.

## Checks

Run from the `bff` directory:

1. `npm test` — verifies mock responses, BFF route validation, response/error mapping, and unchanged live-client behavior.
2. `npm run build` — verifies the BFF TypeScript code compiles.
3. `npm run dev:mock` — verify `/health` and representative game and console routes respond without starting the backend or Docker.
4. `npm run dev` — verify the default configuration remains the live backend mode; the backend may be absent, but the BFF must not silently return mock responses.

## Completion and merge conditions

- All acceptance criteria are met.
- The focused BFF test suite and TypeScript build pass.
- Both mock and default startup behavior have been verified and are documented accurately.

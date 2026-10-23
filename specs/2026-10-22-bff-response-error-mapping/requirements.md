# BFF Response and Error Mapping — Requirements

## Purpose

Give the frontend predictable success and failure responses through the Express
BFF by aligning downstream errors with the maintained API error contract. This
completes [roadmap Phase 3.2](../roadmap.md), after BFF route implementation and
before live frontend integration.

## User and use cases

- **Primary user:** An individual managing a personal video game collection.
- **Use collection operations:** Receive game and console data through the BFF
  without depending on backend-specific transport behavior.
- **Recover from failures:** Receive a stable, documented error representation
  when a request is invalid, a game is missing, or the backend is unavailable.

## Scope

- Apply consistent response handling to the existing game and console BFF
  routes.
- Preserve successful backend response status and representation, including
  bodyless `204` responses and response metadata needed by callers.
- Use the `ApiError` shape documented in `contracts/openapi.yaml` for errors:
  `code`, `message`, and `details`, with field-level details containing
  `field` and `message`.
- For a valid downstream 4xx `ApiError`, preserve the status and documented
  error data.
- Map malformed or unexpected downstream failures and backend transport
  failures to HTTP `502` with a stable generic `INTERNAL_SERVER_ERROR` ApiError
  envelope. Do not expose backend implementation details or transport error
  messages in that response.
- Keep the existing request validation behavior and standalone `/health`
  response.
- Add BFF tests covering mapped and pass-through response behavior, and update
  directly related BFF development documentation.

## Confirmed decisions

- The selected roadmap phase is Phase 3.2, **Map backend responses and errors**.
- The maintained OpenAPI `ApiError` schema is the frontend-facing error shape.
- Successful downstream responses remain compatible with existing behavior.
- Valid downstream 4xx errors retain their status and documented error data.
- Malformed or unexpected downstream failures and transport failures become a
  generic HTTP 502 `INTERNAL_SERVER_ERROR` response, without leaking backend
  details.
- The implementation is limited to BFF response/error mapping; it does not
  change the backend contract or connect the frontend to the BFF.

## Non-goals

- Changes to backend domain behavior, persistence, or the OpenAPI contract.
- Frontend data-source or TanStack Query integration (Phase 3.3).
- Cross-layer integration tests, Docker Compose, or end-to-end workflows
  (Phase 4).
- Authentication, multi-user ownership, or production deployment configuration.

## Assumptions and dependencies

- `contracts/openapi.yaml` remains the source for the `ApiError` schema and
  valid error codes.
- Existing BFF game and console routes and backend client remain the request
  boundary.
- Callers can rely on HTTP status together with the documented error envelope
  to distinguish client errors from unavailable or invalid upstream responses.
- BFF Jest tests can inject downstream responses and transport failures without
  requiring a running Spring Boot service or PostgreSQL instance.

## Unresolved decisions

None identified for this phase.

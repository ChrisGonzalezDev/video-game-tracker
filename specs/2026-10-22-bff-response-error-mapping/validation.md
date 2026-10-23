# BFF Response and Error Mapping — Validation

## Acceptance criteria

### Successful responses

- Successful downstream statuses and response bodies remain unchanged at the
  BFF, including create responses and bodyless `204` responses.
- Relevant successful response metadata, including `Content-Type` and
  `Location` where present, remains available to callers.
- `GET /health` continues to return `{"status":"ok"}` independently of backend
  availability.

### Error responses

- A downstream 4xx response with a valid OpenAPI `ApiError` retains its status
  and documented `code`, `message`, and `details`.
- A malformed 4xx error payload, unexpected downstream failure, or backend
  transport failure returns HTTP `502` with a stable `ApiError` envelope using
  code `INTERNAL_SERVER_ERROR` and an empty `details` array.
- The mapped 502 response does not expose backend response internals, stack
  traces, or transport exception messages.
- Error mapping applies consistently to every game and console route.

### Regression and boundaries

- Automated route tests cover successful response compatibility and each
  failure category using an injected/mock backend; no running backend or
  database is required.
- Request validation and downstream request forwarding remain unchanged.
- The OpenAPI contract and backend behavior are not modified, and the frontend
  remains fixture-backed until Phase 3.3.
- BFF development documentation describes the implemented status and error
  mapping behavior.

## Checks

From `bff/`, run the Jest suite and TypeScript build:

```powershell
npm test
npm run build
```

## Complete and mergeable when

- All success, error, health, and regression acceptance criteria are covered
  by passing automated tests.
- `npm test` and `npm run build` pass from `bff/`.
- The documented error contract matches the behavior verified by the tests.
- No backend contract/domain changes or Phase 3.3 frontend integration are
  included.

# BFF Game and Console Routes — Validation

## Acceptance criteria

### Routes and request forwarding

- `GET /api/v1/games` forwards all supported query parameters, including
  repeated console filters, without dropping or changing their values.
- `POST /api/v1/games` forwards a valid JSON request body to the backend.
- `GET`, `PUT`, and `DELETE /api/v1/games/{id}` forward the requested game ID;
  `PUT` forwards the JSON request body.
- `GET /api/v1/consoles` requests the backend console catalog.
- Malformed route IDs, invalid query parameter forms, and malformed or missing
  JSON bodies where required produce a client error and are not sent as
  successful downstream requests. Domain-specific validation remains the
  backend's responsibility.

### Response and failure behavior

- Successful downstream responses retain their HTTP status and body, including
  the `201` create response and a bodyless `204` delete response.
- Downstream HTTP failures are not converted into successful BFF responses.
- A backend transport failure is surfaced as a non-success HTTP response; it
  never produces success-shaped fallback data. Exact error normalization is
  left to Phase 3.2.
- `GET /health` continues to return `{"status":"ok"}` without requiring the
  backend to be available.
- The BFF uses `BACKEND_API_URL` when set and defaults to
  `http://localhost:8080/api/v1` when unset.

### Regression and boundaries

- Automated HTTP tests cover every scoped route and method using a mocked
  backend; client tests cover request and response behavior independently.
- The maintained OpenAPI contract and backend behavior are unchanged.
- The frontend continues to use its fixture-backed data source; no live BFF
  integration is introduced in this phase.

## Checks

From `bff/`, run the Jest suite and TypeScript build:

```powershell
npm test
npm run build
```

Verify local startup with the documented BFF development command. Route tests
must not depend on a running Spring Boot service or PostgreSQL instance.

## Complete and mergeable when

- All route, forwarding, response, error, and health acceptance criteria are
  covered by passing automated tests.
- `npm test` and `npm run build` pass from `bff/`.
- The BFF remains independently startable, with its backend URL configurable
  through the environment.
- No backend contract/domain changes, Phase 3.2 response/error translation, or
  Phase 3.3 frontend integration have been included.

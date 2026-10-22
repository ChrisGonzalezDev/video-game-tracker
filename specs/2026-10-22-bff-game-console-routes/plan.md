# BFF Game and Console Routes — Plan

## Task groups

1. **Add backend client configuration and transport**
   - Define typed client operations for the contracted game and console
     endpoints.
   - Read `BACKEND_API_URL`, using `http://localhost:8080/api/v1` as the local
     default; allow a runtime override without changing source.
   - Forward query parameters and JSON request bodies and retain the downstream
     status and response body, including bodyless `204` responses.
   - Surface transport failures explicitly rather than returning fallback
     success data.
   - **Completion check:** Client tests verify URL/configuration behavior,
     request method/path/query/body forwarding, downstream response handling,
     and transport failure behavior.

2. **Implement and test BFF HTTP routes**
   - Add all scoped game and console routes while retaining `GET /health`.
   - Handle query parameters, route IDs, and JSON bodies at the HTTP boundary;
     leave domain validation to the backend.
   - Add or configure Jest for focused client and route tests, with a mocked
     downstream backend.
   - **Completion check:** HTTP tests exercise every route and method, request
     forwarding, successful response statuses/bodies (including `201` and
     `204`), invalid requests, downstream HTTP failures, and connection
     failures. Health behavior remains unchanged.

3. **Document configuration and verify the BFF**
   - Update the BFF development documentation with the new routes and
     `BACKEND_API_URL` setting, following existing repository documentation
     conventions.
   - **Completion check:** `npm test` and `npm run build` pass from `bff/`, and
     the BFF remains independently startable with its local backend URL
     default.

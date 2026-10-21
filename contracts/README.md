# Backend API contract

`openapi.yaml` is the maintained OpenAPI 3.1.0 source of truth for the planned
Spring Boot API under `/api/v1`. The contract describes game/console operations,
search behavior, request validation, response shapes, errors, and health status.
It documents intended behavior; it does not imply that the backend endpoints
have been implemented.

The contract currently defines no authentication requirement. Redocly's
`info-license` rule is disabled because the repository does not declare an API
license. Its `operation-4xx-response` rule is disabled because the console-list
and health operations accept no application-level input and therefore have no
defined client-error response.

## Validate changes

Use Node.js 22.12 or newer and npm. From this directory, install the pinned
development dependency and validate the contract:

```powershell
npm ci
npm run validate
```

The validation script runs Redocly CLI against `openapi.yaml`. It exits
unsuccessfully when the document has OpenAPI errors. Update this contract and
keep the validation command passing whenever the backend API contract changes.

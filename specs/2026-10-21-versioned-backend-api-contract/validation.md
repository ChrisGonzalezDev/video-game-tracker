# Versioned Backend API Contract — Validation

## Acceptance criteria

1. **Versioned operation coverage:** The OpenAPI document declares the `/api/v1` API and includes exactly the planned operation set:
   - `GET /games`
   - `GET /games/{id}`
   - `POST /games`
   - `PUT /games/{id}`
   - `DELETE /games/{id}`
   - `GET /consoles`
   - `GET /health`
2. **Game and console schemas:** Every game field represented by the current domain is documented with its chosen type, optionality/nullability, and applicable constraints. The contract represents consoles and the ESRB rating values consistently with the existing model and seed data.
3. **Search contract:** The games collection operation documents keyword search, supported filters, sorting, pagination inputs, and the shape and meaning of pagination metadata. Defaults, limits, allowed sort choices, and combination semantics are explicit.
4. **Mutation and retrieval behavior:** Create, retrieve, update, and delete document their request and success response shapes, status codes, and missing-resource behavior. The update operation explicitly documents whether its request is a full replacement or partial update.
5. **Errors:** Validation and malformed-input failures use a documented error schema and status mapping. Not-found behavior for a missing game is documented with a representative response.
6. **Health behavior:** The health operation documents its success response and any documented failure behavior.
7. **Validation is repeatable:** A repository command is documented to validate the maintained OpenAPI document with the selected validator. Running it on the committed contract succeeds; invalid OpenAPI content causes a nonzero exit or equivalent visible validation failure.
8. **Scope is respected:** No backend endpoint, BFF route, frontend workflow, schema migration, or roadmap change is required to satisfy Phase 1.3.

## Checks

- From `contracts/`, run the documented install and OpenAPI validation commands.
- Review the document against the seven-operation inventory in the README and roadmap.
- Review game and console schemas against the existing Java domain records, ESRB enum, and database constraints.
- Confirm that all query parameters, defaults, limits, status codes, and error shapes needed by clients are explicit in the contract.

## Complete and mergeable when

- All acceptance criteria pass.
- The contract and validation command are committed in the maintained `contracts/` location and are usable without implementing application endpoints.
- The requirements, plan, and validation documents agree on scope and resolved API conventions.
- No check is represented as having run until it has actually been executed and its result recorded during implementation.

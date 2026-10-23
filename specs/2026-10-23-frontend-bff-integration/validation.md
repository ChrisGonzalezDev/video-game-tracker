# Frontend–BFF Integration Validation

**Roadmap phase:** 3.3 — Connect the frontend to the BFF

## Acceptance criteria

1. The app's default collection data source calls the relative BFF `/api/v1` routes; no frontend request targets the Spring Boot service directly.
2. Collection requests preserve supported keyword, console, rating, player-bound, sort, direction, and page criteria in the BFF request.
3. Collection, game detail, and console data are loaded from the BFF-backed data source. Loading, empty, and failed-request states are visible and recoverable.
4. Creating or updating a game sends the expected request and, after success, the relevant detail and collection views reflect server-returned data without a full-page reload.
5. Deleting a game requires explicit confirmation. Cancelling sends no DELETE request and leaves collection data unchanged. Confirmed deletion sends the expected request and refreshes the collection; a failed deletion leaves the game context available and presents an error.
6. The fixture data source can still be injected into UI tests, and existing collection behavior remains covered.
7. The implementation does not change BFF/backend contracts. Any required contract change is separately resolved and validated rather than silently added to this phase.

## Automated checks

- Add/extend Jest and Testing Library tests with MSW handlers to assert read and mutation paths, HTTP methods, query serialization (including repeated console parameters), request payloads, and response/error behavior.
- Verify TanStack Query refresh/invalidation after successful create, update, and delete; verify delete cancellation has no network side effect.
- Verify user-visible loading, empty, success, and error/recovery behavior for the relevant flows.
- Run `npm test` and `npm run build` in `frontend`.
- If BFF source or contract files must change to resolve an explicitly approved mismatch, run the relevant BFF tests and `npm run build` in `bff`, plus the applicable contract validation workflow.

## Complete and mergeable when

- All acceptance criteria above are met.
- Focused frontend tests and the frontend build pass.
- Any BFF/contract changes, if approved and necessary, pass their relevant checks.
- No secrets or service-specific backend URLs are added to browser code, and directly related configuration/documentation is updated.
- This specification defines checks only; it does not assert that implementation or validation has already occurred.

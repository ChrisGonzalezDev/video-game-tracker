# Validation: Frontend MSW Mock Mode

## Acceptance criteria

1. **Standalone startup:** From `frontend/`, the documented opt-in command (proposed: `npm run dev:mock`) starts the frontend and serves the application without Docker, the BFF, or the backend.
2. **Collection workflows:** In mock mode, the existing UI can browse the collection; search, combine supported filters, sort, and paginate; view a game and supported consoles; create and edit a game; and delete a game. These actions use the existing `/api/v1` request shapes.
3. **Mock behavior:** Mock collection results reflect the requested query criteria, and successful game mutations are reflected in subsequent mock reads during the current page session. Reloading resets the in-memory data.
4. **Shared test handlers:** Jest uses the same handler definitions as browser mock mode. Tests cover collection query behavior, detail and console reads, create/update/delete, and representative API error responses. Per-test handler overrides continue to work.
5. **Opt-in and default behavior:** The regular development command does not enable MSW and continues to proxy `/api` to the BFF. Mock mode is enabled only through the explicit opt-in command/configuration.
6. **Production exclusion:** A production build neither registers the browser worker nor includes the mock handler/runtime in its output.
7. **Regression checks:** The frontend Jest suite and production build complete successfully.
8. **Documentation:** The development guide documents startup prerequisites, the command, supported behavior, and in-memory reset semantics. The README describes the frontend mock mode without implying completion of the separate BFF or backend mock modes.

## Validation checks

- From `frontend/`, run `npm test -- --runInBand` (or the repository-equivalent Jest command) and confirm all frontend tests pass, including the shared-handler coverage.
- From `frontend/`, run `npm run build` and inspect the production output to confirm the browser mock worker and handler runtime are absent and no worker registration is active.
- Start the documented mock-mode command with Docker and the other application services stopped. Verify the collection and game mutation flows listed above in the browser; verify changes appear in the current session and reset after reload.
- Start the normal frontend development command and verify `/api` requests continue to target the configured BFF proxy and MSW is not enabled.
- Review the README and development guide against the shipped command and behavior.

## Complete and mergeable when

- All acceptance criteria are met.
- Focused frontend tests and the production build pass.
- Standalone mock-mode and default development behavior have both been verified.
- Documentation accurately reflects the implementation and does not claim that later roadmap mock modes are complete.

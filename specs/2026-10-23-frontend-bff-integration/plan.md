# Frontend–BFF Integration Plan

**Roadmap phase:** 3.3 — Connect the frontend to the BFF

## 1. Add TanStack Query infrastructure

**Outcome:** The frontend has a configured QueryClient and a provider at the application boundary.

**Completion check:** The app renders through the provider, and frontend TypeScript/build checks pass with the new dependency.

## 2. Implement the BFF-backed collection data source

**Outcome:** A typed HTTP data source uses relative `/api/v1` routes for collection, game, and console reads and for create, update, and delete operations.

**Completion check:** Query parameters, repeated console filters, request bodies, response data, and HTTP errors are handled consistently with the existing contracts; fixture injection remains available.

## 3. Connect collection and detail reads

**Outcome:** Collection criteria and game/console screens load through TanStack Query and the BFF-backed data source.

**Completion check:** Search, filters, sorting, and pagination produce requests for the selected criteria, and the UI presents loading, empty, error, and retry/recovery states without losing existing behavior.

## 4. Connect create and update mutations

**Outcome:** Existing create and edit forms submit through the BFF and keep collection/detail data synchronized.

**Completion check:** Successful mutations show the returned game and refresh or invalidate the relevant cached queries; failed mutations remain visible and do not report success.

## 5. Add the confirmed delete flow

**Outcome:** The user can initiate deletion from an appropriate game view, explicitly confirm or cancel, and receive a clear result.

**Completion check:** Cancel performs no DELETE request; confirmed deletion uses the BFF, refreshes the collection, and navigates to a useful collection state; failures preserve the game context and expose a recoverable error.

## 6. Add focused integration coverage and update relevant docs

**Outcome:** The frontend's service-backed behavior is covered with MSW tests and any necessary setup guidance is current.

**Completion check:** Tests assert request paths, methods, query parameters, bodies, cache refresh/invalidation, and visible loading/error/success/cancel behavior. Documentation describes any required BFF URL/proxy configuration if one is introduced.

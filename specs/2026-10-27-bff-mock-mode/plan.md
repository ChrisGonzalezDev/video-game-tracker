# Plan: BFF Docker-Free Mock Mode

## 1. Add contract-shaped static mock backend responses

**Outcome:** The BFF can obtain deterministic game and console responses without making backend HTTP requests.

**Work:**

- Implement a mock backend client conforming to the existing `BackendClient` interface.
- Provide fixed success responses for the supported game and console operations, plus representative contract-shaped client errors such as a missing game.
- Return fixed operation responses for create, replace, and delete without mutating fixtures or retaining state.

**Completion check:** Focused tests verify the mock client returns the expected status, headers, and body for supported success and error cases, and that mutation requests do not change subsequent fixture responses.

## 2. Wire mock mode as an explicit BFF startup option

**Outcome:** Developers can start the BFF without the backend while the normal routes and response handling remain in use.

**Work:**

- Add an explicit `dev:mock` package script and startup selection for the mock backend client.
- Keep normal `dev` and `start` startup on the existing live backend client and `BACKEND_API_URL` configuration.
- Reuse `createApp` and its request validation, response normalization, and error mapping for both backend-client implementations.

**Completion check:** Mock startup serves the existing health and API routes without backend connectivity; default startup still constructs the live backend client.

## 3. Verify and document the mock mode

**Outcome:** The mock mode has reproducible tests and clear local usage instructions.

**Work:**

- Add route-level tests using the mock backend client for successful responses, mapped backend errors, and invalid requests.
- Document the mock command, Node.js prerequisite, fixed response behavior, and lack of persistence in the development guide.
- Update README status wording only if needed to accurately distinguish the completed frontend mock mode from the BFF mock mode.
- Run the focused BFF tests and TypeScript build.

**Completion check:** The validation criteria pass and documentation does not imply that mock writes persist or that the backend mock profile is included.

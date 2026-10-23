# BFF Response and Error Mapping — Plan

## Task groups

1. **Define typed downstream response and error mapping**
   - Reuse the maintained `ApiError` schema as the source for valid error codes
     and details.
   - Specify validation for downstream 4xx error envelopes and the generic
     502 `INTERNAL_SERVER_ERROR` fallback for malformed, unexpected, and
     transport failures.
   - **Completion check:** Mapping logic has explicit typed inputs/outputs and
     returns the agreed status and error envelope for each failure category.

2. **Apply mapping consistently to BFF routes**
   - Route downstream responses through the shared mapping behavior without
     changing successful response status, body, or relevant metadata.
   - Preserve request validation and `/health`; avoid exposing internal
     downstream or transport details to callers.
   - **Completion check:** Route tests demonstrate consistent mapping across
     game and console operations and unchanged success behavior.

3. **Verify and document the BFF response contract**
   - Add focused tests for valid 4xx errors, malformed error payloads,
     unexpected downstream failures, transport failures, and successful
     response compatibility.
   - Update the BFF development documentation with the error mapping behavior.
   - **Completion check:** BFF tests and TypeScript build pass, and the
     documentation matches the tested behavior.

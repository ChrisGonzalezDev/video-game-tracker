# Validation — Project License Selection and Publication

## Acceptance criteria

1. **Root license:** A root-level `LICENSE` file exists and contains the standard MIT license terms.
2. **Attribution:** The license identifies **Copyright (c) 2026 Chris Gonzalez**.
3. **README identification:** The README License section explicitly identifies the project license as MIT.
4. **README link:** The README contains a relative link to the root `LICENSE` file, and that link resolves in the repository.
5. **Third-party boundaries:** The README and license-related guidance do not represent third-party assets, data, or dependencies as covered by the project license unless their own terms permit it.
6. **Asset and data review:** Relevant repository-owned assets and bundled data have been checked for separate licensing or attribution requirements; any identified notices are preserved or documented, and material with unclear reuse rights is not silently represented as project-owned.
7. **Consistency:** No existing repository licensing statement contradicts the selected MIT license or its scope.
8. **Scope control:** The change is limited to the root license, the README License section, and any directly necessary asset/data attribution clarification; application behavior and unrelated documentation remain unchanged.

## Verification checks

- Inspect the `LICENSE` file for the MIT terms and confirmed copyright line.
- Verify that the README names MIT and that its relative license link resolves to the root `LICENSE` file.
- Review tracked repository-owned assets and bundled data for relevant notices and confirm any separate terms are preserved.
- Search the repository's licensing statements for conflicting project-level claims.
- Review the diff to confirm that no unrelated files or application behavior changed.

## Complete and mergeable when

All acceptance criteria pass, the project-level license is accurately identified and linked, and the asset/data review has not left an identified attribution or rights issue unaddressed. No automated application tests are required for this documentation and license-file change. This specification does not claim that any checks have been run.

# Requirements — Project License Selection and Publication

## Roadmap phase

**Phase 5.1 — Choose and add a project license**

## Purpose and users

Give maintainers and portfolio viewers a clear statement of the permissions for using, modifying, and distributing repository-owned project work, while preserving the separate terms that apply to third-party material.

## Scope

- Add the MIT License as a root-level `LICENSE` file.
- Set the copyright attribution to **Chris Gonzalez, 2026**.
- Update the README License section to identify MIT and link to the root license file.
- Review repository-owned assets and bundled data for existing licensing or attribution requirements that could conflict with or need clarification alongside the project license.
- Keep any third-party assets, data, and dependencies governed by their own applicable terms; do not imply that the project license changes those terms.

## Non-goals

- Changing application behavior, dependencies, or build configuration.
- Re-licensing third-party content or making legal conclusions about material without a clear grant of rights.
- Adding an inventory of all dependency licenses or a software bill of materials.
- Updating other project status or roadmap documentation.

## Confirmed decisions

- The repository project license will be **MIT**.
- The copyright attribution will be **Chris Gonzalez, 2026**.
- The license will be placed at the repository root and referenced from the README License section.
- The proposed three-task implementation sequence and validation criteria are confirmed.
- The license applies only to material the project is entitled to license; third-party terms remain separate.

## Assumptions

- The named copyright holder is authorized to license the repository-owned project work.
- The year in the attribution is 2026.
- A standard MIT license notice is appropriate for the project's intended reuse.

## Dependencies

- No application or runtime dependencies.
- Before publishing the license, the implementation must review repository-owned assets and bundled data for relevant rights and attribution notices.

## Relevant context

- The project is a single-user video game collection application and a portfolio demonstration.
- The README already has a License section that points to a future root `LICENSE` file and cautions against assuming unrestricted reuse before a license is added.
- No root-level `LICENSE*` file or tracked media asset/license notice was found during specification preparation. The implementation still needs to review the repository-owned assets and bundled data relevant to publication.
- The technology stack and architecture are unchanged by this phase.

## Unresolved questions

No product decisions remain unresolved for this phase.

# Tasks: Logo Icon — Lowercase "f" in Times New Roman

Implementation checklist. Check off items as they are completed during the apply phase.

## Milestone 1: Icon edit

- [x] T1.1 In `src/components/header.js`, inside the logo `data:image/svg+xml` URI: change `font-family='serif'` → `font-family='Times New Roman'` and `>F<` → `>f<`. Keep `data-trap="TR-02"`, no `alt`, all other attributes unchanged.
- [x] T1.2 Verify in dev: header icon shows lowercase "f" in Times New Roman; wordmark still "Faro"; Ctrl+M still annotates TR-02.

## Milestone 2: New structural test

- [x] T2.1 Create `src/tests/logo-icon.test.js` with the 3 cases from design §4 (lowercase f + Times New Roman in src, TR-02 intact, wordmark "Faro").
- [x] T2.2 Run `npm test` — all tests pass.

## Milestone 3: Documentation

- [x] T3.1 Write `openspec/changes/logo-icon-lowercase/apply-progress.md`.
- [x] T3.2 Write `openspec/changes/logo-icon-lowercase/verify-report.md`.

## Milestone 4: Final verification

- [x] T4.1 Run `npm run build` — must succeed with no errors.
- [x] T4.2 Run `npm test` — all tests pass.
- [x] T4.3 Visual check in dev on home + another screen (header renders everywhere).

## Notes

- Single-attribute edit inside a data-URI; the decoded SVG is documented in design §2.
- Do not add `alt` or change the `<img>` — TR-02 must remain a trap.

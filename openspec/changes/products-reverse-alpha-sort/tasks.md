# Tasks: Products listing sorted in reverse alphabetical order

Implementation checklist. Tasks are ordered by dependency. Check off items as they are completed during the apply phase.

## Milestone 1: Sorting in `getFilteredProducts` (`src/data/products.js`)

- [x] T1.1 Hoist `lang` resolution to the top of `getFilteredProducts` (shared by the filter predicate and the comparator).
- [x] T1.2 Append `.sort((a, b) => localizedName(b).localeCompare(localizedName(a), lang, { sensitivity: 'base' }))` to the filtered array — descending by localized name, without mutating `products`.

## Milestone 2: Structural test (`src/tests/products-reverse-alpha-sort.test.js`)

- [x] T2.1 Create the test file with the 5 cases from design §5: ES sequence, EN sequence, rendered DOM order, filtered subset order, catalog array immutability.
- [x] T2.2 Run `npm test` — all tests pass (new + existing suite).

## Milestone 3: Documentation

- [x] T3.1 Write `openspec/changes/products-reverse-alpha-sort/apply-progress.md`.
- [x] T3.2 Write `openspec/changes/products-reverse-alpha-sort/verify-report.md`.

## Milestone 4: Final verification

- [x] T4.1 Run `npm run build` — must succeed with no errors.
- [x] T4.2 Run `npm test` — all tests pass.
- [x] T4.3 Manual in dev: `#/products` shows Z→A in ES and EN; filtering/searching keeps the order; home featured unchanged.

## Notes

- Single-file implementation; the sort belongs in the data layer (`getFilteredProducts`) so every caller inherits it.
- No `data-trap`, registry, checklist, i18n, or CSS changes — this is a functional evolution, not a trap correction.

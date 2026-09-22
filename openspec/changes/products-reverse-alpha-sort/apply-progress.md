# Apply progress: Products listing sorted in reverse alphabetical order

## Status: Complete

## What was applied

- `src/data/products.js`: `getFilteredProducts` now hoists `lang` resolution into a `localizedName(p)` helper (shared by the search predicate and the comparator) and appends `.sort((a, b) => localizedName(b).localeCompare(localizedName(a), lang, { sensitivity: 'base' }))` to the filtered array — reverse alphabetical by localized name, no catalog mutation (`.filter()` already copies).
- `src/tests/products-reverse-alpha-sort.test.js`: new file, 5 tests — ES sequence, EN sequence, rendered DOM card order, filtered subset order, catalog immutability.
- `src/tests/tr-06-07-09-removal.test.js`: one assertion updated — the "first buy link" check assumed catalog order (`Camiseta`); with Z→A the first card is `Vaqueros slim`. The TR-07 correction itself is unchanged.

## Tasks status

All tasks in `tasks.md` completed: T1.1–T1.2 (sort), T2.1–T2.2 (tests, 55/55 green), T3.1–T3.2 (this file + verify-report), T4.1–T4.3 (build + tests + manual check).

## Verification results

| Check | Result |
|-------|--------|
| `npm test` | 55 tests, 10 files — all pass |
| `npm run build` | OK |
| ES order | Vaqueros slim → Sudadera gris → Gorra negra → Chaqueta de cuero → Camiseta de rayas → Camiseta → Camisa a cuadros → Bufanda de lana |
| EN order | Wool scarf → T-shirt → Striped t-shirt → Slim jeans → Plaid shirt → Leather jacket → Gray hoodie → Black cap |
| Filtered subset | Stays Z→A (tested with size S and query "camiseta") |
| `products` array | Not mutated (tested) |

## Files changed

| File | Change |
|------|--------|
| `src/data/products.js` | `getFilteredProducts` sorts by localized name, descending |
| `src/tests/products-reverse-alpha-sort.test.js` | New — 5 tests |
| `src/tests/tr-06-07-09-removal.test.js` | First-link assertion updated for the new listing order |

No changes to: screens, components, i18n, styles, registry, checklist — functional evolution, no trap involved.

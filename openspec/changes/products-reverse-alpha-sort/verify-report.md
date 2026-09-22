# Verify report: Products listing sorted in reverse alphabetical order

## Verdict: PASS

## Automated verification

| Requirement | Evidence |
|-------------|----------|
| REQ-700-01 reverse-alpha by localized name | Tests assert the exact Z→A sequences for `lang="es"` and `lang="en"` |
| REQ-700-02 ordering after filtering | Test: size filter `['S']` → `['Sudadera gris','Chaqueta de cuero','Camiseta de rayas','Camiseta','Camisa a cuadros']`; query `'camiseta'` → `['Camiseta de rayas','Camiseta']` |
| REQ-700-03 catalog not mutated | Test snapshots `products` ids before/after `getFilteredProducts` |
| REQ-700-04 no UI/trap changes | Diff touches only `products.js` + tests; no `data-trap`, registry, i18n, or CSS change |

## Test results

```
Test Files  10 passed (10)
Tests       55 passed (55)
```

`npm run build`: OK (Vite).

## Manual review notes

- `localizedName` fallback (`|| p.name.es`) preserved for missing locales.
- `sensitivity: 'base'` makes ordering case/accent-insensitive and deterministic across engines.
- Home featured (`products.slice(0,4)`) and carousel order confirmed untouched — they read the raw `products` array.
- TR-08 (positive tabindex on cards) is index-based: the broken tab order still applies, now relative to the new visual order — trap preserved.

## Known limitations / notes

- The order is fixed Z→A with no UI control — per spec (REQ-700-04).
- ES and EN produce different sequences (alphabetical order is inherently per-locale) — documented in spec §Scenarios.
- One existing test in `tr-06-07-09-removal.test.js` depended on catalog order; its assertion was updated to the new first card (`Comprar — Vaqueros slim`). No behavioral regression.

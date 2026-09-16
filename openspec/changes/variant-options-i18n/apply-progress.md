# Apply Progress: Variant Options i18n

## Status: COMPLETE

All 8 milestones implemented. Build passes. 29/29 tests pass (22 existing + 7 new).

## What was built

### Milestone 1: i18n foundation
- `variantLabel(type, value)` helper in `src/i18n/index.js` — resolves `t('variant.<type>.<value>')`, falls back to the raw value when no key exists (language-neutral sizes render unchanged)
- 8 new keys in `src/i18n/es.js`: `variant.size.one-size` = "Talla única"; `variant.color.*` = Azul, Negro, Blanco, Gris, Verde, Rojo, Marrón
- Same 8 keys in `src/i18n/en.js`: "One size"; Blue, Black, White, Gray, Green, Red, Brown

### Milestone 2: Canonical data
- `src/data/products.js`: p007 and p008 `sizes: ['Única', 'One size']` → `sizes: ['one-size']`
- `getFilteredProducts` untouched — canonical value on both sides of the comparison

### Milestone 3: Filters
- `src/components/filters.js`: `allSizes` ends with a single `'one-size'` entry
- `<span>` labels render via `variantLabel('size', ...)` / `variantLabel('color', ...)`; checkbox `value`, `onchange`, and filter state keep canonical values
- TR-06 preserved: still `<span>`, not `<label>`; `data-trap="TR-06"` intact

### Milestone 4: Variant selector + detail
- `src/components/variant-selector.js`: options render `variantLabel(type, value)` and carry `data-value="${value}"`; `onclick` still passes canonical values
- `src/screens/product-detail.js`: `handleVariantSelected` marks selection via `el.dataset.value === value` (was `textContent` comparison — would have broken with localized text)
- TR-09 preserved: still `<div>` + `onclick`, no role/name; `data-trap="TR-09"` intact

### Milestone 5: Cart line item
- `src/components/cart-item.js`: `.cart-item-variant` renders `variantLabel('size', item.size) · variantLabel('color', item.color)` — "Talla única · Rojo" in es

### Milestone 6: New structural test
- `src/tests/variant-options-i18n.test.js` — 7 cases:
  1. Single `one-size` filter option, "Talla única" label, no `Única`/`One size` inputs
  2. Color labels localized in es and en (incl. "One size" in en)
  3. Variant selector renders one `data-value="one-size"` option labeled "Talla única" for p007
  4. `variant-selected` event marks the option via `data-value` (Rojo label, red value)
  5. Cart line item shows "Talla única · Rojo"
  6. Filtering by `one-size` returns exactly p007 + p008
  7. Filtering by canonical `blue` still works

### Milestone 7: Documentation
- `docs/verification-checklist.md`: informational note in the Product listing section (labels localized; not a trap change — TR-06/TR-09 still apply)
- This file + `verify-report.md`

### Milestone 8: Final verification
- `npm run build` — OK (vite, 27 modules)
- `npm test` — 29/29 pass; trap-registry still reports 18 traps
- Grep `Única|One size` in `src/` — no raw data values remain (only the en.js label "One size", the es.js label "Talla única", and the test asserting their absence as values)

## Files changed

| File | Change |
|------|--------|
| `src/i18n/index.js` | `variantLabel()` helper |
| `src/i18n/es.js` | 8 `variant.*` keys |
| `src/i18n/en.js` | 8 `variant.*` keys |
| `src/data/products.js` | `one-size` canonical (p007, p008) |
| `src/components/filters.js` | Single one-size option; localized `<span>` labels |
| `src/components/variant-selector.js` | Localized option text + `data-value` |
| `src/screens/product-detail.js` | `dataset.value` selection matching |
| `src/components/cart-item.js` | Localized variant text |
| `src/tests/variant-options-i18n.test.js` | New — 7 tests |
| `docs/verification-checklist.md` | Informational note |

## Requirements coverage

| Req | Status |
|-----|--------|
| REQ-VOI-01 single canonical one-size | Done — `one-size` in data, filters, selection, cart |
| REQ-VOI-02 one option, localized | Done — "Talla única" / "One size" |
| REQ-VOI-03 localized color labels | Done — 7 colors, canonical keys preserved |
| REQ-VOI-04 neutral sizes unchanged | Done — fallback renders `S`, `28`, … raw |
| REQ-VOI-05 filtering semantics | Done — `getFilteredProducts` untouched, tested |
| REQ-VOI-06 selection with labels | Done — `data-value` matching, canonical state |
| REQ-VOI-07 labels in i18n tables | Done — parity enforced by i18n test |
| REQ-VOI-08 traps preserved | Done — TR-06/TR-09 markup and `data-trap` intact |

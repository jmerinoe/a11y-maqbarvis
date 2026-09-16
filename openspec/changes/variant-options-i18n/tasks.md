# Tasks: Variant Options i18n

Implementation checklist. Tasks are ordered by dependency — each milestone builds on the previous. Check off items as they are completed during the apply phase.

## Milestone 1: i18n foundation

- [x] T1.1 Add `variantLabel(type, value)` helper to `src/i18n/index.js`: resolves `t('variant.<type>.<value>')`, returns the raw value when the key is missing (fallback comparison against the key string).
- [x] T1.2 Add the 8 new keys to `src/i18n/es.js` under a `// Variant options` comment: `variant.size.one-size` = "Talla única"; `variant.color.*` = Azul, Negro, Blanco, Gris, Verde, Rojo, Marrón.
- [x] T1.3 Add the same 8 keys to `src/i18n/en.js`: "One size"; Blue, Black, White, Gray, Green, Red, Brown.
- [x] T1.4 Run `npm test` — i18n completeness test must still pass (ES/EN key parity, no empty values).

## Milestone 2: Canonical data

- [x] T2.1 In `src/data/products.js`, change p007 `sizes: ['Única', 'One size']` → `sizes: ['one-size']`.
- [x] T2.2 Same for p008.
- [x] T2.3 Verify `getFilteredProducts` needs no change (canonical value on both sides of the comparison).

## Milestone 3: Filters

- [x] T3.1 In `src/components/filters.js`, update `allSizes` to end with a single `'one-size'` entry (remove `'Única'` and `'One size'`).
- [x] T3.2 Import `variantLabel` and render `<span>${variantLabel('size', size)}</span>` / `<span>${variantLabel('color', color)}</span>`. Keep `value` and `onchange` on canonical values. Keep the `<span>` (TR-06 preserved — no `<label>`).
- [x] T3.3 Verify manually in dev: page in es → colors "Azul, Negro, ...", one "Talla única" option; check it → only p007/p008 shown. Toggle to en → "Blue, ...", "One size".

## Milestone 4: Variant selector + detail

- [x] T4.1 In `src/components/variant-selector.js`, render `${variantLabel(type, value)}` as option text and add `data-value="${value}"` to each option div. Keep `data-trap="TR-09"`, `<div>` + `onclick`, no role/name (TR-09 preserved).
- [x] T4.2 In `src/screens/product-detail.js`, change `handleVariantSelected` to `el.dataset.value === value` (remove `textContent` comparison).
- [x] T4.3 Verify manually: p007 detail shows one "Talla única" size option and Spanish color names; clicking an option still marks it `selected` and add-to-cart still works with the canonical values.

## Milestone 5: Cart line item

- [x] T5.1 In `src/components/cart-item.js`, render `${variantLabel('size', item.size)} · ${variantLabel('color', item.color)}` in `.cart-item-variant`.
- [x] T5.2 Verify manually: add a one-size red item with page in es → cart shows "Talla única · Rojo".

## Milestone 6: New structural test

- [x] T6.1 Create `src/tests/variant-options-i18n.test.js` with the 6 cases from design §8 (single one-size option, es/en color labels, selector option, data-value selection, localized cart text, one-size filtering).
- [x] T6.2 Run `npm test` — all tests pass (existing + new); trap-registry test still reports 18 traps.

## Milestone 7: Documentation

- [x] T7.1 Add an informational note in the "Product listing" section of `docs/verification-checklist.md`: variant labels are now localized and one-size is a single option (moderator awareness, not a trap change).
- [x] T7.2 Write `openspec/changes/variant-options-i18n/apply-progress.md` documenting what was changed and verification results.
- [x] T7.3 Write `openspec/changes/variant-options-i18n/verify-report.md` with the verification outcome (build + tests + manual checks).

## Milestone 8: Final verification

- [x] T8.1 Run `npm run build` — must succeed with no errors.
- [x] T8.2 Run `npm test` — all tests pass.
- [x] T8.3 Verify no `Única`/`One size` raw values remain in `src/` (grep) and all `data-trap` attributes are unchanged.
- [x] T8.4 Manual full pass in dev, both languages: filters, variant selector, cart line item.

## Notes

- Milestone 1 (i18n) comes first because milestones 3–5 depend on `variantLabel` and the new keys.
- Milestone 2 (data) must land before or with Milestone 3 so the `one-size` filter value matches product data.
- T4.2 is not optional polish: without `data-value` matching, selecting a localized option silently fails to mark it selected.
- TR-06 and TR-09 are intentionally preserved — do not "improve" checkbox labels or selector roles while editing this markup.

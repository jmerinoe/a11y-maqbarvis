# Apply Progress: TR-06 + TR-07 Removal, TR-09 Partial Removal

## Status: COMPLETE

All 7 milestones implemented. Build passes. 50/50 tests pass (42 existing + 8 new).

## What was built

### Milestone 1: TR-06 — labeled filter checkboxes (`src/components/filters.js`)
- Each checkbox now has a unique `id` (`filter-size-{size}`, `filter-color-{color}`) and the adjacent `<span>` became `<label for="{id}">` with the localized `variantLabel` text.
- All 10 sizes (M included — the M exception applies only to the detail selector) and all 7 colors are labeled.
- `data-trap="TR-06"` removed; header/comments updated.

### Milestone 2: TR-07 — contextual buy links (`src/components/product-card.js`, i18n)
- New i18n key `products.buyNamed`: es `'Comprar — {name}'`, en `'Buy — {name}'`.
- Card link text is now `t('products.buyNamed', { name })` — unique per product, matching the registry fix snippet.
- `data-trap="TR-07"` removed. TR-08 (`tabindex`, `data-trap` on `<article>`) untouched.

### Milestone 3: TR-09 — semantic selector, M excepted
- `src/components/variant-selector.js`: wrapper is now `<fieldset class="variant-selector" data-variant-type>` + `<legend class="variant-label">` with `role="radiogroup"` on `.variant-options`. Non-M options render as `<div class="variant-option" data-value role="radio" aria-checked tabindex="0" onclick onkeydown>` — **ARIA radios** so every option is its own Tab stop (owner's follow-up: Tab must reach all sizes/colors; a native radio group only contributes one tab-stop, and `tabindex="0"` on the inputs does not override that — verified in-browser). The M size keeps the trapped `<div data-trap="TR-09" onclick>` markup — with `tabindex="0"` (owner's follow-up: Tab navigation must not skip M) and `onkeydown` → `window.__faroSelectVariantKey` (all sizes must be selectable — Enter/Space now selects M). The trap persists in semantics only: no role, no accessible name — NVDA announces a generic clickable it cannot identify as a group option.
- `src/screens/product-detail.js`: `handleVariantSelected` now also syncs `aria-checked` inside the group — ARIA radios have no native exclusivity.
- `src/styles/main.css`: `.variant-option:focus-visible` focus ring (ARIA radios + the focusable M div) and `fieldset.variant-selector` reset.
- `bindVariantSelectorEvents` gained `window.__faroSelectVariantKey` — Enter/Space activation for the M div (with `preventDefault` so Space doesn't scroll); everything dispatches `variant-selected`.

### Milestone 4: Trap registry correction
- `src/traps/registry.js`: TR-06 and TR-07 entries removed; TR-09 kept with updated es/en description (partial — only M remains broken); header comment 17 → 15.
- `src/tests/trap-registry.test.js`: 15 traps; `TR-06`/`TR-07` removed from `expectedIds`; title updated to "(TR-03, TR-06, TR-07, TR-11 corrected)".
- `src/traps/README.md`: corrected list now mentions TR-03, TR-06, TR-07, TR-11 and the TR-09 partial correction.

### Milestone 5: New structural test
- `src/tests/tr-06-07-09-removal.test.js` — 8 cases:
  1. Every filter checkbox (17) has `id` + matching `label[for]`; M filter labeled; no `data-trap="TR-06"`
  2. Buy links unique and contain the localized product name; no `data-trap="TR-07"`
  3. Selector is `fieldset`+`legend`+`radiogroup`; non-M sizes and all colors are `role="radio"` options with `aria-checked` + `tabindex="0"` (own Tab stop)
  4. Exactly one `data-trap="TR-09"` element — the M `<div>` with `onclick` + `onkeydown`, `tabindex="0"`, no role, no name
  5. `variant-selected` for L selects it (`.selected` + `aria-checked="true"`); then for M — M selected, radios reset to `aria-checked="false"`
  6. Color labels localized in EN; swatch `style` on the label
  7. Registry: 15 traps; TR-06/TR-07 absent; TR-09 present
  8. `__faroSelectVariantKey` selects M on Enter; ignores non-activation keys
- Note: tests dispatch the `variant-selected` CustomEvent directly instead of firing inline `onchange` — jsdom evaluates inline handlers in its own window scope, where `window.__faroSelectVariant` is unreachable (same pattern as `cart-add-feedback.test.js`).

### Milestone 6: Documentation
- `docs/verification-checklist.md`: TR-06/TR-07 blocks → corrected-behavior notes in Product listing; TR-09 block rewritten for the partial trap; the "variant options localized" note updated to reference both corrections.
- This file + `verify-report.md`.

### Milestone 7: Final verification
- `npm test` — 49/49 pass; registry reports 15 traps
- `npm run build` — OK (vite, no errors)
- Grep `data-trap="TR-06"`/`"TR-07"` in `src/` — only test assertions; `data-trap="TR-09"` only on the M-option branch of `variant-selector.js`

## Files changed

| File | Change |
|------|--------|
| `src/components/filters.js` | `id` + `<label for>` per checkbox; `data-trap` removed |
| `src/components/product-card.js` | Named buy link via `products.buyNamed`; `data-trap` removed |
| `src/components/variant-selector.js` | fieldset/legend + ARIA radios; M keeps trapped div (+`tabindex="0"`) |
| `src/screens/product-detail.js` | `handleVariantSelected` syncs `aria-checked` |
| `src/styles/main.css` | `:focus-visible` ring on `.variant-option`, fieldset reset |
| `src/i18n/es.js`, `src/i18n/en.js` | New `products.buyNamed` key |
| `src/traps/registry.js` | TR-06/TR-07 removed; TR-09 description updated; 17 → 15 |
| `src/tests/trap-registry.test.js` | 15 traps; ID list; title |
| `src/traps/README.md` | Corrected-traps note updated |
| `docs/verification-checklist.md` | TR-06/TR-07 notes; TR-09 rewritten; i18n note updated |
| `src/tests/tr-06-07-09-removal.test.js` | New — 7 tests |

## Requirements coverage

| Req | Status |
|-----|--------|
| REQ-690-01 labeled filter checkboxes | Done — `id` + `<label for>` on all 17 checkboxes; tested |
| REQ-690-02 buy links identify product | Done — `Comprar — {name}` visible text; unique; tested |
| REQ-690-03 semantic ARIA radio group | Done — fieldset/legend + `role="radio"` options for non-M sizes and all colors, each Tab-focusable; tested |
| REQ-690-04 M keeps the trap | Done — only `data-trap="TR-09"` element is the M div; tested |
| REQ-690-05 coherent mixed selection | Done — handler syncs `.selected` + `checked`; tested both directions |
| REQ-690-06 visible focus on options | Done — `:focus-visible` outline (ARIA radios + M div) |
| REQ-690-07 registry/docs correction | Done — 15 traps; README, checklist, registry test updated |
| REQ-690-08 no regression to other traps | Done — TR-08/TR-10/etc. intact; moderator.test.js passes |

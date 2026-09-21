# Proposal: TR-06 + TR-07 Removal, TR-09 Partial Removal — Labeled Filters, Contextual Links, Semantic Variant Selector

## Why

Three traps remain in the product listing and product detail screens that block screen reader users from two critical steps of the purchase flow: **choosing filters** and **knowing what they are buying / which variant they pick**.

- **TR-06** (SC 1.3.1 / 3.3.2): filter checkboxes in `filters.js` render a bare `<input>` next to a plain `<span>` — NVDA announces "checkbox" with no name. A SR user cannot tell which size or color each checkbox filters.
- **TR-07** (SC 2.4.4): every product card in `product-card.js` renders an identical "Comprar" link — the links list reads "Comprar" × N with no product context.
- **TR-09** (SC 4.1.2): the variant selector in `variant-selector.js` is a `<div>`+`onclick` widget with no role and no accessible name — options are announced as meaningless clickables and cannot be operated reliably by keyboard.

Following the TR-03 / TR-11 precedent, the traps are corrected with proper implementations and the registry is updated — with one deliberate exception requested by the owner:

> **The M size option keeps the trap.** TR-09 becomes a *partial* correction: every size **except M** and every color becomes a real radio input; the M option stays a broken `<div>`+`onclick` with `data-trap="TR-09"` — focusable (`tabindex="0"`, so Tab doesn't skip it) and selectable via a `keydown` handler (all sizes must be selectable), but still without role or accessible name. This preserves a live, annotatable defect inside an otherwise correct widget — a strong demo contrast ("one option in the group can't be identified").

## What Changes

### Scope

1. **TR-06 — labeled filter checkboxes** (`filters.js`) — each `<input type="checkbox">` gets a unique `id` and the adjacent `<span>` becomes a `<label for="...">`. All sizes (**including the M filter**) and all colors are labeled. `data-trap="TR-06"` removed; registry entry removed.
2. **TR-07 — contextual buy links** (`product-card.js`) — the card link text becomes `Comprar — {name}` / `Buy — {name}` via a new i18n key `products.buyNamed`. `data-trap="TR-07"` removed; registry entry removed.
3. **TR-09 — semantic variant selector, M excepted** (`variant-selector.js`, `product-detail.js`, `main.css`) — the selector becomes a `<fieldset>` + `<legend>` group of native `<input type="radio">` elements wrapped in `<label class="variant-option">`. **Exception:** when `type === 'size'` and `value === 'M'`, the old broken `<div data-trap="TR-09">` markup is rendered instead (with `tabindex="0"` + `onkeydown` so it stays in the tab order and remains selectable). TR-09 stays in the registry with an updated description noting the partial correction.

### Out of scope

- Any other trap: TR-01, TR-02, TR-04, TR-05, TR-08, TR-10, TR-12–TR-19 remain intact. In particular **TR-08** (positive `tabindex` on cards) and **TR-10** (price in separate region) are untouched.
- The M filter checkbox on the listing — it is labeled like the rest (the exception applies only to the product-detail variant selector).
- Products without an M size (p003, p007, p008) — their selectors become fully corrected; no `data-trap="TR-09"` renders on those pages.
- Visual redesign: corrected options keep the existing pill/swatch look (visually-hidden radio + styled label).
- Cart, checkout, confirmation, header, search, moderator internals.

## How

### Architecture approach

1. `filters.js` — emit `<input id="filter-{group}-{value}">` + `<label for>`; drop `data-trap` and the TR-06 comment.
2. `product-card.js` — link text `t('products.buyNamed', { name })`; drop `data-trap="TR-07"`.
3. `variant-selector.js` — render `<fieldset class="variant-selector"><legend>`; options are `<label class="variant-option" data-value>` wrapping a visually-hidden `<input type="radio" name="variant-{type}-{productId}">`; the M size keeps the trapped `<div>` (with `tabindex="0"` + `onkeydown` → `__faroSelectVariantKey`, so it stays in the tab order and is selectable with Enter/Space). `onchange`/`onclick`/`onkeydown` all dispatch through `window.__faroSelectVariant` → `variant-selected` CustomEvent.
4. `product-detail.js` — `handleVariantSelected` also syncs `input.checked` inside the group (selecting the M div must uncheck the radios, and vice versa).
5. `main.css` — add `.visually-hidden` utility and `.variant-option:focus-within`/`:focus-visible` focus ring so keyboard focus is visible on the hidden radios and the M div.
6. `registry.js` — remove TR-06/TR-07 entries; update TR-09 description (partial: only M remains broken); header comment 17 → 15.
7. `trap-registry.test.js` — 15 traps; ID list drops TR-06/TR-07; title updated.
8. `src/traps/README.md` — corrected list: TR-03, TR-06, TR-07, TR-11; TR-09 partially corrected.
9. `docs/verification-checklist.md` — TR-06/TR-07 blocks → corrected-behavior notes; TR-09 block rewritten for the partial trap.
10. New test `src/tests/tr-06-07-09-removal.test.js`.

### Testing strategy

New structural test covering: every filter checkbox has a matching label; card links are unique and contain the product name; selector exposes fieldset/legend + radios for non-M sizes and all colors; the M option is still a `data-trap="TR-09"` div (focusable via `tabindex="0"`, selectable via `onkeydown`); radio change updates selection and selecting M unchecks radios; registry contains 15 traps with TR-09 still present.

### Delivery

Single PR. Files: `filters.js`, `product-card.js`, `variant-selector.js`, `product-detail.js`, `main.css`, `es.js`, `en.js`, `registry.js`, `trap-registry.test.js`, `traps/README.md`, `verification-checklist.md`, new test. Small diff.

## Assumptions

- "La M mantiene la trampa" applies to the product-detail variant selector only — the listing's M filter checkbox is corrected like the others (TR-06 is fully removed).
- Keeping `data-trap="TR-09"` on the M option means the moderator still annotates TR-09 — which is desired for the demo.
- The `fix` snippets already in `registry.js` define the target markup (`<label for>` for TR-06, named link for TR-07, fieldset+radio for TR-09) — the implementation follows them.
- Selecting M must remain functionally possible for mouse users (the broken div keeps its `onclick`) — consistent with REQ-AT-04 (traps impede accessibility, not function).

## Risks

| Risk | Mitigation |
|------|------------|
| Mixed widget (radios + one div) confuses `handleVariantSelected` state | Handler syncs both `.selected` class and `input.checked` within the group; covered by test |
| Visually-hidden radios break keyboard focus visibility | `.variant-option:focus-within` outline restores a visible focus indicator (`:focus-visible` covers the M div) |
| M option unreachable by keyboard is inconsistent with a "corrected" page | Intentional — owner requested the partial trap; `tabindex="0"` + `onkeydown` keep it focusable and selectable while remaining unidentifiable; documented in spec, registry, and checklist |
| fieldset/legend default styling breaks layout | CSS reset (`border:0; padding:0; margin:0`) on `.variant-selector` fieldset |
| `products.buyNamed` key missing in one language | `i18n.test.js` enforces ES/EN key parity automatically |

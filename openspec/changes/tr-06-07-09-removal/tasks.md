# Tasks: TR-06 + TR-07 Removal, TR-09 Partial Removal

Implementation checklist. Tasks are ordered by dependency. Check off items as they are completed during the apply phase.

## Milestone 1: TR-06 — labeled filter checkboxes (`filters.js`)

- [x] T1.1 Give each checkbox a unique `id` (`filter-size-{size}`, `filter-color-{color}`) and replace the adjacent `<span>` with `<label for="{id}">` (label text keeps `variantLabel`).
- [x] T1.2 Remove `data-trap="TR-06"` from both checkbox templates and update the TR-06 comments to reflect the correction.

## Milestone 2: TR-07 — contextual buy links (`product-card.js`, i18n)

- [x] T2.1 Add `products.buyNamed` to `src/i18n/es.js` (`'Comprar — {name}'`) and `src/i18n/en.js` (`'Buy — {name}'`).
- [x] T2.2 Change the card link text to `t('products.buyNamed', { name })`; remove `data-trap="TR-07"`; update comments (TR-08 untouched).

## Milestone 3: TR-09 — semantic selector, M excepted (`variant-selector.js`, `product-detail.js`, `main.css`)

- [x] T3.1 `variant-selector.js`: outer wrapper → `<fieldset class="variant-selector" data-variant-type>` + `<legend class="variant-label">`.
- [x] T3.2 Non-M options → `<div class="variant-option" data-value role="radio" aria-checked tabindex="0" onclick onkeydown>` inside a `role="radiogroup"` container — ARIA radios give **every** option its own Tab stop (native radio groups only contribute one, even with `tabindex="0"` on each input); color swatch `style` stays on the option.
- [x] T3.3 M size option → keep the trapped `<div data-trap="TR-09" ... onclick>` markup plus `tabindex="0"` and `onkeydown` → `__faroSelectVariantKey` (focusable, selectable with Enter/Space, still no role/name; only element carrying the marker).
- [x] T3.4 `product-detail.js`: in `handleVariantSelected`, sync `input.checked` inside the group alongside `.selected` toggling.
- [x] T3.5 `main.css`: `.variant-option:focus-visible` outline and `fieldset.variant-selector` reset (no `.visually-hidden` needed — options are visible divs).

## Milestone 4: Trap registry correction

- [x] T4.1 Remove TR-06 and TR-07 entries from `src/traps/registry.js`; update TR-09 `description.es`/`.en` for the partial correction; header comment 17 → 15.
- [x] T4.2 Update `src/tests/trap-registry.test.js`: 15 traps; drop `'TR-06'`, `'TR-07'` from `expectedIds`; title → `(TR-03, TR-06, TR-07, TR-11 corrected)`.
- [x] T4.3 Update `src/traps/README.md` corrected-traps note (TR-03, TR-06, TR-07, TR-11 corrected; TR-09 partial — M keeps the trap).
- [x] T4.4 Run `npm test` — registry tests pass with 15 traps.

## Milestone 5: New structural test

- [x] T5.1 Create `src/tests/tr-06-07-09-removal.test.js` with the 7 cases from design §6.
- [x] T5.2 Run `npm test` — all tests pass.

## Milestone 6: Documentation

- [x] T6.1 `docs/verification-checklist.md`: remove TR-06/TR-07 blocks, add corrected-behavior notes in Product listing; rewrite TR-09 block for the partial trap (M only).
- [x] T6.2 Write `openspec/changes/tr-06-07-09-removal/apply-progress.md`.
- [x] T6.3 Write `openspec/changes/tr-06-07-09-removal/verify-report.md`.

## Milestone 7: Final verification

- [x] T7.1 Run `npm run build` — must succeed with no errors.
- [x] T7.2 Run `npm test` — all tests pass.
- [x] T7.3 Grep: no `data-trap="TR-06"`/`"TR-07"` in `src/`; `data-trap="TR-09"` only on the M option path.
- [x] T7.4 Manual in dev: NVDA announces labeled filters, unique "Comprar — {name}" links, ARIA radio group for sizes/colors (Tab reaches every option) — except M, still a bare clickable (Tab-focusable and selectable, but unidentifiable) with a moderator badge.

## Notes

- Milestones 1–3 are independent of each other; M4 depends on all three.
- The M exception lives only in the size branch of `variant-selector.js`; the listing's M filter checkbox is corrected like the rest.
- `handleVariantSelected` must sync `aria-checked` — ARIA radios have no native exclusivity.
- The M div keeps `tabindex="0"` (Tab must not skip it) and gained `onkeydown` activation (owner follow-up: all sizes must be selectable) — the trap persists only in semantics: no role, no accessible name.

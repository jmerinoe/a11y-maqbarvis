# Tasks: Cart Add Feedback

Implementation checklist. Tasks are ordered by dependency — each milestone builds on the previous. Check off items as they are completed during the apply phase.

## Milestone 1: i18n foundation

- [x] T1.1 Extend `t(key, vars)` in `src/i18n/index.js` with `{var}` interpolation (regex `/\{(\w+)\}/g`, missing vars → empty string). Backward-compatible: no existing key contains `{...}`.
- [x] T1.2 Add `detail.validationMissing` and `detail.addedToCart` keys to `src/i18n/es.js` with `{attrs}` / `{name}` placeholders.
- [x] T1.3 Add the same two keys to `src/i18n/en.js` (i18n completeness test enforces parity).
- [x] T1.4 Run `npm test` — i18n completeness test must still pass (ES/EN key parity, no empty values).

## Milestone 2: Trap registry correction

- [x] T2.1 Remove the `TR-11` entry from `src/traps/registry.js` (the object with `id: 'TR-11'`).
- [x] T2.2 Update the file header comment in `registry.js` ("19 accessibility traps" → "18 accessibility traps").
- [x] T2.3 Update `src/traps/README.md` if it references the trap count "19".
- [x] T2.4 Update `src/tests/trap-registry.test.js`:
  - `should have exactly 19 traps` → `should have exactly 18 traps`
  - Replace `should have IDs from TR-01 to TR-19` with `should have IDs TR-01..TR-10 and TR-12..TR-19` using an explicit expected array.
- [x] T2.5 Run `npm test` — trap-registry tests must pass with 18 traps and the new ID set.

## Milestone 3: Product detail feedback

- [x] T3.1 In `src/screens/product-detail.js`, remove the `data-trap="TR-11"` attribute from the add-to-cart button.
- [x] T3.2 Remove the `// TR-11: ...` comment block above `window.__faroAddToCart`.
- [x] T3.3 Add two pre-declared live regions to the product detail template, after the add-to-cart row:
  - `<p id="add-to-cart-validation" class="validation-message" role="alert" aria-live="assertive"></p>`
  - `<p id="add-to-cart-confirmation" class="confirmation-message" role="status" aria-live="polite"></p>`
- [x] T3.4 Rewrite `window.__faroAddToCart` to:
  - Build `missing` list from `selectedSize` / `selectedColor`.
  - If `missing.length > 0`: clear confirmation region, set validation region text to `t('detail.validationMissing', { attrs: missing.join(', ') })`, return (do NOT add).
  - Else: call `addToCart(id, selectedSize, selectedColor)`, clear validation region, set confirmation region text to `t('detail.addedToCart', { name })` where `name` is the localized product name.
- [x] T3.5 Verify manually in dev: add without size/color → validation message appears; add with both → confirmation message appears; product is added only in the second case.

## Milestone 4: Live header counter

- [x] T4.1 In `src/main.js`, add a store subscriber that patches `.cart-count` text when the cart total quantity changes:
  - Track `lastCartCount` initialized from current state.
  - On each notify, recompute `count = state.cart.reduce((s, i) => s + i.quantity, 0)`.
  - If `count !== lastCartCount`: update `lastCartCount`, find `.cart-count`, set `textContent = String(count)` (guard if element missing).
- [x] T4.2 Verify manually: on product detail, add an item → header counter increments by 1 without navigating away. Add again → counter shows 2.

## Milestone 5: Styling

- [x] T5.1 Add `.validation-message` and `.confirmation-message` styles to `src/styles/main.css` (red/green text, `min-height: 1.2em` to prevent layout shift when empty).

## Milestone 6: New structural test

- [x] T6.1 Create `src/tests/cart-add-feedback.test.js` with 4 cases:
  1. Validation message shows and cart unchanged when size/color missing.
  2. Confirmation message shows (with product name, `role="status"`) and cart length === 1 when both selected.
  3. Header `.cart-count` updates to `'1'` on add without a full screen re-render.
  4. Validation message is cleared on a subsequent successful add.
- [x] T6.2 Run `npm test` — all tests pass (existing 15 + new 4 = 19, minus the modified trap-registry assertions).

## Milestone 7: Documentation

- [x] T7.1 Remove the "TR-11 — Add to cart no feedback" section from `docs/verification-checklist.md`.
- [x] T7.2 Add a short note in the "Product detail" section of `docs/verification-checklist.md` explaining that add-to-cart now announces correctly (reference implementation), so the moderator can contrast it with the remaining traps.
- [x] T7.3 Write `openspec/changes/cart-add-feedback/apply-progress.md` documenting what was changed and verification results.
- [x] T7.4 Write `openspec/changes/cart-add-feedback/verify-report.md` with the verification outcome (build + tests + manual checks).

## Milestone 8: Final verification

- [x] T8.1 Run `npm run build` — must succeed with no errors.
- [x] T8.2 Run `npm test` — all tests pass.
- [x] T8.3 Verify no `data-trap="TR-11"` remains in the built output.
- [x] T8.4 Manual: run the full add-to-cart flow in dev (select size+color → add → see confirmation + counter increment; add without selection → see validation, no increment).

## Notes

- Milestone 1 (i18n) comes first because Milestone 3 depends on the new keys and the interpolation in `t()`.
- Milestone 2 (registry) is independent and can be done in parallel with Milestone 1, but is listed second to keep the trap-correction concern together.
- The header counter patch (Milestone 4) is intentionally a targeted DOM patch, not a full re-render, to preserve product detail state and moderator overlays.
- The new live regions are pre-declared empty in the template (Milestone 3) so `aria-live` announces reliably in NVDA.

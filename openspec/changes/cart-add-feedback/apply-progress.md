# Apply Progress: Cart Add Feedback

## Status: COMPLETE

All 8 milestones implemented. Build passes. 22/22 structural tests pass.

## What was changed

### Milestone 1: i18n foundation
- `src/i18n/index.js` — `t(key, vars)` extended with `{var}` interpolation (regex `/\{(\w+)\}/g`, missing vars → empty string). Backward-compatible.
- `src/i18n/es.js` — added `detail.validationMissing` and `detail.addedToCart` keys with `{attrs}` / `{name}` placeholders.
- `src/i18n/en.js` — added the same two keys (English translations).

### Milestone 2: Trap registry correction
- `src/traps/registry.js` — removed the TR-11 entry; updated header comment "19 traps" → "18 traps".
- `src/traps/README.md` — updated the `id` field description to note TR-11 was corrected.
- `src/tests/trap-registry.test.js` — `should have exactly 19 traps` → `18 traps`; replaced the TR-01..TR-19 range assertion with an explicit TR-01..TR-10 + TR-12..TR-19 set.

### Milestone 3: Product detail feedback
- `src/screens/product-detail.js`:
  - Removed `data-trap="TR-11"` from the add-to-cart button.
  - Removed the TR-11 trap comment block.
  - Added two pre-declared `aria-live` regions after the add-to-cart row:
    - `#add-to-cart-validation` (`role="alert"`, `aria-live="assertive"`)
    - `#add-to-cart-confirmation` (`role="status"`, `aria-live="polite"`)
  - Rewrote `window.__faroAddToCart` to:
    - Build a `missing` list from `selectedSize` / `selectedColor`.
    - If missing → clear confirmation, set validation text (announced), do NOT add.
    - If both present → call `addToCart`, clear validation, set confirmation text with the localized product name.

### Milestone 4: Live header counter
- `src/main.js` — added a store subscriber that patches the `.cart-count` text node when the cart total quantity changes, without a full screen re-render (preserves product detail state and moderator overlays).

### Milestone 5: Styling
- `src/styles/main.css` — added `.validation-message` (red) and `.confirmation-message` (green) styles with `min-height: 1.2em` to prevent layout shift when empty.

### Milestone 6: New structural test
- `src/tests/cart-add-feedback.test.js` — 4 new tests:
  1. Validation message shows and cart unchanged when size/color missing.
  2. Confirmation message (with product name, `role="status"`) and cart length === 1 when both selected.
  3. Header `.cart-count` updates to `'1'` on add.
  4. Validation message cleared on subsequent successful add.

### Milestone 7: Documentation
- `docs/verification-checklist.md` — removed the "TR-11 — Add to cart no feedback" section; added a note explaining TR-11 is now the corrected reference implementation.

## Verification results
- `npm run build` — SUCCESS (27 modules, dist/ produced, no errors)
- `npm test` — 22/22 PASS (4 i18n + 6 trap-registry + 8 moderator + 4 cart-add-feedback)
- No `data-trap="TR-11"` attribute remains in `src/` or `dist/`
- Trap registry contains 18 traps (TR-01..TR-10, TR-12..TR-19)

## Notes
- The remaining matches for "TR-11" in source files are comments documenting the correction, not the trap attribute.
- The `faro-ecommerce` change's historical artifacts (apply-progress.md, verify-report.md, tasks.md, accessibility-traps/spec.md) are intentionally left unchanged — they document the state at that change's completion.

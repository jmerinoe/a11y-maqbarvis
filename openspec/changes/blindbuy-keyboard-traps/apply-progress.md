# Apply progress: BLIND BUY — fix the five keyboard traps

## M1 — Home/search fixes ✅

- `header.js` — `.skip-link` first inside `<header>` (`data-trap="TR-01"` dropped); `bindHeaderEvents` wires click → `preventDefault` (the hash would hit the router) + `main.setAttribute('tabindex','-1')` + `main.focus()`.
- `main.css` — `.skip-link` hidden-until-`:focus` styles (dark badge, top-left).
- i18n — `nav.skipToContent` (ES "Saltar al contenido" / EN "Skip to content"); reused existing `search.button` for the aria-label.
- `search-bar.js` — `<div onclick>` → `<button type="button" id="search-btn" aria-label>`; bound via `addEventListener` (inline `onclick`+global doesn't resolve in jsdom and is fragile anyway); `window.__faroSearch` kept for moderator/tests.

## M2 — Products/cart/checkout fixes ✅

- `product-card.js` — `tabindex` + `data-trap="TR-08"` dropped; cards follow DOM order.
- `cart.js` — `.cart-modal` is now `role="dialog" aria-modal="true" aria-labelledby="cart-title" tabindex="-1"`; `bindCartDialog` moves focus in on open, traps Tab/Shift+Tab inside, Escape → `#/products`, previous focus restored on close. `data-trap="TR-12"` dropped. Note: `renderScreen`'s generic h1-focus already skips `[role="dialog"]`, so the dialog keeps its focus.
- `checkout.js` — `firstInvalid.focus()` on failed submit; `data-trap="TR-18"` dropped.

## M3 — Registry, docs, tests ✅

- `registry.js` — 15 → 10 traps (TR-02/05/09/10/13/14/15/16/17/19); `traps/README.md` corrected list updated.
- Tests: `keyboard-trap-fixes.test.js` (new, 5 cases); `trap-registry.test.js` (10 + IDs); `moderator.test.js` (fixture TR-04→TR-02, wcag 4.1.2→1.1.1); `tr-06-07-09-removal.test.js` (count 10); `screen-titles.test.js` (cart expects `.cart-modal` focused).
- Suite: 24 files / 232 tests — all green.
- This file + `verify-report.md`.

# Apply progress: Empty cart must not reach checkout

## Status: Complete

## What was applied

- `src/components/cart-item.js`: new shared `refreshCart()` helper deduplicates the tbody/total refresh; when `cart.length === 0` after `updateCartQuantity` or `removeFromCart`, it re-renders `renderCart(document.getElementById('app'))` — the empty state appears and the checkout button and total are removed from the DOM. `renderCart` is imported from `screens/cart.js` (circular import, deferred runtime usage — same pattern as `filters.js` → `renderProducts`).
- `src/screens/checkout.js`: early guard — when `cart.length === 0`, `navigate('#/cart')` and return before any markup renders; covers direct `#/checkout` navigation.
- `src/tests/cart-empty-checkout.test.js`: new file, 4 tests — remove last item, decrement to zero, button stays with items, empty-cart checkout redirects.
- `src/tests/checkout-card-validation.test.js`, `src/tests/checkout-expiry-hint.test.js`: `beforeEach` now seeds `addToCart('p001','S','blue')` so the new guard doesn't redirect them.

## Tasks status

All tasks in `tasks.md` completed: T1.1–T1.2 (implementation), T2.1–T2.3 (tests, 63/63 green), T3.1–T3.2 (this file + verify-report), T4.1–T4.3 (build + tests + manual check).

## Verification results

| Check | Result |
|-------|--------|
| `npm test` | 63 tests, 12 files — all pass |
| `npm run build` | OK |
| Remove last item | Empty state rendered; `#/checkout` link and `cart-total` absent |
| Decrement to zero | Same empty-state behavior (`updateCartQuantity` removes at ≤0) |
| Items remain | Checkout button stays |
| Direct `#/checkout` empty | Redirects to `#/cart`, no form rendered |
| Traps preserved | TR-12/13/14/15/16/17/18 untouched |

## Files changed

| File | Change |
|------|--------|
| `src/components/cart-item.js` | `refreshCart()` helper; re-render on empty cart |
| `src/screens/checkout.js` | Empty-cart redirect to `#/cart` |
| `src/tests/cart-empty-checkout.test.js` | New — 4 tests |
| `src/tests/checkout-card-validation.test.js`, `src/tests/checkout-expiry-hint.test.js` | Seed cart item in `beforeEach` |
| `openspec/changes/empty-cart-checkout-guard/` | proposal, design, spec, tasks, apply-progress, verify-report |

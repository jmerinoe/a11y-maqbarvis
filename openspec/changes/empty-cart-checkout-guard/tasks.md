# Tasks: Empty cart must not reach checkout

Implementation checklist. Tasks are ordered by dependency. Check off items as they are completed during the apply phase.

## Milestone 1: Implementation

- [x] T1.1 `cart-item.js`: extract `refreshCart()` helper (tbody + total refresh deduplicated); re-render `renderCart` when the cart becomes empty. Import `renderCart` (circular-import pattern per `filters.js`).
- [x] T1.2 `checkout.js`: early `navigate('#/cart')` + return when `cart.length === 0`.

## Milestone 2: Structural test

- [x] T2.1 Create `src/tests/cart-empty-checkout.test.js` with the 4 cases from design §5.
- [x] T2.2 Seed one cart item in `checkout-card-validation.test.js` and `checkout-expiry-hint.test.js` `beforeEach` (the guard would otherwise redirect them).
- [x] T2.3 Run `npm test` — all tests pass (63/63).

## Milestone 3: Documentation

- [x] T3.1 Write `openspec/changes/empty-cart-checkout-guard/apply-progress.md`.
- [x] T3.2 Write `openspec/changes/empty-cart-checkout-guard/verify-report.md`.

## Milestone 4: Final verification

- [x] T4.1 Run `npm run build` — succeeds with no errors.
- [x] T4.2 Run `npm test` — all tests pass.
- [x] T4.3 Manual in dev: remove all cart items → checkout button gone; `#/checkout` direct → redirected to `#/cart`.

## Notes

- `updateCartQuantity(index, 0)` removes the item — the decrement path shares the same guard.
- `renderCart` re-render rebinds `__faroCartQty`/`__faroCartRemove` — no stale-handler risk.
- Circular import `cart.js` ↔ `cart-item.js` is safe: usage deferred to event-handler invocation (same as `filters.js` ↔ `products.js`).

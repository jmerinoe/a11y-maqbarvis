# Proposal: Empty cart must not reach checkout

## Why

The cart screen lets the user remove every item and still complete the purchase. `renderCart` shows the checkout button only when `cart.length > 0`, but the quantity/remove handlers (`__faroCartQty`, `__faroCartRemove`) only update the tbody rows and the total — they never re-render the screen. After deleting the last item, the checkout button stays visible and clickable. Additionally, `#/checkout` could be reached directly with an empty cart.

## What Changes

### Scope

1. **Re-render on empty cart** (`cart-item.js`) — a shared `refreshCart()` helper re-renders `renderCart` when the cart becomes empty after a remove or a decrement-to-zero (which also removes the item), so the empty state appears and the checkout button and total disappear.
2. **Checkout guard** (`checkout.js`) — `renderCheckout` redirects to `#/cart` when the cart is empty, covering direct URL navigation too.

### Out of scope

- All cart/checkout traps: TR-12, TR-13, TR-14, TR-15, TR-16, TR-17, TR-18 remain untouched.
- Cart item markup, quantity controls, totals computation.
- No i18n keys, styles, or registry changes.

## How

### Architecture approach

- `cart-item.js`: extract the duplicated post-operation DOM refresh into `refreshCart()`; if `cart.length === 0` it calls `renderCart(document.getElementById('app'))` — the same circular-import pattern already used by `filters.js` → `renderProducts` (deferred runtime call, safe for ES module cycles).
- `checkout.js`: early `navigate('#/cart')` + return when `cart` is empty — before any DOM rendering.

### Testing strategy

New test `src/tests/cart-empty-checkout.test.js`: removing the last item hides the checkout button and shows the empty state; decrementing to zero does the same; the button stays while items remain; `renderCheckout` with an empty cart sets `location.hash = '#/cart'` and renders no form. Existing checkout tests now seed one cart item so the guard doesn't redirect them.

### Delivery

Single commit. Files: `cart-item.js`, `checkout.js`, new test file, two existing test files updated, openspec docs.

## Assumptions

- "No debe dejar finalizar la compra" covers both paths: the leftover checkout button and direct `#/checkout` navigation — both are blocked.
- Re-rendering the whole cart screen on empty is preferred over surgically hiding the button — it reuses the existing empty-state markup (`cart-empty` message, no button, no total).

## Risks

| Risk | Mitigation |
|------|------------|
| Circular import `cart.js` ↔ `cart-item.js` breaks module init | Same pattern as `filters.js` ↔ `products.js`; the import is only used inside event handlers at runtime — verified by full suite |
| Existing checkout tests break on the new guard | They now seed one cart item in `beforeEach` — updated |
| Re-render loses focus during demo | Same behavior as filter re-renders; TR-12 (no focus management) is an existing trap — unchanged |

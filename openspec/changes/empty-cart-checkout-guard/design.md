# Design: Empty cart must not reach checkout

## 1. Overview

Two guards: (a) the cart screen re-renders when the last item disappears so the checkout button is removed; (b) `renderCheckout` bounces empty carts back to `#/cart`.

## 2. Root cause

`renderCart` renders the checkout button conditionally (`cart.length > 0`) **only at render time**. `__faroCartQty` and `__faroCartRemove` mutate state and patch the tbody/total DOM directly — they never re-render the screen, so the button survives an emptied cart. `updateCartQuantity` removes the item at quantity ≤ 0, so both handlers share the bug.

## 3. Change — `src/components/cart-item.js`

```js
import { renderCart } from '../screens/cart.js';

// Refreshes the cart UI after a quantity/remove operation. When the cart
// becomes empty the whole screen re-renders so the empty state shows and
// the checkout button disappears — an empty cart must not reach checkout.
function refreshCart() {
  const { cart } = getState();
  if (cart.length === 0) {
    renderCart(document.getElementById('app'));
    return;
  }
  // ...existing tbody + total refresh (TR-14 comment preserved)...
}
```

Both handlers delegate to `refreshCart()` — deduplicates the previous copy-pasted refresh logic. The circular import (`cart.js` ↔ `cart-item.js`) mirrors `filters.js` ↔ `screens/products.js`; usage is deferred to handler invocation time.

## 4. Change — `src/screens/checkout.js`

```js
const { cart, language } = getState();
// An empty cart cannot complete a purchase — send the user back to the cart.
if (cart.length === 0) {
  navigate('#/cart');
  return;
}
```

Runs before any markup is produced — no flash of the checkout form.

## 5. Tests — `src/tests/cart-empty-checkout.test.js`

| # | Case |
|---|------|
| 1 | `__faroCartRemove(0)` on a 1-item cart → empty state rendered, no `#/checkout` link, no `cart-total` |
| 2 | `__faroCartQty(0, 0)` → same empty state |
| 3 | Remove one of two items → checkout button stays |
| 4 | `renderCheckout` with empty cart → `location.hash === '#/cart'`, no `checkout-form` |

Existing tests `checkout-card-validation.test.js` and `checkout-expiry-hint.test.js` seed `addToCart('p001','S','blue')` in `beforeEach` — the guard would otherwise redirect them.

## 6. Files changed

| File | Change |
|------|--------|
| `src/components/cart-item.js` | `refreshCart()` helper; re-render on empty cart |
| `src/screens/checkout.js` | Empty-cart redirect to `#/cart` |
| `src/tests/cart-empty-checkout.test.js` | New — 4 tests |
| `src/tests/checkout-card-validation.test.js`, `src/tests/checkout-expiry-hint.test.js` | Seed cart item in `beforeEach` |
| `openspec/changes/empty-cart-checkout-guard/` | proposal, design, spec, tasks, apply-progress, verify-report |

No changes to: i18n, styles, registry, checklist, other screens.

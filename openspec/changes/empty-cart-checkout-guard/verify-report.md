# Verify report: Empty cart must not reach checkout

## Verdict: PASS

## Automated verification

| Requirement | Evidence |
|-------------|----------|
| REQ-720-01 button removed on empty | Tests: remove last item and decrement-to-zero both render `.cart-empty`, no `#/checkout` link, no `cart-total` |
| REQ-720-02 button stays with items | Test: removing one of two items keeps the `#/checkout` link |
| REQ-720-03 checkout guard | Test: `renderCheckout` with empty cart sets `location.hash = '#/cart'` and renders no `checkout-form` |
| REQ-720-04 traps preserved | No `data-trap`, registry, i18n, or CSS changes; TR-14 comment kept in `refreshCart()` |

## Test results

```
Test Files  12 passed (12)
Tests       63 passed (63)
```

`npm run build`: OK (Vite).

## Manual review notes

- Root cause confirmed: quantity/remove handlers patched tbody+total directly and never re-rendered — the conditional checkout button survived an emptied cart.
- `updateCartQuantity(index, 0)` also removes the item — the decrement path is covered by the same guard.
- `renderCart` re-render rebinds `__faroCartQty`/`__faroCartRemove` — no stale handlers.
- Circular import `cart.js` ↔ `cart-item.js` verified safe (runtime-deferred usage, same precedent as `filters.js` ↔ `products.js`); full suite green.
- Two existing checkout test files needed a seeded cart item — updated; no behavioral regression elsewhere.

## Known limitations / notes

- On empty, the whole screen re-renders (focus resets to page top) — consistent with the app's existing re-render pattern (filters) and with TR-12 (no focus management), which is an intentional trap.

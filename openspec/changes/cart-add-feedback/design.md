# Design: Cart Add Feedback

## 1. Overview

This evolution corrects the TR-11 trap and adds accessible add-to-cart feedback. It touches four concerns:

1. **Live header counter** — header subscribes to store cart changes and patches the counter without a full re-render.
2. **Product detail feedback** — validation message (`role="alert"`) and confirmation message (`role="status"`), both announced.
3. **i18n** — new keys in `es.js` and `en.js`.
4. **Trap registry correction** — remove TR-11, update structural test, update docs.

The design preserves all other traps and the moderator architecture.

## 2. Live header counter

### Problem
`header.js` computes `cartCount` at render time. The header only re-renders on screen navigation (`renderScreen` → `renderHeader`) and on language change (`main.js` subscriber → `handleRouteChange`). Adding to cart calls `notify()` on the store, but nothing re-renders the header, so the counter is stale until the user navigates.

### Solution: targeted header patch on cart change

Add a `subscribe`-based patcher in `main.js` that listens for cart changes and updates **only** the `.cart-count` text node. This avoids a full screen re-render (which would destroy the product detail screen state, the moderator overlays, and focus).

```js
// main.js — new subscriber
import { subscribe, getState } from './store.js';

let lastCartCount = getState().cart.reduce((s, i) => s + i.quantity, 0);
subscribe((state) => {
  const count = state.cart.reduce((s, i) => s + i.quantity, 0);
  if (count !== lastCartCount) {
    lastCartCount = count;
    const badge = document.querySelector('.cart-count');
    if (badge) badge.textContent = String(count);
  }
});
```

### Why a targeted patch, not a full header re-render
- A full `renderHeader` + `bindHeaderEvents` would replace the header DOM, which is safe, but re-rendering the whole screen would destroy the product detail's `selectedSize`/`selectedColor` module-level state and the moderator overlays on that screen.
- Patching only the `.cart-count` text node is the minimal, safe update. The header DOM stays; only the number changes.

### Edge case: header not yet rendered
On first load the subscriber runs after `initRouter()`, so the header exists. If a cart change somehow fires before the header is in the DOM (it cannot in this flow), the `if (badge)` guard skips safely.

## 3. Product detail feedback

### Current behavior (`product-detail.js`)
```js
window.__faroAddToCart = (id) => {
  if (!selectedSize || !selectedColor) return;   // silent no-op (TR-11)
  addToCart(id, selectedSize, selectedColor);
  // no announcement (TR-11)
};
```

### New behavior

#### 3.1 Pre-declared live regions in the initial render
To guarantee `aria-live` announces reliably across NVDA/Firefox/Edge, the live regions must exist in the DOM **before** they are updated. They are added to the `product-detail.js` template, empty at first:

```html
<div class="add-to-cart-row">
  <button class="btn-primary" onclick="window.__faroAddToCart('${product.id}')">${t('detail.addToCart')}</button>
</div>
<!-- Validation: assertive, announced immediately -->
<p id="add-to-cart-validation" class="validation-message" role="alert" aria-live="assertive"></p>
<!-- Confirmation: polite, announced after action -->
<p id="add-to-cart-confirmation" class="confirmation-message" role="status" aria-live="polite"></p>
```

Note: the `data-trap="TR-11"` attribute is **removed** from the button (REQ-CAF-07).

#### 3.2 Rewritten handler
```js
window.__faroAddToCart = (id) => {
  const validationEl = document.getElementById('add-to-cart-validation');
  const confirmationEl = document.getElementById('add-to-cart-confirmation');

  // Build missing-attribute list
  const missing = [];
  if (!selectedSize) missing.push(t('detail.size').toLowerCase());
  if (!selectedColor) missing.push(t('detail.color').toLowerCase());

  if (missing.length > 0) {
    // REQ-CAF-02: validation, assertive, do NOT add
    confirmationEl.textContent = '';
    validationEl.textContent = t('detail.validationMissing', { attrs: missing.join(', ') });
    return;
  }

  // REQ-CAF-03: add + polite confirmation
  addToCart(id, selectedSize, selectedColor);
  validationEl.textContent = '';
  const product = getProductById(id);
  const name = product ? (product.name[getState().language] || product.name.es) : '';
  confirmationEl.textContent = t('detail.addedToCart', { name });
};
```

#### 3.3 Why clear the other region before setting
Setting `validationEl.textContent = ''` then `confirmationEl.textContent = ...` ensures only one message is announced at a time and the live region transition is detected by NVDA. Clearing first is the reliable pattern for re-announcing the same region.

#### 3.4 `t()` with interpolation
The current `t(key)` returns a flat string. To support `{name}` / `{attrs}` placeholders, extend `i18n/index.js` with a minimal interpolation:

```js
export function t(key, vars = {}) {
  const str = table[key] ?? key;
  return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}
```

This is backward-compatible: calls without `vars` behave exactly as before (no `{...}` in existing strings).

## 4. i18n keys (new)

Added to both `es.js` and `en.js`:

| Key | es | en |
|-----|----|----|
| `detail.validationMissing` | `Selecciona {attrs} para añadir el producto al carrito.` | `Please select {attrs} to add the product to the cart.` |
| `detail.addedToCart` | `{name} añadido al carrito.` | `{name} added to the cart.` |

The existing i18n completeness test (`i18n.test.js`) enforces ES/EN key parity, so adding to both tables is mandatory and verified.

## 5. Trap registry correction (REQ-CAF-07)

### 5.1 `src/traps/registry.js`
- Remove the `TR-11` entry (lines 129–139).
- Update the file header comment "metadata for all 19 accessibility traps" → "18 accessibility traps".

### 5.2 `src/screens/product-detail.js`
- Remove `data-trap="TR-11"` from the add-to-cart button.
- Remove the `// TR-11: ...` comment block (lines 64–70) and replace with the new handler described in §3.

### 5.3 `src/tests/trap-registry.test.js`
- `should have exactly 19 traps` → `18 traps`.
- `should have IDs from TR-01 to TR-19` → this test currently asserts the full TR-01..TR-19 set. Two options:
  - **Option A (chosen)**: change the assertion to expect TR-01..TR-10, TR-12..TR-19 (i.e. all except TR-11). This keeps the "no gaps except the removed one" intent explicit.
  - Option B: drop the range test entirely. Rejected — it catches accidental duplicate/missing IDs.

```js
it('should have exactly 18 traps', () => {
  expect(traps).toHaveLength(18);
});

it('should have IDs TR-01..TR-10 and TR-12..TR-19', () => {
  const expected = [
    'TR-01','TR-02','TR-03','TR-04','TR-05','TR-06','TR-07','TR-08','TR-09','TR-10',
    'TR-12','TR-13','TR-14','TR-15','TR-16','TR-17','TR-18','TR-19',
  ];
  expect(traps.map(t => t.id).sort()).toEqual(expected.sort());
});
```

### 5.4 `docs/verification-checklist.md`
- Remove the "TR-11 — Add to cart no feedback" section (lines 81–84).
- Add a short note in the "Product detail" section explaining that TR-11 has been corrected and the add-to-cart now announces (so the moderator can point to it as the *correct* reference implementation).

### 5.5 `src/traps/README.md`
- Update the trap count reference if it mentions "19 traps".

### 5.6 Other docs
- `apply-progress.md` and `verify-report.md` of the *faro-ecommerce* change are historical records of the original build and are **not** modified (they document the state at that change's completion). The new `apply-progress.md` for *this* change documents the correction.

## 6. New structural test: `cart-add-feedback.test.js`

A new test file `src/tests/cart-add-feedback.test.js` verifies the new behavior using jsdom (already configured in `vite.config.js`):

```js
describe('Cart add feedback', () => {
  it('shows validation message and does not add when size or color missing', () => {
    // render product-detail, call __faroAddToCart without selection
    // assert #add-to-cart-validation has role="alert" and non-empty text
    // assert store.cart length unchanged
  });

  it('shows confirmation message and adds when size and color selected', () => {
    // set selectedSize + selectedColor via variant-selected event
    // call __faroAddToCart
    // assert #add-to-cart-confirmation has role="status" and contains product name
    // assert store.cart length === 1
  });

  it('updates the header cart counter live on add', () => {
    // render header, render product-detail
    // add to cart
    // assert .cart-count textContent === '1' without re-rendering the screen
  });

  it('clears the validation message on successful add', () => {
    // trigger validation, then successful add
    // assert #add-to-cart-validation is empty
  });
});
```

These tests use the existing `renderProductDetail` / `renderHeader` and dispatch `variant-selected` events to set selection, mirroring how the UI works.

## 7. Styling

Add minimal styles to `src/styles/main.css` for the two message regions, so they are visible but unobtrusive:

```css
.validation-message {
  color: #b91c1c;
  font-size: 0.95rem;
  margin-top: 0.5rem;
  min-height: 1.2em;
}
.confirmation-message {
  color: #166534;
  font-size: 0.95rem;
  margin-top: 0.5rem;
  min-height: 1.2em;
}
```

`min-height` prevents layout shift when the regions are empty.

## 8. Moderator mode interaction

- Removing `data-trap="TR-11"` means the moderator overlay no longer annotates the add-to-cart button. `applyModeratorOverlays` queries `[data-trap]`, so TR-11 simply stops appearing — no code change in `moderator.js`.
- The new live regions are **not** traps and carry no `data-trap` attribute, so they are never annotated.
- The header counter patch (§2) does not re-render the screen, so moderator overlays on the product detail screen are unaffected by an add-to-cart action.

## 9. Files changed

| File | Change |
|------|--------|
| `src/main.js` | Add cart-count patcher subscriber |
| `src/components/header.js` | No change (cartCount already computed correctly) |
| `src/screens/product-detail.js` | Remove TR-11 marker + comment; add two live regions; rewrite `__faroAddToCart` with validation + confirmation |
| `src/i18n/index.js` | Extend `t()` with `{var}` interpolation |
| `src/i18n/es.js` | Add `detail.validationMissing`, `detail.addedToCart` |
| `src/i18n/en.js` | Add same keys |
| `src/traps/registry.js` | Remove TR-11 entry; update header comment |
| `src/traps/README.md` | Update trap count if referenced |
| `src/styles/main.css` | Add `.validation-message` / `.confirmation-message` styles |
| `src/tests/trap-registry.test.js` | 19 → 18; update ID set assertion |
| `src/tests/cart-add-feedback.test.js` | New test file |
| `docs/verification-checklist.md` | Remove TR-11 section; add corrected-behavior note |

## 10. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| `aria-live` region created dynamically does not announce | Regions are pre-declared empty in the initial template (§3.1), only text content is updated |
| Header patcher races with screen render | Patcher only runs on store `notify()`; render sets the correct count first; patcher's `if (count !== lastCartCount)` guard prevents redundant writes |
| Removing TR-11 breaks the "19 traps" narrative in docs | Verification checklist updated; new apply-progress documents the correction; moderator briefs attendees that this is now the reference fix |
| `t()` interpolation breaks existing keys | No existing key contains `{...}`; regex only replaces `{word}` tokens; missing vars resolve to empty string |
| Test for "TR-01..TR-19" range becomes brittle | New explicit ID list assertion (§5.3) is clear and intentional |

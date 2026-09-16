# Design: Checkout Expiry Date — Format in Placeholder

## 1. Overview

The expected expiry format is added to the field's localized placeholder by editing two i18n values. No markup, CSS, or ARIA changes — the smallest possible diff that satisfies "inform the user of the input format".

## 2. i18n values (`src/i18n/es.js`, `src/i18n/en.js`)

The existing `checkout.cardExpiry` values change:

| Key | es (before → after) | en (before → after) |
|-----|---------------------|---------------------|
| `checkout.cardExpiry` | `Fecha de caducidad` → `Fecha de caducidad (MM/AA)` | `Expiry date` → `Expiry date (MM/YY)` |

- Parenthesized notation appended to the field name — common form convention.
- Locale-aware year notation: **AA** (año) in Spanish, **YY** in English.
- The i18n parity test continues to enforce identical key sets; values change, keys don't.

## 3. Markup — unchanged

`src/screens/checkout.js` is **not modified**. The input remains:

```html
<input data-trap="TR-16" type="text" id="ck-expiry" placeholder="${t('checkout.cardExpiry')}" />
```

Since `renderCheckout` already resolves the placeholder through `t()`, updating the string tables is sufficient — the new text flows through on the next render and on language switch (full screen re-render per existing behavior).

## 4. Trap preservation analysis

| Trap | Why it survives |
|------|-----------------|
| TR-15 (color-only errors) | Error styling untouched |
| TR-16 (no `<label>`) | Nothing added — the placeholder remains the only naming fallback. Ironically, that is *why* the format reaches screen readers: it is announced as part of the accessible name |
| TR-17 (error not associated) | No `aria-describedby` anywhere; `err-expiry` remains unassociated |
| TR-18 (no focus to error) | `handleSubmit` untouched |

`registry.js` untouched (18 traps); all `data-trap` attributes unchanged.

## 5. New structural test: `checkout-expiry-hint.test.js`

New file `src/tests/checkout-expiry-hint.test.js` (jsdom):

```js
describe('Checkout expiry format in placeholder', () => {
  it('shows the format notation in the Spanish placeholder', () => {
    // renderCheckout → #ck-expiry placeholder === 'Fecha de caducidad (MM/AA)'
  });

  it('shows MM/YY notation in English', () => {
    // setLanguage('en') + render → placeholder === 'Expiry date (MM/YY)'
  });

  it('keeps the field without a label (TR-16 preserved)', () => {
    // no <label for="ck-expiry">, no aria-label; data-trap="TR-16" intact
  });

  it('still validates MM/YY format', () => {
    // submit with '12/28' passes; '12-28' / '12/2028' fail with error shown
  });
});
```

`renderCheckout` reads `state.cart` — tests run with an empty cart (total €0.00). Submit via `form.dispatchEvent(new Event('submit', { cancelable: true }))`; `handleSubmit` is bound on render.

## 6. Documentation

`docs/verification-checklist.md` — short note in the "Checkout" section: the expiry placeholder now includes the format (MM/AA / MM/YY); not a trap fix — the field still has no label and TR-15…TR-18 still apply.

## 7. Files changed

| File | Change |
|------|--------|
| `src/i18n/es.js` | `checkout.cardExpiry` → "Fecha de caducidad (MM/AA)" |
| `src/i18n/en.js` | `checkout.cardExpiry` → "Expiry date (MM/YY)" |
| `src/tests/checkout-expiry-hint.test.js` | New — 4 tests |
| `docs/verification-checklist.md` | Informational note in Checkout section |

`checkout.js`, `main.css`, `registry.js` — unchanged.

## 8. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Format disappears while typing | Accepted — chosen approach; noted in proposal as a trade-off |
| Longer placeholder clipped visually | Text stays short; input is full-width in a flexible field |
| Placeholder reliance contradicts the demo's own lesson (TR-05/TR-16) | Documented for the moderator in the checklist note — it doubles as a talking point: the format only reaches SR users *because* the placeholder is misused as the name |
| Format text drifts from validation regex | Same format documented in spec REQ-CEH-03; test asserts `\d{2}/\d{2}` still enforced |

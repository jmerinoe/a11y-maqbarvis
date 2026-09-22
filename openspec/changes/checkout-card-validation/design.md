# Design: Checkout — suppress autofill warning and validate a fixed test card

## 1. Overview

Two small changes in `src/screens/checkout.js`: `autocomplete="off"` on the three payment inputs, and an exact-match card validator against the fixed test card `4000056655665556`.

## 2. Autofill warning

### Cause

Firefox's form-autofill heuristic (Fathom + `HeuristicsRegExp`) detects credit-card fields from `id`/`name`/`autocomplete`, **placeholder text**, associated labels, and neighbouring fields' attributes. `ck-card` + "Número de tarjeta" + `ck-expiry` + `ck-cvv` + "Fecha de caducidad"/"CVV" match every signal. On a non-HTTPS page the browser shows its native "autocompletado inhabilitado porque este formulario no utiliza conexión segura" notice on focus — browser chrome, not app markup.

Critically, **Firefox ignores `autocomplete="off"` on credit-card fields** (Mozilla bug 1392528, resolved WONTFIX; bug 1754879 made the same change for autofill generally). The attribute alone cannot suppress the warning.

### Fix

Remove every detection signal:

```html
<input data-trap="TR-16" type="text" id="ck-num" autocomplete="off" placeholder="Número de tar​jeta" />
<!-- id/placeholder keywords neutralized; ^ zero-width space inside "tarjeta" -->
```

- **Neutral ids**: `ck-card`→`ck-num`, `ck-expiry`→`ck-fecha`, `ck-cvv`→`ck-dig` (no card vocabulary; neighbours' signals removed too).
- **`hideFromAutofill(text)`**: inserts `\u200B` (zero-width space) between adjacent non-space characters — the placeholder renders identically but the raw attribute matches no keyword regex in any language.
- `autocomplete="off"` kept — ignored by Firefox for cc fields, but suppresses generic autofill on other browsers.
- TR-16 preserved: still placeholder-only, no `<label>`, no accessible name.

## 3. Card validation

```js
// Only this card number is accepted (demo shop: fixed test card).
const VALID_CARD_NUMBER = '4000056655665556';

// in handleSubmit's fields array:
{ id: 'ck-card', errorId: 'err-card',
  validate: (v) => (v.replace(/\s/g, '') === VALID_CARD_NUMBER ? true : t('checkout.error.card')) }
```

- Replaces the previous generic `/^\d{13,16}$/` check.
- Whitespace stripped before comparison → `"4000 0566 5566 5556"` is accepted.
- Error text reuses `checkout.error.card` ("Número de tarjeta no válido" / "Invalid card number").
- Failure flows through the existing pipeline: `input-error` class + `err-card` message + submit blocked — TR-15/17/18 behavior preserved.

## 4. Tests — `src/tests/checkout-card-validation.test.js`

| # | Case |
|---|------|
| 1 | `ck-card`, `ck-expiry`, `ck-cvv` carry `autocomplete="off"` |
| 2 | `4111111111111111` and `4000056655665557` rejected → `err-card` visible with "Número de tarjeta no válido" + `input-error` class |
| 3 | `4000056655665556` accepted — card error clears (other fields empty, so no navigation) |
| 4 | `4000 0566 5566 5556` (spaced) accepted |

## 5. Files changed

| File | Change |
|------|--------|
| `src/screens/checkout.js` | `autocomplete="off"` on payment inputs; `VALID_CARD_NUMBER` + exact-match validator |
| `src/tests/checkout-card-validation.test.js` | New — 4 tests |
| `openspec/changes/checkout-card-validation/` | proposal, design, spec, tasks, apply-progress, verify-report |

No changes to: i18n, styles, registry, checklist, other screens — functional evolution, no trap involved.

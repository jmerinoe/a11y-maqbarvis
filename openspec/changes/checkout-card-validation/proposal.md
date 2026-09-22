# Proposal: Checkout — suppress autofill warning and validate a fixed test card

## Why

Two payment-window issues reported by the owner:

1. **Browser autofill warning**: focusing the card-number field shows the browser's native warning "la opción de autocompletado de los métodos de pago está inhabilitada porque este formulario no utiliza conexión segura". The browser detects the payment fields (id/placeholder heuristics) and, because the demo runs over plain HTTP, warns that card autofill is disabled. It is noise for the demo.
2. **Card validation**: the card field currently accepts any 13–16 digit number. The owner wants the purchase to complete **only** with the fixed test card `4000056655665556`; any other number must be rejected as invalid.

This is a functional evolution, not a trap correction: TR-15/TR-16/TR-17/TR-18 remain untouched.

## What Changes

### Scope

1. **Neutralize credit-card detection signals on payment fields** (`checkout.js`) — Firefox deliberately ignores `autocomplete="off"` on card fields (Mozilla bug 1392528), so the fields are renamed to neutral ids (`ck-num`, `ck-fecha`, `ck-dig`) and their placeholders are rendered with a zero-width space inside every word (visually identical, but the heuristic regexes can't match "tarjeta", "caducidad", "CVV"). `autocomplete="off"` is kept as a bonus for other browsers' generic autofill.
2. **Fixed-card validation** (`checkout.js`) — the card validator requires an exact match with `4000056655665556` (spaces ignored). Any other value shows the existing `checkout.error.card` message ("Número de tarjeta no válido") and blocks submission.

### Out of scope

- The other checkout fields and their validators (name, email, address, expiry MM/AA, CVV).
- All checkout traps: TR-15 (color-only errors), TR-16 (no labels), TR-17 (unassociated error), TR-18 (no focus to error) — the new validation flows through the same error pipeline, preserving the traps.
- i18n: the existing `checkout.error.card` key is reused; no new keys.
- Serving the demo over HTTPS (would also silence the warning but is out of scope for the workshop environment).

## How

### Architecture approach

- Payment fields renamed to neutral ids (`ck-num`, `ck-fecha`, `ck-dig`) and their placeholders run through `hideFromAutofill()` — `\u200B` inside every word keeps the visible text while no keyword regex can match. `autocomplete="off"` kept for non-Firefox autofill.
- New module constant `VALID_CARD_NUMBER = '4000056655665556'`; the `ck-card` validator becomes `v.replace(/\s/g, '') === VALID_CARD_NUMBER` (spaces tolerated, matching how card numbers are commonly typed).

### Testing strategy

New test `src/tests/checkout-card-validation.test.js`: payment fields carry `autocomplete="off"`, neutral ids, and zero-width-obfuscated placeholders (no cc keyword survives in the raw attributes); a well-formed but different 16-digit number is rejected with the invalid-card error and `input-error` styling; the exact test card passes validation (spaces tolerated).

### Delivery

Single commit. Files: `src/screens/checkout.js`, new test file, openspec docs. Very small diff.

## Assumptions

- The warning is the browser's native insecure-form autofill notice, not app-rendered markup (confirmed: no such string exists in the codebase).
- `autocomplete="off"` alone does NOT suppress it — Firefox ignores the attribute for credit-card fields. Neutralizing the detection signals (id, placeholder keywords) is the reliable app-side fix; personal fields (name/email/address) do not trigger a payment-method warning and keep default behavior.
- "No se debe poder finalizar la compra" = the existing submit-block + error message flow; traps TR-15/17/18 still govern how the error is (in)accessibly presented.

## Risks

| Risk | Mitigation |
|------|------------|
| `autocomplete="off"` ignored by Firefox for credit-card fields (confirmed, bug 1392528 WONTFIX) | Neutral ids + zero-width-space placeholders remove all detection signals; fallback if heuristics evolve: HTTPS or `extensions.formautofill.creditCards.enabled=false` in the demo profile |
| Zero-width spaces in placeholders cause odd rendering | U+200B is zero-width/invisible; placeholders are single-line — visually identical |
| Spaces/formatting make valid input fail | Value is stripped of whitespace before comparison; test covers spaced input |
| New validation interferes with trap behavior | Errors reuse the same `err-card` span + `input-error` pipeline; TR-15/17/18 preserved |

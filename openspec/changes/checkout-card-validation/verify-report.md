# Verify report: Checkout — suppress autofill warning and validate a fixed test card

## Verdict: PASS

## Automated verification

| Requirement | Evidence |
|-------------|----------|
| REQ-710-01 autofill warning suppressed | Test: `ck-num`, `ck-fecha`, `ck-dig` carry `autocomplete="off"`, neutral ids, and zero-width-obfuscated placeholders — no cc keyword survives in the raw attributes |
| REQ-710-02 fixed test card only | Tests: `4111111111111111`/`4000056655665557` rejected with invalid-card error; `4000056655665556` (plain and spaced) accepted |
| REQ-710-03 error pipeline + traps preserved | `data-trap` markers unchanged; validation errors reuse `field-error` + `input-error` + submit-block flow |
| REQ-710-04 no new i18n keys | `checkout.error.card` reused; `i18n.test.js` parity check passes |

## Test results

```
Test Files  11 passed (11)
Tests       59 passed (59)
```

`npm run build`: OK (Vite).

## Manual review notes

- The autofill warning is browser chrome triggered by payment-field heuristics on a non-HTTPS page — no app-rendered string existed to delete. `autocomplete="off"` alone does NOT work: Firefox ignores it on credit-card fields (bug 1392528, WONTFIX). The fix removes the detection signals: neutral field ids and placeholders obfuscated with `\u200B` inside every word (visible text unchanged; `handleSubmit` and tests updated for the new ids).
- Personal fields (name/email/address) intentionally keep default autocomplete — they do not trigger the payment warning.
- The card check is an exact match (demo constraint), not Luhn — documented in tasks notes.
- Spaced input (`4000 0566 5566 5556`) accepted via whitespace stripping.

## Known limitations / notes

- Browser heuristics evolve — if a future version still flags the fields, the fallbacks are serving the demo over HTTPS or disabling `extensions.formautofill.creditCards` in the demo Firefox profile.
- `document.documentElement.lang`-independent — validation works identically in ES and EN.

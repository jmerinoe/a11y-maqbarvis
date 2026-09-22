# Apply progress: Checkout — suppress autofill warning and validate a fixed test card

## Status: Complete

## What was applied

- `src/screens/checkout.js`:
  - Payment fields neutralized for the credit-card autofill heuristic: ids renamed `ck-card`/`ck-expiry`/`ck-cvv` → `ck-num`/`ck-fecha`/`ck-dig`; placeholders pass through `hideFromAutofill()` (a `\u200B` inside every word — identical visible text, no keyword match); `autocomplete="off"` kept. Firefox ignores `autocomplete="off"` on cc fields (bug 1392528), so signal removal is the actual fix.
  - New constant `VALID_CARD_NUMBER = '4000056655665556'`; the `ck-card` validator now requires an exact match on the whitespace-stripped value, replacing the generic `/^\d{13,16}$/` check. Errors reuse `checkout.error.card` and the existing `field-error`/`input-error` pipeline.
- `src/tests/checkout-card-validation.test.js`: new file, 4 tests — autofill signals neutralized (neutral ids + obfuscated placeholders + `autocomplete="off"`), rejection of other 16-digit numbers, acceptance of the test card (plain and spaced).
- `src/tests/checkout-expiry-hint.test.js`: updated for the renamed `ck-fecha` id and the zero-width-space placeholders (assertions strip `\u200B` before comparing visible text).

## Tasks status

All tasks in `tasks.md` completed: T1.1–T1.2 (implementation), T2.1–T2.2 (tests, 59/59 green), T3.1–T3.2 (this file + verify-report), T4.1–T4.3 (build + tests + manual check).

## Verification results

| Check | Result |
|-------|--------|
| `npm test` | 59 tests, 11 files — all pass |
| `npm run build` | OK |
| Autofill warning suppressed | Neutral ids + zero-width placeholders + `autocomplete="off"` on `ck-num`, `ck-fecha`, `ck-dig` — no cc keyword survives in field attributes |
| Wrong card rejected | `4111111111111111` and `4000056655665557` → "Número de tarjeta no válido" + `input-error`, submit blocked |
| Test card accepted | `4000056655665556` and `4000 0566 5566 5556` pass card validation |
| Traps preserved | TR-15/16/17/18 markers and error pipeline untouched |

## Files changed

| File | Change |
|------|--------|
| `src/screens/checkout.js` | Neutral ids + `hideFromAutofill()` placeholders + `autocomplete="off"` on payment inputs; `VALID_CARD_NUMBER` + exact-match validator |
| `src/tests/checkout-card-validation.test.js` | New — 4 tests |
| `src/tests/checkout-expiry-hint.test.js` | Updated for `ck-fecha` id + ZWSP placeholders |
| `openspec/changes/checkout-card-validation/` | proposal, design, spec, tasks, apply-progress, verify-report |

No changes to: i18n, styles, registry, checklist, other screens.

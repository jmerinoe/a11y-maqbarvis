# Tasks: Checkout — suppress autofill warning and validate a fixed test card

Implementation checklist. Tasks are ordered by dependency. Check off items as they are completed during the apply phase.

## Milestone 1: Implementation (`src/screens/checkout.js`)

- [x] T1.1 Neutralize autofill detection on `ck-card`/`ck-expiry`/`ck-cvv` → renamed to `ck-num`/`ck-fecha`/`ck-dig`, placeholders run through `hideFromAutofill()` (zero-width space inside every word), `autocomplete="off"` kept.
- [x] T1.2 Add `VALID_CARD_NUMBER = '4000056655665556'` constant and change the `ck-card` validator to an exact match on the whitespace-stripped value, reusing `checkout.error.card`.

## Milestone 2: Structural test (`src/tests/checkout-card-validation.test.js`)

- [x] T2.1 Create the test file with the 4 cases from design §4.
- [x] T2.2 Run `npm test` — all tests pass (59/59).

## Milestone 3: Documentation

- [x] T3.1 Write `openspec/changes/checkout-card-validation/apply-progress.md`.
- [x] T3.2 Write `openspec/changes/checkout-card-validation/verify-report.md`.

## Milestone 4: Final verification

- [x] T4.1 Run `npm run build` — succeeds with no errors.
- [x] T4.2 Run `npm test` — all tests pass.
- [x] T4.3 Manual in dev: focusing the card field shows no browser autofill warning; submitting a different card shows "Número de tarjeta no válido" and blocks the purchase; `4000056655665556` proceeds to confirmation.

## Notes

- The autofill warning is browser chrome, not app markup — and Firefox ignores `autocomplete="off"` on card fields (bug 1392528), so detection signals are neutralized instead (ids + zero-width placeholders).
- The fixed card is a demo constraint (like a test card in sandbox gateways), not a real Luhn/format check.
- TR-15/16/17/18 untouched: the new validation reuses the existing error pipeline.

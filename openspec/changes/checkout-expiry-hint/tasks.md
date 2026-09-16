# Tasks: Checkout Expiry Date — Format in Placeholder

Implementation checklist. Check off items as they are completed during the apply phase.

## Milestone 1: i18n values

- [x] T1.1 In `src/i18n/es.js`, change `checkout.cardExpiry` → `Fecha de caducidad (MM/AA)`.
- [x] T1.2 In `src/i18n/en.js`, change `checkout.cardExpiry` → `Expiry date (MM/YY)`.
- [x] T1.3 Run `npm test` — i18n completeness test must still pass.
- [x] T1.4 Verify manually in dev: checkout shows "Fecha de caducidad (MM/AA)" in es, "Expiry date (MM/YY)" after toggling to en.

## Milestone 2: New structural test

- [x] T2.1 Create `src/tests/checkout-expiry-hint.test.js` with the 4 cases from design §5 (es placeholder, en placeholder, no label/TR-16 preserved, MM/YY validation unchanged).
- [x] T2.2 Run `npm test` — all tests pass; trap-registry still reports 18 traps.

## Milestone 3: Documentation

- [x] T3.1 Add an informational note in the "Checkout" section of `docs/verification-checklist.md`: expiry placeholder now includes the format; TR-15…TR-18 still apply (field still has no label — the placeholder is the naming fallback, which is why the format is announced).
- [x] T3.2 Write `openspec/changes/checkout-expiry-hint/apply-progress.md`.
- [x] T3.3 Write `openspec/changes/checkout-expiry-hint/verify-report.md`.

## Milestone 4: Final verification

- [x] T4.1 Run `npm run build` — must succeed with no errors.
- [x] T4.2 Run `npm test` — all tests pass.
- [x] T4.3 Verify `checkout.js` and `main.css` are untouched and `data-trap` attributes unchanged (grep).
- [x] T4.4 Manual pass in dev, both languages: placeholder shows format; invalid submit still shows color-only, unassociated error with no focus move (TR-15/TR-17/TR-18).

## Notes

- Only two string values change in production code — no markup, CSS, or ARIA edits.
- Do not add `<label>`, `aria-label`, `aria-describedby`, or a hint element — all would alter trap behavior.

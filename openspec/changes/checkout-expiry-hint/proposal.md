# Proposal: Checkout Expiry Date — Format in Placeholder

## Why

On the checkout screen, the expiry date field (`ck-expiry`) only shows the placeholder "Fecha de caducidad" / "Expiry date" — nothing tells the attendee that the expected input format is **MM/AA** (two digits, slash, two digits, enforced by validation `/^\d{2}\/\d{2}$/`). Attendees who type `MM/AAAA`, `MM-AA`, or a month name get a generic validation error with no hint about why.

This evolution adds the expected format **to the placeholder text itself**: "Fecha de caducidad (MM/AA)" (es) / "Expiry date (MM/YY)" (en).

This is a **functional evolution, not a trap correction**: the checkout traps (TR-15 color-only errors, TR-16 no labels, TR-17 unassociated errors, TR-18 no focus to error) are deliberately preserved. Since TR-16 keeps the placeholder as the field's only naming fallback, the format inside it is also what screen readers announce — the information reaches assistive technology without repairing the trap.

## What Changes

### Scope — Checkout expiry field only

1. **Localized placeholder with format** — the existing `checkout.cardExpiry` i18n value gains the format notation: `Fecha de caducidad (MM/AA)` (es) / `Expiry date (MM/YY)` (en). Locale-aware notation: **AA** (año) in Spanish, **YY** in English.
2. **No markup, CSS, or ARIA changes** — the input keeps `data-trap="TR-16"`, no `<label>`, no `aria-describedby`. Only the string-table values change.

### Out of scope

- Format hints for other checkout fields (card number, CVV, email) — scope is the expiry field per request.
- Validation logic: the `MM/AA` pattern (`\d{2}/\d{2}`) is unchanged; the placeholder documents existing behavior.
- Persistent hint elements, input masking, or auto-formatting.
- Any trap correction: TR-15, TR-16, TR-17, TR-18 remain fully intact.

## How

### Architecture approach

1. `es.js` — `checkout.cardExpiry` → `Fecha de caducidad (MM/AA)`.
2. `en.js` — `checkout.cardExpiry` → `Expiry date (MM/YY)`.
3. New structural test `checkout-expiry-hint.test.js` covering placeholder text in both languages, trap preservation, and unchanged validation.
4. `docs/verification-checklist.md` — short moderator note in the Checkout section.

### Alternatives considered

- **Persistent hint element** (`<span class="field-hint">` + `aria-describedby`): the stronger pattern (visible while typing, announced as description), but rejected in favor of the minimal change — the placeholder already serves as the field's accessible name under TR-16, so the format is still announced, and the simpler diff keeps the demo surface smaller.
- **`aria-label` / `<label>` with format**: rejected — it would repair TR-16 for this field, which must stay a trap.

### Testing strategy

- New test file: `ck-expiry` placeholder contains the localized format notation in es and en, the field still has no `<label>`/`aria-label` (TR-16), `data-trap` attributes unchanged, and expiry validation still requires `\d{2}/\d{2}`.
- Existing `i18n.test.js` enforces ES/EN parity (same keys, no empty values).

### Delivery

Single PR. Files: `es.js`, `en.js`, new test, checklist note. Minimal diff — two string values plus tests and docs.

## Assumptions

- The intended format is exactly what validation enforces: `MM/AA` (digits only, slash separator).
- The notation is written in parentheses after the field name: `Fecha de caducidad (MM/AA)`.
- Placeholder-as-format-hint is accepted despite disappearing while typing — trade-off chosen for minimal diff; since TR-16 keeps placeholder as the naming fallback, screen readers still announce it on focus.

## Risks

| Risk | Mitigation |
|------|------------|
| Format info disappears while typing | Accepted trade-off of the minimal approach; can be revisited later with a persistent hint if needed |
| Placeholder text gets long | "Fecha de caducidad (MM/AA)" is still short enough for the field width; no layout impact expected |
| Locale confusion AA vs YY | Separate values per language; es uses "MM/AA", en uses "MM/YY" |
| Value seen as weakening TR-16 | The trap is "no `<label>`" — placeholder remains the naming fallback and the field still lacks a proper accessible name; the trap's lesson is unchanged |

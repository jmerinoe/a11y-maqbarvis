# Spec: Checkout — suppress autofill warning and validate a fixed test card

## Purpose

Defines the checkout payment-field behavior after this evolution: no browser autofill warning on the card fields, and a fixed test card `4000056655665556` as the only accepted card number.

## Requirements

### REQ-710-01: No autofill warning on payment fields
The card number, expiry, and CVV inputs SHALL NOT be detectable as credit-card fields by the browser's autofill heuristic: neutral `id`s (`ck-num`, `ck-fecha`, `ck-dig`), no card keywords in the raw `placeholder` attributes (zero-width spaces inside words keep the visible text identical), and `autocomplete="off"`. The insecure-form autofill warning SHALL NOT appear on focus.

### REQ-710-02: Only the fixed test card is accepted
The card-number validator SHALL strip whitespace and require an exact match with `4000056655665556`. Any other value SHALL fail validation, display the `checkout.error.card` message, and block submission (purchase cannot be completed).

### REQ-710-03: Existing error pipeline and traps preserved
Card validation errors SHALL flow through the same `field-error` span + `input-error` class mechanism as other fields. TR-15, TR-16, TR-17, and TR-18 SHALL remain unchanged.

### REQ-710-04: No new i18n keys
The existing `checkout.error.card` key SHALL be reused for the invalid-card message in both languages.

## Scenarios

### Scenario: Focus on the card field shows no warning
- **Given** the attendee is on `#/checkout`
- **When** they focus the card number field
- **Then** the browser does not display the "autocompletado inhabilitado / conexión no segura" notice

### Scenario: Wrong card blocks the purchase
- **Given** the attendee filled all fields but entered card `4111111111111111`
- **When** they submit the form
- **Then** the card field shows "Número de tarjeta no válido" and the order is not confirmed

### Scenario: Test card accepted
- **Given** the attendee entered card `4000056655665556` (with or without spaces) and the other fields are valid
- **When** they submit the form
- **Then** the card validation passes and the order proceeds to confirmation

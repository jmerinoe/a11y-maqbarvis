# Spec: Checkout Expiry Date — Format in Placeholder

## Purpose

Defines the format indication on the checkout expiry date field: the expected input format (MM/AA) SHALL be communicated in the field's localized placeholder text — while preserving the checkout accessibility traps.

## Requirements

### REQ-CEH-01: Format communicated in placeholder
The expiry date field's placeholder SHALL include the expected input format notation, in parentheses after the field name. Because the field has no `<label>` (TR-16), the placeholder remains the accessible-name fallback, so the format is conveyed to assistive technology on focus.

### REQ-CEH-02: Localized placeholder
The placeholder text SHALL be sourced from the i18n string tables via the existing `checkout.cardExpiry` key and SHALL use locale-appropriate notation: "Fecha de caducidad (MM/AA)" when the page language is Spanish and "Expiry date (MM/YY)" when it is English. Switching language SHALL update the placeholder on the next render.

### REQ-CEH-03: Validation unchanged
Expiry validation SHALL continue to require exactly `\d{2}/\d{2}` (MM/AA). The placeholder documents existing behavior; no validation logic changes.

### REQ-CEH-04: Checkout traps preserved
- **TR-16** — the expiry field SHALL still have no `<label>` and no `aria-label`; the placeholder remains its only naming fallback.
- **TR-15**, **TR-17**, **TR-18** SHALL be untouched: errors still shown by border color, error messages still unassociated, focus still not moved to the first invalid field.
- All `data-trap` attributes and the checkout markup structure SHALL be unchanged — no new elements, no new ARIA attributes.

### REQ-CEH-05: Scope limited to expiry field
No other checkout field placeholder (name, email, address, card number, CVV) SHALL change in this evolution.

## Scenarios

### Scenario: Format visible in placeholder (Spanish)
- **Given** the attendee reaches checkout with the page in Spanish
- **When** they look at the expiry date field
- **Then** the placeholder reads "Fecha de caducidad (MM/AA)"

### Scenario: Format in placeholder (English)
- **Given** the attendee switches the page to English and reaches checkout
- **When** the form renders
- **Then** the expiry placeholder reads "Expiry date (MM/YY)"

### Scenario: Screen reader announcement
- **Given** a screen reader user on the checkout form
- **When** focus lands on the expiry field
- **Then** the announced field name includes the format notation (placeholder is the naming fallback under TR-16)

### Scenario: Validation unchanged
- **Given** the attendee types "12-28" or "12/2028" in the expiry field
- **When** they submit the form
- **Then** validation still fails — only `MM/AA` (`12/28`) is accepted

### Scenario: Traps unchanged
- **Given** the evolution is applied
- **When** the checkout form is inspected or moderator mode is activated
- **Then** `data-trap="TR-16"` remains on the input, no `<label>` exists for it, and TR-15/TR-17/TR-18 behavior is identical

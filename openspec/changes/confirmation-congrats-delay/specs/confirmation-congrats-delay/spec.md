# Spec: BLIND BUY — delay the congrats dialog ~5 seconds

## Purpose

The congrats dialog SHALL appear approximately 5 seconds after the confirmation screen renders, so the participant sees the order confirmation before the celebratory overlay covers it.

## Requirements

### REQ-1000-01: Delayed congrats
When `faro-pending-congrats` is set and `renderConfirmation` runs, the confirmation screen SHALL render normally and the congrats dialog SHALL open after a delay of approximately 5000 ms, not synchronously.

### REQ-1000-02: Navigation guard
The delayed callback SHALL NOT open the congrats dialog if the participant has already navigated away from the confirmation screen (the `.confirmation` container is no longer in the DOM) or if another `role="dialog"` is already open.

### REQ-1000-03: No stacking
If `renderConfirmation` is called again before the previous delay elapses, the previous pending timer SHALL be cleared before scheduling a new one.

### REQ-1000-04: Mission-failed unchanged
The mission-failed dialog (`faro-pending-failed`) SHALL continue to open synchronously — no delay.

## Scenarios

### Scenario: Successful purchase
- **Given** a completed checkout with `faro-pending-congrats` set
- **When** `renderConfirmation` runs
- **Then** the confirmation screen is visible immediately and the congrats dialog appears ~5 s later

### Scenario: Participant navigates away before the delay
- **Given** `renderConfirmation` ran and the 5 s timer is pending
- **When** the participant clicks "Volver al inicio" before 5 s
- **Then** the timer fires but the congrats dialog does NOT open

### Scenario: Another dialog opens during the delay
- **Given** the 5 s timer is pending
- **When** another `role="dialog"` opens before the timer fires
- **Then** the congrats dialog does NOT stack on top

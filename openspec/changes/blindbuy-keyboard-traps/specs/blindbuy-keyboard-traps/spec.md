# Spec: BLIND BUY — fix the five keyboard traps

## Purpose

Five keyboard/focus barriers SHALL be corrected so BLIND BUY is completable with keyboard alone, following the repo convention of removing corrected traps from the registry (TR-03/06/07/11 precedent). All other traps SHALL remain.

## Requirements

### REQ-980-01: Skip link (was TR-01)
The screen-reader site header SHALL contain a skip link as its first focusable element. Activating it SHALL move focus to `<main id="main-content">` (made focusable via `tabindex="-1"`) WITHOUT changing `location.hash` — the app's router is hash-based, so the navigation must be prevented. The link SHALL be visually hidden until it receives focus.

### REQ-980-02: Search button is a real button (was TR-04)
The search control SHALL be a `<button type="button">` with an accessible name (`aria-label`/`aria-labelledby`), preserving the current visual styling and `__faroSearch` behaviour — keyboard Enter/Space SHALL trigger the search.

### REQ-980-03: Natural tab order in product cards (was TR-08)
Product cards SHALL NOT carry positive `tabindex` values. Focus order SHALL follow DOM order.

### REQ-980-04: Cart modal focus management (was TR-12)
The cart SHALL be a proper modal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing at its title. On open, focus SHALL move into the dialog; Tab/Shift+Tab SHALL cycle inside it; Escape SHALL navigate to `#/products` (continue shopping); on any close, focus SHALL return to the element that had it before.

### REQ-980-05: Focus first invalid field on submit (was TR-18)
When checkout validation fails, focus SHALL move to the first invalid input. (Error association/colour-only signalling — TR-17/TR-15 — remain as barriers.)

### REQ-980-06: Registry and annotations
The five `data-trap` attributes and their `registry.js` entries SHALL be removed; `traps/README.md` SHALL list TR-01/04/08/12/18 as corrected. The moderator overlay SHALL continue to annotate only registered traps.

## Scenarios

### Scenario: Keyboard-only purchase
- **Given** a participant using only Tab/Enter/Escape
- **Then** they can skip the header, trigger search, tab products in order, open and leave the cart predictably, and reach the first invalid checkout field after a failed submit — while still hitting the remaining barriers (unlabelled fields, icon-only remove, silent totals, colour-only errors)

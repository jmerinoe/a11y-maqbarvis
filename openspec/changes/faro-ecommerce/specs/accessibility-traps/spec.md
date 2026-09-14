# Spec: Accessibility Traps

## Purpose

Defines the 19 intentional accessibility defects embedded in the purchase flow. Each trap is a real, common WCAG failure — not an invented defect. Traps must be present in the default (non-moderator) experience and must genuinely impede screen reader and keyboard navigation.

## Requirements

### REQ-AT-01: Traps are real WCAG failures
Every trap shall correspond to a documented WCAG 2.1 Success Criterion failure. No trap shall be an artificial or caricatured defect.

### REQ-AT-02: Traps impede navigation
Each trap shall produce a tangible negative effect for a keyboard-only screen reader user (NVDA): missing announcement, unreachable control, ambiguous label, lost focus, or blocked interaction.

### REQ-AT-03: Traps are isolated
Each trap shall be independently identifiable. The moderator mode shall be able to annotate each trap individually without affecting others.

### REQ-AT-04: Traps do not break the app
Traps shall impede accessibility, not crash the application. The purchase flow shall remain functionally completable by a sighted mouse user (the traps target screen reader / keyboard users specifically).

### REQ-AT-05: Trap metadata
Each trap shall carry metadata: a unique ID, the screen it belongs to, a failure description, the WCAG SC reference, and the corrected HTML snippet. This metadata feeds the moderator mode.

## Trap inventory

### Home screen

| ID | Trap | WCAG SC | Effect |
|----|------|---------|--------|
| TR-01 | No "skip to content" link | 2.4.1 Bypass Blocks | User must tab through entire header/nav before reaching content |
| TR-02 | Logo `<img>` without `alt` | 1.1.1 Non-text Content | Screen reader announces image filename or "image" with no meaning |
| TR-03 | Auto-rotating carousel that moves focus | 2.2.2 Pause, Stop, Hide | Focus is stolen mid-navigation, user loses position |

### Search

| ID | Trap | WCAG SC | Effect |
|----|------|---------|--------|
| TR-04 | Search button is a `<div onclick>` | 4.1.2 Name, Role, Value | Not announced as a button; cannot be activated with Enter/Space |
| TR-05 | Search input has only `placeholder`, no `<label>` | 1.3.1 Info and Relationships, 3.3.2 Labels or Instructions | Field announced without a meaningful name |

### Product listing

| ID | Trap | WCAG SC | Effect |
|----|------|---------|--------|
| TR-06 | Filter checkboxes without associated `<label>` | 1.3.1, 3.3.2 | Filters announced as bare "checkbox" with no name |
| TR-07 | Product cards with generic "Comprar" links, no product context | 2.4.4 Link Purpose | 20 identical "Comprar" links, user cannot tell which product each opens |
| TR-08 | Tab order broken by positive `tabindex` values | 1.3.2 Meaningful Sequence, 2.4.3 Focus Order | Tab jumps illogically across the page |

### Product detail

| ID | Trap | WCAG SC | Effect |
|----|------|---------|--------|
| TR-09 | Size selector is a custom `<div>` widget with no `role`, no accessible name | 4.1.2 | Announced as meaningless clickable divs; size selection invisible to SR |
| TR-10 | Price is in a separate DOM region from product name | 1.3.1 Info and Relationships | SR reads product name and price disconnected; user cannot associate them |
| TR-11 | "Add to cart" gives no feedback (no `aria-live`) | 4.1.3 Status Messages | User presses add-to-cart but gets no confirmation it worked |

### Cart

| ID | Trap | WCAG SC | Effect |
|----|------|---------|--------|
| TR-12 | Cart opens as a modal with no focus management (focus trap / no move) | 2.4.3 Focus Order | Focus is lost or trapped; user cannot enter or escape the cart predictably |
| TR-13 | Remove button is an icon-only `<button>` with no text or `aria-label` | 1.1.1, 4.1.2 | Announced as bare "button"; user cannot tell it removes an item |
| TR-14 | Quantity change does not announce the new total (no `aria-live`) | 4.1.3 | User changes quantity but never hears the updated total |

### Checkout

| ID | Trap | WCAG SC | Effect |
|----|------|---------|--------|
| TR-15 | Validation errors indicated only by red border color | 1.4.1 Use of Color | Colorblind / SR users cannot perceive the error |
| TR-16 | Form fields without `<label>` (placeholder only) | 1.3.1, 3.3.2 | Fields announced without names |
| TR-17 | Error message not associated with its field (`aria-describedby` missing) | 3.3.1 Error Identification, 4.1.3 | SR user hears an error exists but not which field it belongs to |
| TR-18 | Focus does not move to the first invalid field after validation | 2.4.3, 3.3.1 | User submits, gets errors, but focus stays on submit button |

### Confirmation

| ID | Trap | WCAG SC | Effect |
|----|------|---------|--------|
| TR-19 | "Order confirmed" message has no `role="status"` | 4.1.3 Status Messages | SR user never hears the confirmation; they don't know the order succeeded |

## Scenarios

### Scenario: Screen reader user hits missing skip link
- **Given** NVDA is running and the attendee is on the home screen
- **When** they begin tabbing from the top of the page
- **Then** there is no "skip to content" link and they must tab through all header elements before reaching main content

### Scenario: Search button unreachable via keyboard
- **Given** the attendee has tabbed to the search button (a `<div onclick>`)
- **When** they press Enter or Space
- **Then** the search does not execute because the element is not a real button

### Scenario: Generic link text causes confusion
- **Given** the attendee is on the product listing with NVDA reading the link list
- **When** NVDA announces the product action links
- **Then** every link is announced as "Comprar" with no indication of which product it refers to

### Scenario: Add to cart gives no feedback
- **Given** the attendee is on a product detail screen and activates "Add to cart"
- **When** NVDA processes the action
- **Then** no status message is announced; the user does not know whether the item was added

### Scenario: Order confirmation not announced
- **Given** the attendee has submitted a valid checkout form
- **When** the confirmation screen renders
- **Then** NVDA does not announce "order confirmed" because the message lacks `role="status"`

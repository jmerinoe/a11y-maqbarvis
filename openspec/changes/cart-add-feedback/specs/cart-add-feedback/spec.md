# Spec: Cart Add Feedback

## Purpose

Defines the behavior of the "Add to cart" action on the product detail screen: live cart counter update, accessible confirmation message on success, and accessible validation message when size or color is missing. This spec also records the removal of the TR-11 trap.

## Requirements

### REQ-CAF-01: Size and color required to add to cart
The "Add to cart" action SHALL require both a selected size and a selected color. If either the size or the color is not selected when the attendee activates "Add to cart", the product SHALL NOT be added to the cart.

### REQ-CAF-02: Validation message for missing attributes
When "Add to cart" is activated without a selected size and/or color, a validation message SHALL be displayed and announced to assistive technology. The message SHALL identify which attribute(s) are missing. The message SHALL use an ARIA live region (`role="alert"` / `aria-live="assertive"`) so it is announced immediately.

### REQ-CAF-03: Confirmation message on successful add
When "Add to cart" is activated with both size and color selected, the product SHALL be added to the cart and a confirmation message SHALL be displayed and announced. The message SHALL use an ARIA live region (`role="status"` / `aria-live="polite"`) so it is announced after the action. The message SHALL reference the product being added.

### REQ-CAF-04: Live cart counter update
When a product is added to the cart, the cart counter badge in the header SHALL increment by 1 immediately, without requiring navigation to another screen. The header SHALL subscribe to store cart changes and re-render only the cart counter, not the entire screen.

### REQ-CAF-05: Cart counter accuracy
The cart counter SHALL reflect the total quantity of items in the cart (sum of all item quantities), consistent with the existing `cartCount` calculation in `header.js`.

### REQ-CAF-06: Bilingual messages
All confirmation and validation messages SHALL be available in both Spanish and English, following the existing i18n pattern. Switching language SHALL update the messages on the next render.

### REQ-CAF-07: Removal of TR-11 trap
The TR-11 trap ("add-to-cart with no `aria-live` feedback") SHALL be removed from the trap registry. The `data-trap="TR-11"` attribute SHALL be removed from the add-to-cart button in `product-detail.js`. The trap registry structural test SHALL be updated to expect 18 traps instead of 19. The verification checklist and any documentation referencing TR-11 SHALL be updated.

### REQ-CAF-08: No regression to other traps
This evolution SHALL NOT modify, fix, or remove any other trap (TR-01 through TR-10, TR-12 through TR-19). The variant selector (TR-09) SHALL remain a broken custom div widget; the validation message is a separate announced region and does not alter the selector's DOM.

## Scenarios

### Scenario: Add to cart with size and color selected
- **Given** the attendee is on a product detail screen
- **When** they select a size, select a color, and activate "Add to cart"
- **Then** the product is added to the cart with the selected variant
- **And** the cart counter in the header increments by 1 immediately
- **And** a confirmation message is displayed and announced via `role="status"`

### Scenario: Add to cart without selecting size or color
- **Given** the attendee is on a product detail screen
- **When** they activate "Add to cart" without selecting a size or a color
- **Then** the product is NOT added to the cart
- **And** a validation message is displayed and announced via `role="alert"` indicating that size and color must be selected

### Scenario: Add to cart with only size selected
- **Given** the attendee is on a product detail screen
- **When** they select a size but no color and activate "Add to cart"
- **Then** the product is NOT added to the cart
- **And** a validation message is displayed and announced indicating that color must be selected

### Scenario: Add to cart with only color selected
- **Given** the attendee is on a product detail screen
- **When** they select a color but no size and activate "Add to cart"
- **Then** the product is NOT added to the cart
- **And** a validation message is displayed and announced indicating that size must be selected

### Scenario: Cart counter updates live across multiple adds
- **Given** the attendee is on a product detail screen and the cart is empty
- **When** they add a product (with size and color) twice
- **Then** the cart counter shows 2 without navigating away from the product detail screen

### Scenario: Validation message clears on successful add
- **Given** the attendee previously saw a validation message (missing attribute)
- **When** they then select the missing attribute and activate "Add to cart"
- **Then** the validation message is replaced by the confirmation message and the product is added

### Scenario: Language switch updates message keys
- **Given** the attendee is on a product detail screen
- **When** they trigger a validation message and then switch language
- **Then** the next validation/confirmation message is rendered in the newly selected language

### Scenario: TR-11 no longer present
- **Given** the trap registry after this evolution is applied
- **When** the structural test runs
- **Then** the registry contains 18 traps and no entry with id `TR-11`
- **And** no element in the built output carries `data-trap="TR-11"`

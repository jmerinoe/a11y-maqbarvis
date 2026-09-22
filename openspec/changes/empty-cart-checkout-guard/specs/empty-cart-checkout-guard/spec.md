# Spec: Empty cart must not reach checkout

## Purpose

Defines the required behavior when the cart contains no items: the checkout action SHALL NOT be reachable, and the checkout screen SHALL NOT render for an empty cart.

## Requirements

### REQ-720-01: Checkout button removed when the cart empties
When a remove action or a quantity decrement-to-zero empties the cart, the cart screen SHALL re-render its empty state: the `.cart-empty` message is shown and neither the checkout button nor the cart total is present in the DOM.

### REQ-720-02: Checkout button present while items remain
As long as `cart.length > 0`, the checkout button linking to `#/checkout` SHALL remain rendered after quantity/remove operations.

### REQ-720-03: Checkout screen guards empty carts
`renderCheckout` SHALL NOT render the checkout form when `cart.length === 0`; it SHALL navigate to `#/cart` instead. This covers direct URL navigation.

### REQ-720-04: Traps preserved
TR-12, TR-13, TR-14 (cart) and TR-15–TR-18 (checkout) SHALL remain unchanged. No `data-trap` marker, registry entry, i18n key, or stylesheet SHALL be added or modified.

## Scenarios

### Scenario: Last item removed — no way to checkout
- **Given** the attendee has one item in the cart
- **When** they click the remove button
- **Then** the cart shows the empty message and no checkout button — the purchase cannot continue

### Scenario: Quantity decremented to zero
- **Given** the attendee has one item with quantity 1
- **When** they click "−"
- **Then** the item disappears, the empty state renders, and no checkout button exists

### Scenario: Direct navigation with empty cart
- **Given** the cart is empty
- **When** the attendee navigates to `#/checkout`
- **Then** they are redirected to `#/cart` and no checkout form renders

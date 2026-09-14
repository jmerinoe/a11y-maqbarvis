# Spec: Purchase Flow

## Purpose

Defines the ecommerce purchase flow that attendees navigate: 6 screens from home to order confirmation, with full keyboard-only and screen-reader interaction.

## Requirements

### REQ-PF-01: Product catalog
The site shall have a catalog of at least 8 products. Each product shall have: name, price, image, available sizes, and available colors.

### REQ-PF-02: Home screen
The home screen shall display a search bar, a hero/banner area, and a set of featured products. The search bar shall filter the catalog by product name.

### REQ-PF-03: Product listing screen
The product listing shall display all products in a grid. It shall provide filters by size and by color. Selecting a product card shall navigate to that product's detail screen.

### REQ-PF-04: Product detail screen
The product detail screen shall display: product name, price, image, a size selector, a color selector, and an "Add to cart" button. Selecting a size and color and pressing "Add to cart" shall add the product to the cart.

### REQ-PF-05: Cart screen
The cart shall list all added items with their quantity, unit price, and line total. It shall allow adjusting the quantity of each item and removing individual items. It shall display the cart total. It shall provide a "Checkout" button to proceed to the checkout screen.

### REQ-PF-06: Checkout screen
The checkout screen shall display a form with fields: full name, email, shipping address, card number, card expiry, and card CVV. The form shall validate required fields and email/card format. Submitting a valid form shall navigate to the confirmation screen. Submitting an invalid form shall show errors and prevent navigation.

### REQ-PF-07: Confirmation screen
The confirmation screen shall display an "Order confirmed" message with a summary of the purchased items and total. It shall provide a "Back to home" action.

### REQ-PF-08: Navigation
The site shall allow navigation between all 6 screens following the purchase flow. Navigation shall work with keyboard only (no mouse required for the flow itself, though traps may impede it).

### REQ-PF-09: Static data
All product data shall be static (JSON fixture or in-memory). There shall be no backend, no API calls, and no network dependency. The site shall function fully offline.

## Scenarios

### Scenario: Browse and search from home
- **Given** the attendee is on the home screen
- **When** they enter "camiseta" in the search bar and submit
- **Then** the product listing screen shows only products whose name contains "camiseta"

### Scenario: Filter products by size
- **Given** the attendee is on the product listing screen
- **When** they activate the size "M" filter
- **Then** only products available in size M are displayed

### Scenario: Add product to cart
- **Given** the attendee is on a product detail screen
- **When** they select a size, select a color, and activate "Add to cart"
- **Then** the product is added to the cart with the selected variant

### Scenario: Adjust cart quantity
- **Given** the attendee is on the cart screen with an item of quantity 1
- **When** they increase the quantity to 2
- **Then** the line total and cart total update to reflect 2 units

### Scenario: Remove item from cart
- **Given** the attendee is on the cart screen with at least one item
- **When** they activate the remove button for an item
- **Then** the item is removed from the cart and the cart total updates

### Scenario: Complete checkout with valid data
- **Given** the attendee is on the checkout screen
- **When** they fill all required fields with valid data and submit
- **Then** the confirmation screen is shown with the order summary

### Scenario: Submit checkout with invalid data
- **Given** the attendee is on the checkout screen
- **When** they submit with missing or invalid fields
- **Then** errors are displayed and the confirmation screen is NOT shown

### Scenario: Offline operation
- **Given** the device has no internet connection
- **When** the attendee navigates the entire purchase flow
- **Then** all screens function correctly with no network errors

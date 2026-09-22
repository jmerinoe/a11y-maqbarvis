# Spec: Products listing sorted in reverse alphabetical order

## Purpose

Defines the required ordering of the product listing (`#/products`): all displayed products SHALL be presented in reverse alphabetical order (Z → A) by their localized product name, after search and size/color filters are applied.

## Requirements

### REQ-700-01: Reverse alphabetical ordering by localized name
`getFilteredProducts` SHALL return the filtered products sorted in descending alphabetical order by the product's name in the active document language (`document.documentElement.lang`, falling back to `es` / `name.es`). The comparison SHALL use `localeCompare` with the active language and `{ sensitivity: 'base' }` (case- and accent-insensitive).

### REQ-700-02: Ordering applies after filtering
The sort SHALL be applied to the already-filtered result — any combination of search query, size filters, and color filters SHALL produce a reverse-alphabetically ordered subset.

### REQ-700-03: The catalog array is never mutated
Sorting SHALL NOT mutate the `products` array — home featured products and carousel slides SHALL retain catalog order.

### REQ-700-04: No UI or trap changes
The ordering SHALL be fixed (no user-facing sort control). No `data-trap` marker, registry entry, i18n key, or stylesheet SHALL be added or modified.

## Scenarios

### Scenario: Listing renders Z → A (Spanish)
- **Given** the attendee navigates to `#/products` with `lang="es"`
- **When** the listing renders
- **Then** the cards appear in this order: Vaqueros slim, Sudadera gris, Gorra negra, Chaqueta de cuero, Camiseta de rayas, Camiseta, Camisa a cuadros, Bufanda de lana

### Scenario: Listing renders Z → A (English)
- **Given** the attendee switches to English (`lang="en"`) on `#/products`
- **When** the listing renders
- **Then** the cards appear in this order: Wool scarf, T-shirt, Striped t-shirt, Slim jeans, Plaid shirt, Leather jacket, Gray hoodie, Black cap

### Scenario: Filtered subset keeps the order
- **Given** the attendee checks a size or color filter, or types a search query
- **When** the listing re-renders
- **Then** only matching products are shown, still in reverse alphabetical order

### Scenario: Home screen unaffected
- **Given** the evolution is applied
- **When** the attendee views the home featured section
- **Then** the featured products keep catalog order (Camiseta, Camiseta de rayas, Vaqueros slim, Sudadera gris in ES)

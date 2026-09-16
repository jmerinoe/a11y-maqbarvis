# Spec: Variant Options i18n

## Purpose

Defines how product variant options (sizes and colors) are displayed across the products listing filters, the product detail variant selector, and the cart. Variant values SHALL have a single canonical form in the data layer, and all user-facing variant text SHALL be rendered in the active page language. The duplicated "Única" / "One size" options SHALL be consolidated into one canonical option with a localized label.

## Requirements

### REQ-VOI-01: Single canonical one-size value
The size option meaning "one size fits all" SHALL have exactly one canonical value (`one-size`) in product data, filter state, variant selection, and cart state. The raw values `Única` and `One size` SHALL NOT appear as distinct data values anywhere in the codebase.

### REQ-VOI-02: One-size option displayed once, localized
Wherever a one-size option is shown (size filter, variant selector, cart line item), exactly ONE option SHALL be displayed, with the label "Talla única" when the page language is Spanish and "One size" when it is English. Switching language SHALL update the label on the next render.

### REQ-VOI-03: Localized color labels
Every color option shown to the user SHALL be labeled in the active page language: Azul/Blue, Negro/Black, Blanco/White, Gris/Gray, Verde/Green, Rojo/Red, Marrón/Brown. The canonical color keys (`blue`, `black`, `white`, `gray`, `green`, `red`, `brown`) SHALL remain the values used for filtering, `colorHex` lookup, variant selection, and cart state.

### REQ-VOI-04: Language-neutral sizes unchanged
Sizes that are already language-neutral (`S`, `M`, `L`, `XL`, `28`, `30`, `32`, `34`, `36`) SHALL render as-is with no translation indirection.

### REQ-VOI-05: Filtering semantics preserved
Filtering by the canonical `one-size` value SHALL return the same products that previously matched `Única` or `One size` (p007, p008). Filtering by canonical color keys SHALL behave exactly as before. `getFilteredProducts` SHALL require no signature change.

### REQ-VOI-06: Variant selection still works with localized labels
Selecting a variant in the product detail selector SHALL mark the clicked option as selected and store the canonical value — not the localized label — in selection state and in the cart. Selection matching SHALL NOT depend on rendered (localized) text.

### REQ-VOI-07: Localized labels sourced from i18n tables
All new variant labels SHALL be defined in the centralized ES/EN string tables (per REQ-I18N-02). No localized variant label SHALL be hardcoded inline in a component. ES/EN key parity SHALL hold for all new keys.

### REQ-VOI-08: Traps preserved
This evolution SHALL NOT alter any trap. TR-06 (filter checkboxes without `<label>`) SHALL remain: option text is still rendered in a `<span>`, not a `<label>`. TR-09 (variant selector as custom `<div>` widget) SHALL remain: options keep `onclick` without role or accessible name. All `data-trap` attributes and the 18-entry trap registry SHALL be unchanged.

## Scenarios

### Scenario: Color filter labels in Spanish
- **Given** the page language is Spanish
- **When** the attendee opens the products listing
- **Then** the color filter options read Azul, Negro, Blanco, Gris, Verde, Rojo, Marrón

### Scenario: Color filter labels in English
- **Given** the attendee switches the page language to English
- **When** the products listing re-renders
- **Then** the color filter options read Blue, Black, White, Gray, Green, Red, Brown

### Scenario: Single one-size filter option
- **Given** the products listing is displayed in either language
- **When** the attendee inspects the size filter
- **Then** there is exactly one one-size option (labeled "Talla única" in es, "One size" in en), not two

### Scenario: Filtering by one-size
- **Given** the attendee checks the one-size filter option
- **When** the product grid updates
- **Then** exactly the one-size products (p007 Gorra negra, p008 Bufanda de lana) are shown — the same set previously matched by `Única`/`One size`

### Scenario: Variant selector shows localized options
- **Given** the page is in Spanish and the attendee opens p007 (Gorra negra)
- **When** the variant selectors render
- **Then** the size selector shows a single "Talla única" option and the color options show Spanish names

### Scenario: Selection state survives localization
- **Given** the attendee is on a product detail screen in Spanish
- **When** they click a color option (e.g. "Rojo")
- **Then** that option gets the `selected` class and the canonical value `red` is stored as the selected color

### Scenario: Cart line item localized
- **Given** the attendee adds a one-size, red product to the cart with the page in Spanish
- **When** they open the cart
- **Then** the line item variant text reads "Talla única · Rojo" (not "one-size · red")

### Scenario: Language switch re-localizes options
- **Given** the products listing is rendered in Spanish
- **When** the attendee switches to English
- **Then** on re-render, the one-size option reads "One size" and colors read their English names — while any already-checked filters keep their canonical checked state and still filter correctly

### Scenario: Traps unchanged
- **Given** the evolution is applied
- **When** the moderator activates moderator mode on products or product-detail
- **Then** TR-06 and TR-09 annotations still appear over the same elements, and the registry structural test still reports 18 traps

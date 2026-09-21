# Spec: TR-06 + TR-07 Removal, TR-09 Partial Removal

## Purpose

Defines the corrected behavior of the product listing filters, product card links, and the product-detail variant selector after removing TR-06 and TR-07 and partially removing TR-09. The TR-09 correction is deliberately partial: every size **except M** and every color becomes an accessible radio option, while the **M size option keeps the trapped non-semantic markup** so the trap remains demonstrable in an otherwise corrected widget. This spec also records the registry correction (17 → 15 traps).

## Requirements

### REQ-690-01: Filter checkboxes have associated labels
Every filter `<input type="checkbox">` (all sizes — including M — and all colors) SHALL have a unique `id` and an associated `<label for="...">` containing the localized option name. The bare `<span>` pattern SHALL be removed. `data-trap="TR-06"` SHALL be removed and the TR-06 registry entry deleted.

### REQ-690-02: Buy links identify their product
Each product card link SHALL include the localized product name in its visible text via the `products.buyNamed` i18n key (`Comprar — {name}` / `Buy — {name}`). No two product links SHALL have identical accessible text. `data-trap="TR-07"` SHALL be removed and the TR-07 registry entry deleted.

### REQ-690-03: Variant selector is a semantic ARIA radio group
Each variant selector SHALL be a `<fieldset>` with a `<legend>` naming the group (Size/Color), with `role="radiogroup"` on the options container. Each option — except the M exception in REQ-690-04 — SHALL be an element with `role="radio"`, `aria-checked` reflecting the selection, `tabindex="0"`, and keyboard activation via Enter/Space (`keydown` handler). Every option SHALL be individually reachable via Tab — a native radio group would contribute only one Tab stop, which the owner rejected.

### REQ-690-04: The M size option keeps the trap
When the selector type is `size` and the option value is `M`, the option SHALL render the original trapped markup: `<div data-trap="TR-09" class="variant-option" data-value="M" onclick="...">`. It SHALL NOT carry `role="radio"` and SHALL have no role or accessible name. It SHALL carry `tabindex="0"` so keyboard users can focus it in the tab order, and a `keydown` handler SHALL make it selectable via Enter/Space — but it remains unidentifiable as an option to screen readers (the trap persists in name/role/value: focusable and selectable, yet announced as a generic clickable). It SHALL remain the only `data-trap="TR-09"` element on the page. The TR-09 registry entry SHALL be kept with an updated description reflecting the partial correction. Products without an M size render no TR-09 marker.

### REQ-690-05: Selection state stays coherent across the mixed widget
Selecting an option SHALL mark it `.selected` and set `aria-checked="true"`; selecting the M div SHALL mark it `.selected` and reset `aria-checked="false"` on all ARIA radios in the group. Selection SHALL continue to flow through `window.__faroSelectVariant` and the `variant-selected` CustomEvent.

### REQ-690-06: Keyboard focus remains visible on corrected options
Every option — ARIA radios and the trapped M div alike — SHALL produce a visible focus indicator when focused via keyboard (`:focus-visible`).

### REQ-690-07: Registry and documentation correction
`src/traps/registry.js` SHALL contain 15 traps (TR-06, TR-07 removed; TR-09 kept as partial). `src/tests/trap-registry.test.js`, `src/traps/README.md`, and `docs/verification-checklist.md` SHALL be updated accordingly. The checklist SHALL document the corrected filter/link behavior and the TR-09 partial trap.

### REQ-690-08: No regression to other traps
This evolution SHALL NOT modify any other trap. TR-08 (positive tabindex on cards), TR-10 (disconnected price), and all remaining traps SHALL be preserved, including their `data-trap` markers.

## Scenarios

### Scenario: Screen reader identifies every filter
- **Given** NVDA is running and the attendee is on `#/products`
- **When** they navigate to the filter checkboxes
- **Then** each checkbox is announced with its localized name ("S", "M", "Azul", …) inside its "Talla"/"Color" group — no bare "checkbox" announcements

### Scenario: Screen reader identifies what each link buys
- **Given** the attendee opens the NVDA links list (Insert+F7) on `#/products`
- **When** NVDA reads the product links
- **Then** each entry is announced as e.g. "Comprar — Camiseta", uniquely identifying the product

### Scenario: Screen reader identifies sizes and colors on the detail page
- **Given** the attendee is on a product detail page (e.g. p001)
- **When** they navigate the variant selectors
- **Then** sizes S, L, XL and all colors are announced as radio buttons within a named group ("Talla" / "Color") with checked state — and Tab reaches every option individually

### Scenario: The M option remains trapped
- **Given** the attendee is on a product that offers size M
- **When** they navigate the size group with NVDA
- **Then** the M option is still announced as a generic clickable div with no role or name — the TR-09 defect persists only on M
- **And** with moderator mode on, the TR-09 badge annotates only the M option

### Scenario: Tab reaches M and it is selectable but not identifiable
- **Given** the attendee is tabbing through the size group
- **When** focus lands on the M option and they press Enter or Space
- **Then** the div receives focus (not skipped in the tab order) and M IS selected — but NVDA never announced it as an option of the group (no role, no name): the trap persists as "operable but unidentifiable"

### Scenario: Mixed selection stays coherent
- **Given** the attendee selected size L via its ARIA radio
- **When** a mouse user clicks the M div (or a test dispatches its handler)
- **Then** M becomes visually selected AND all ARIA radios return to `aria-checked="false"`

### Scenario: Traps removed from the registry
- **Given** the evolution is applied
- **When** the structural test runs
- **Then** the registry contains 15 traps: no TR-06 or TR-07 entries, and TR-09 still present as a partial trap

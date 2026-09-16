# Spec: Logo Icon — Lowercase "f" in Times New Roman

## Purpose

Defines the brand restyle of the header logo icon: the letter inside the circular SVG mark SHALL be a lowercase "f" rendered in Times New Roman. The wordmark text and all other header elements remain unchanged, and the TR-02 trap is preserved.

## Requirements

### REQ-LOG-01: Lowercase letter
The `<text>` element inside the logo SVG data-URI SHALL render the letter `f` (lowercase), replacing the previous `F`.

### REQ-LOG-02: Times New Roman typeface
The `<text>` element's `font-family` SHALL be `Times New Roman`, replacing `serif`.

### REQ-LOG-03: Wordmark unchanged
The `<span>Faro</span>` text next to the icon SHALL remain "Faro" with unchanged styling. All other header elements (nav, cart, language toggle) are unaffected.

### REQ-LOG-04: Icon geometry and color unchanged
The icon's size (40×40), circle (fill `#1c1917`, `rx='20'`), and letter color (`#f59e0b`) SHALL be unchanged. The letter SHALL be rendered at `font-size='28'` and optically centered in the circle (`x='20' y='20'`, `text-anchor='middle'`, `dominant-baseline='central'`).

### REQ-LOG-05: TR-02 preserved
The logo SHALL remain an `<img>` element with `data-trap="TR-02"` and **no** `alt` attribute. No change may repair or alter the trap.

## Scenarios

### Scenario: Icon shows lowercase f
- **Given** any screen renders the header
- **When** the attendee looks at the logo icon
- **Then** the circle contains a lowercase "f"

### Scenario: Icon uses Times New Roman
- **Given** any screen renders the header
- **When** the logo icon is inspected
- **Then** the SVG text element's `font-family` is `Times New Roman`

### Scenario: Wordmark still "Faro"
- **Given** the header is rendered
- **When** the attendee reads the logo
- **Then** the text next to the icon still reads "Faro" (capital F)

### Scenario: TR-02 still a trap
- **Given** moderator mode is active
- **When** the moderator inspects the header
- **Then** the TR-02 annotation still appears over the logo image — the image still lacks `alt`

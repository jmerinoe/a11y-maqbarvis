# Spec: Panel branding on session screens

## REQ-810-01 — Panel logo on all session screens

The login, experience-selection, instructions, and ranking screens MUST display the Panel logo (`/images/panel-logo.jpg`) in the top-right area of the viewport.

The logo MUST be a real `<img>` element with a non-empty `alt` attribute (localized via `panel.logoAlt`).

## REQ-810-02 — Brand look and feel

The four session screens MUST use the Panel look from the reference (`reference/panel-background.png`):

- White page background.
- Light-blue ring/circle motif anchored to the right side of the viewport (CSS-generated, decorative).
- Clean centered content without the previous dashed-border card.
- Panel-cyan accent on primary actions and links within these screens.

The brand chrome MUST be implemented once (shared wrapper) and applied identically to all four screens.

## REQ-810-03 — Accessibility preserved

The rebranded screens MUST remain trap-free:

- The logo `<img>` MUST have an `alt` attribute.
- The logo MUST NOT be focusable and MUST NOT alter the tab order of the interactive elements.
- Focus styles MUST remain visible on all interactive elements.
- No `data-trap` attribute may be introduced.

## REQ-810-04 — Out of scope surfaces

The following MUST NOT be restyled by this change:

- Faro purchase-flow screens (home, products, product detail, cart, checkout, confirmation).
- The `#experience-timer` badge (must keep its external-instrumentation look).
- The congrats dialog.

## Scenarios

### Scenario 1 — Login screen

**Given** no active session
**When** the app loads
**Then** `#/login` shows the Panel logo top-right, pale-blue rings on the right, a clean white layout, and the form remains fully functional and accessible.

### Scenario 2 — Flow consistency

**Given** a participant progressing through login → experience selection → instructions → (after completion) ranking
**When** each screen renders
**Then** all four show identical branding (same logo position, same ring motif, same accent colour).

### Scenario 3 — Faro untouched

**Given** a participant inside the purchase flow
**When** `#/home`, `#/products`, `#/cart`, `#/checkout`, or `#/confirmation` renders
**Then** no Panel logo or rings appear, and the timer badge keeps its instrumentation styling.

### Scenario 4 — Keyboard and screen reader

**Given** a keyboard or screen-reader user on any session screen
**When** they navigate
**Then** the logo is announced as "Panel" (or skipped as non-interactive), tab order covers only the form/links/buttons, and no trap is introduced.

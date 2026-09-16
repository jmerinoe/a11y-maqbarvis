# Proposal: Logo Icon — Lowercase "f" in Times New Roman

## Why

The site logo in the header is an inline SVG image (data-URI) showing a capital **F** in `font-family='serif'` on a dark circle. The product owner wants the icon letter updated to a **lowercase "f" in Times New Roman**, matching a brand restyle. The wordmark text "Faro" next to the icon stays unchanged — scope is the icon only.

This is a **cosmetic/brand change, not a trap correction**: the icon image is the TR-02 trap (image without `alt`). The letter and font change does not touch the `data-trap` marker, the `<img>` element, or its missing `alt` — TR-02 remains fully intact.

## What Changes

### Scope — Header logo icon only

1. **Lowercase letter** — the SVG `<text>` element inside the data-URI changes from `F` to `f`.
2. **Times New Roman** — the `<text>` `font-family` changes from `serif` to `Times New Roman`.
3. **Nothing else** — the `<span>Faro</span>` wordmark, colors, sizes, circle, and all attributes are unchanged.

### Out of scope

- The "Faro" wordmark text and its styling.
- The hero title strings (`home.hero.title` mention "Faro" — brand name unchanged).
- TR-02 correction (the image still has no `alt` — intentional).
- Any other header element.

## How

### Architecture approach

Single edit in `src/components/header.js` line 19 — inside the `data:image/svg+xml` URI:

- `font-family='serif'` → `font-family='Times New Roman'`
- `>F</text>` → `>f</text>`

Spaces in `Times New Roman` are written literally, consistent with the rest of the data-URI (literal spaces already appear in `width='40' height='40'` etc.; browsers encode them automatically).

### Testing strategy

- New small structural test `logo-icon.test.js`: header logo `<img>` src contains `>f</text>` (lowercase) and `font-family='Times New Roman'`; `data-trap="TR-02"` still present; `alt` still absent (TR-02 preserved); wordmark span still reads "Faro".
- Existing tests unaffected.

### Delivery

Single commit. Files: `header.js`, one new test, openspec docs. Trivially under any size threshold.

## Assumptions

- "la f" refers to the letter inside the circular icon, per the confirmed scope (icon only).
- "New Times Roman" means **Times New Roman** (the standard font name; "New Times Roman" is a common misnomer).
- The lowercase "f" keeps the same position (`x='20' y='28'`, `text-anchor='middle'`) and color (`#f59e0b`); minor glyph-shape differences in Times New Roman are acceptable.
- If Times New Roman is unavailable on a system, the SVG falls back to the default serif — acceptable for the demo.

## Risks

| Risk | Mitigation |
|------|------------|
| Lowercase "f" looks slightly off-center vs. the old capital F | `text-anchor='middle'` keeps it horizontally centered; visually verified in dev |
| Font unavailable on attendee hardware | Serif fallback still renders a reasonable "f"; acceptable |
| Change accidentally alters TR-02 | Only the `<text>` content and `font-family` inside the data-URI change; `data-trap` and missing `alt` untouched — asserted in test |

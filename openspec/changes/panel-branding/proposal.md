# Proposal: Panel branding on session screens

## Why

The four workshop-session screens (login, experience selection, instructions, ranking) currently use a provisional look — a dashed-border grey card on the default page background. For the event, these screens should carry the Panel corporate identity: the Panel logo in the top-right corner and the light-blue ring motif on white, matching the provided brand reference.

## Scope

### In scope

- `src/screens/login.js`
- `src/screens/experience-select.js`
- `src/screens/instructions.js`
- `src/screens/ranking.js`
- New shared chrome: `.panel-shell` full-viewport wrapper + `.panel-logo` `<img>` element, applied to the four screens above.
- `src/styles/main.css` — Panel visual system for these screens (white background, pale-blue rings, clean content column, Panel-cyan accents).
- `public/images/panel-logo.jpg` — logo asset (copied from the provided file).
- `src/i18n/es.js`, `src/i18n/en.js` — `panel.logoAlt` key.
- Tests asserting the branding is present on all four screens and no traps were introduced.

### Out of scope

- The Faro purchase flow (home, products, detail, cart, checkout, confirmation) keeps its own identity — Faro is the product under test.
- The `#experience-timer` badge — it must keep looking like external instrumentation.
- The congrats dialog — keeps its current styling (it appears over the Faro confirmation screen).
- No behavioural changes: validation, routing, timing, and ranking logic are untouched.
- No changes to traps.

## Design decision

- **Logo**: a real `<img src="/images/panel-logo.jpg" alt="Panel">` fixed top-right. It is meaningful branding on screens that must remain accessible, so it gets an `alt` — a background-only logo would be invisible to screen readers.
- **Rings**: recreated in CSS with `radial-gradient` rings anchored to the right edge of a `.panel-shell` wrapper, instead of using the provided background PNG. A fixed-pixel bitmap would crop differently on each aspect ratio; CSS rings always land at the same relative position.
- **Card**: the dashed-border `.session-screen` / `.ranking-screen` box is replaced by a clean white content column (no visible card chrome), per the reference's minimal look.
- **Accent**: primary buttons and links on these screens use the Panel cyan (`#00a9ce`-family) instead of the Faro primary colour.

## Assumptions

1. Only the four listed screens get Panel branding; everything else is unchanged.
2. The logo JPG's white background is acceptable (the page background is white).
3. Panel cyan accent for buttons/links is part of the desired look; if Faro-primary buttons should be kept instead, it is a one-line CSS change.
4. The ranking screen gets the same branding even though it can be reached after the congrats dialog over a Faro screen.

## Risks

- None functional — pure presentation change on four screens plus one shared wrapper.
- The four screens must remain trap-free: the new `<img>` must have `alt`, and the wrapper must not interfere with focus order (logo placed with CSS `position`, not reordered in DOM mid-flow).

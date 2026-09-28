# Spec: Kiosk accessibility + trap-free session screens

## REQ-820-01 — Ranking list semantics

The kiosk presentation ranking SHALL expose list semantics: each column SHALL be an ordered list (`<ol>`) and each row a `<li>`; the second column SHALL carry the correct `start` attribute so positions remain implicit. Visual layout and animations SHALL be unchanged.

## REQ-820-02 — Live announcements

Status changes SHALL be announced politely:

- A `role="status"` (or `aria-live="polite"`) region SHALL announce board/experience changes, empty state ("ESPERANDO JUGADORES…"), and offline state.
- The NEW RECORD banner SHALL have `role="status"` so it is announced when it appears.
- Row-level repaint noise SHALL NOT flood the live region (announce board-level events, not every row).

## REQ-820-03 — Rotation pause control

The auto-rotation between experiences SHALL be pausable via a keyboard-operable button (`aria-pressed` state) placed in the footer. Pausing SHALL NOT stop API polling.

## REQ-820-04 — Reduced motion

JS-driven FLIP/entrance/exit animations SHALL be skipped when `prefers-reduced-motion: reduce` is set, matching the existing CSS media query coverage.

## REQ-820-05 — Admin form labels

Every input/select in admin mode SHALL have an accessible name (`<label for>` or `aria-label`): PIN field (existing), add-form fields (participant, experience, new-experience id, time), and inline edit fields. The time format (MM:SS) SHALL be conveyed by the label or helper text.

## REQ-820-06 — Table and toggle semantics

- All results-table headers SHALL use `scope="col"`; the actions column header SHALL have a name.
- Theme-selector buttons SHALL expose `aria-pressed` reflecting the active theme.

## REQ-820-07 — Focus and navigation management

- On `#/` ↔ `#/admin` route changes, `document.title` SHALL update and focus SHALL move to the screen `h1`.
- After an admin action re-renders the view, focus SHALL be restored predictably (move to the screen `h1`); status notices SHALL keep `role="status"`.
- All interactive elements SHALL have a visible `:focus-visible` indicator in every theme.

## REQ-820-08 — Contrast

Text SHALL meet ≥4.5:1 contrast (≥3:1 for large/decorative). Muted text (`--muted` usages, admin labels, `.admin-back`, `.admin-theme-note`) SHALL be lightened to comply.

## REQ-820-09 — Accessible names for glyphs

Position deltas SHALL have accessible names: `▲N` → "sube N", `▼N` → "baja N", `—` → "sin cambio", `NEW` badge → "nuevo" (or a text equivalent inside the user cell).

## REQ-820-10 — Session screens stay trap-free (experience app)

`login`, `experience-select`, and `instructions` SHALL contain no `data-trap` attributes and SHALL keep real labels, live error announcements, landmark/heading structure, and working keyboard operation. Faro purchase-flow screens are explicitly excluded — their intentional traps are preserved.

## Scenarios

### Scenario 1 — Screen reader reads the ranking

**Given** the kiosk presentation is showing a ranking
**When** a screen reader reaches the board
**Then** it announces a list of N entries and each row as "position, user, time".

### Scenario 2 — New record announced

**Given** the kiosk is polling
**When** a new best time arrives
**Then** the NEW RECORD banner is announced via its live region.

### Scenario 3 — Operator pauses rotation

**Given** two or more experiences configured
**When** the operator presses the pause button (keyboard)
**Then** rotation stops, `aria-pressed` reflects the state, and polling continues.

### Scenario 4 — Admin with keyboard only

**Given** the admin PIN is entered
**When** the operator tabs through the view
**Then** every field and button is reachable, labelled, and shows a focus ring; after add/edit/delete/reset the focus returns to the screen title and the outcome is announced.

### Scenario 5 — Session screens regression

**Given** login, experience-select and instructions render
**When** inspected
**Then** no `data-trap` exists and all controls are labelled and keyboard-operable.

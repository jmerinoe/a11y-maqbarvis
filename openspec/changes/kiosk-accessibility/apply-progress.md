# Apply progress: Kiosk accessibility + trap-free session screens

## Status: Complete

## What was applied

### `apps/kiosk/src/presentation.js`
- Ranking rows are `<li class="k-row">` inside `<ol class="k-col">` columns; column 2 gets `start` so numbering stays implicit and correct.
- Hidden `<p class="sr-status sr-only" role="status">` announces board changes, empty and offline states (deduplicated — no re-announce on each 15 s poll).
- `.record-banner` carries `role="status"` — NEW RECORD is announced.
- Delta spans get `aria-label` ("sube N" / "baja N" / "sin cambio"); NEW badge gets `aria-label="nuevo"`.
- `canAnimate` now also checks `prefers-reduced-motion` — FLIP/entrance/exit animations skipped for reduced-motion users.
- New footer pause button `#k-rotate-toggle` (`aria-pressed`, "Pausar rotación"/"Reanudar rotación") — pauses only rotation; polling continues. `startPresentation` respects the paused state.
- `.kiosk-title` gets `tabindex="-1"` and receives focus on mount (post-navigation announcement).

### `apps/kiosk/src/main.js`
- `document.title` set per route (`Ranking — Kiosko` / `Administración — Kiosko`).

### `apps/kiosk/src/admin.js`
- `sr-only` `<label for>` on every add-form control (participant, experience select, new-experience id, time with MM:SS described in the label) and on the inline edit form; edit form autofocuses its first field.
- PIN error region is always present (`role="alert"`, referenced via `aria-describedby`); input gets `aria-invalid` on error.
- Results table: `scope="col"` on all headers; actions column named "Acciones"; row buttons get per-record `aria-label`s.
- Theme buttons expose `aria-pressed`; group labelled `role="group"`.
- After every re-render, focus returns to the screen `h1` (`tabindex="-1"`).

### `apps/kiosk/src/styles.css`
- `.sr-only` utility; global `:focus-visible` outline for kiosk interactive elements.
- `.k-col` list reset (`list-style: none; margin/padding: 0`) — the `<ol>` styling change is invisible visually.
- `.k-rotate-btn` footer styling.
- `--muted` lightened `#5a6b8c` → `#93a5c7` (≥4.5:1 on dark bg); same fix applied to hardcoded admin colors (`label`, `.admin-back`, `.admin-table th`, `.admin-theme-note`).

### Experience app — REQ-820-10 regression
- `panel-branding.test.js` extended: login label + `role="alert"` + `aria-describedby`; experience links have text; instructions labelled sections + `dl` mission card. No code changes needed — the screens were already trap-free.

### Tests
- New `apps/kiosk/src/tests/kiosk-a11y.test.js` — 9 cases covering REQ-820-01…09.

## Verification results

| Check | Result |
|-------|--------|
| `npm test` (kiosk) | 13 tests, 2 files — all pass |
| `npm run build` (kiosk) | OK |
| `npm test` (experience) | 106 tests, 16 files — all pass |

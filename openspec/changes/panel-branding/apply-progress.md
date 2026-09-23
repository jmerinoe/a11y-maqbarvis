# Apply progress: Panel branding on session screens

## Status: Complete

## What was applied

### Assets and shared chrome
- `public/images/panel-logo.jpg` — Panel logo asset.
- `src/components/panel-shell.js` — `panelShell(innerHtml)` wrapper: `.panel-shell` div + `.panel-logo` `<img>` (localized `alt` via `panel.logoAlt`) + caller's `<main class="panel-screen">`.
- `src/i18n/es.js`, `src/i18n/en.js` — `panel.logoAlt` key (parity enforced by `i18n.test.js`).

### Visual system (`src/styles/main.css`)
- `.panel-shell` — full-viewport white shell; light-blue rings via `::before`/`::after` pseudo-elements (thick `border` + `border-radius: 50%`, `pointer-events: none`, decorative-only).
- `.panel-logo` — absolute top-right, ~9rem wide.
- `.panel-screen` — clean centered column (`max-width: 560px`), no card chrome.
- Panel-cyan accents scoped to `.panel-shell`: `.btn-primary` `#007a99` (≥4.5:1 on white — the raw logo cyan `#00a9ce` fails contrast), hover `#00617a`; links `#007a99`; `.experience-list a:hover` `#e8f7fc`.
- `.session-screen` / `.ranking-screen` dashed-card rules removed (no remaining consumers).

### Screens
All four wrap their `<main class="panel-screen">` in `panelShell(...)`:
`login.js`, `experience-select.js`, `instructions.js`, `ranking.js`.

### Tests
`src/tests/panel-branding.test.js` — 18 cases: shell+logo+alt on each screen, content inside `main.panel-screen`, no `data-trap`, logo non-focusable, Faro flow unbranded.

## Tasks status

All tasks in `tasks.md` completed: T1.1–T4.4. `npm test` 92/92, `npm run build` OK.

## Verification results

| Check | Result |
|-------|--------|
| `npm test` | 92 tests, 14 files — all pass |
| `npm run build` | OK |
| Logo present | `.panel-logo` `<img src="/images/panel-logo.jpg" alt="Panel">` on all four screens |
| Rings | CSS pseudo-elements, decorative, `pointer-events: none` |
| Accessibility | `alt` set, logo non-focusable, no `data-trap`, focus-visible preserved |
| Out of scope | Timer badge, congrats dialog, Faro chrome untouched |

# Tasks: Panel branding on session screens

## Milestone 1: Assets and shared chrome

- [x] T1.1 Copy `panel-logo.jpg` to `public/images/`.
- [x] T1.2 Create `src/components/panel-shell.js` — `panelShell(innerHtml)` wrapper: `.panel-shell` > `.panel-logo` img + `.panel-screen` main.
- [x] T1.3 `src/i18n/es.js` + `src/i18n/en.js` — `panel.logoAlt` key.

## Milestone 2: Panel visual system

- [x] T2.1 `src/styles/main.css` — `.panel-shell` (white, full-viewport, CSS `radial-gradient` rings anchored right), `.panel-logo` (absolute top-right), `.panel-screen` (clean centered column, no dashed card).
- [x] T2.2 Accent overrides scoped to `.panel-shell`: Panel-cyan `.btn-primary` and links; verify focus-visible and contrast.
- [x] T2.3 Remove obsolete `.session-screen` / `.ranking-screen` rules.

## Milestone 3: Apply to the four screens

- [x] T3.1 `login.js` — wrap markup in `panelShell()`.
- [x] T3.2 `experience-select.js` — wrap markup in `panelShell()`.
- [x] T3.3 `instructions.js` — wrap markup in `panelShell()`.
- [x] T3.4 `ranking.js` — wrap markup in `panelShell()`.

## Milestone 4: Tests and docs

- [x] T4.1 Create `src/tests/panel-branding.test.js` (logo + shell on all four screens, no `data-trap`).
- [x] T4.2 `npm test` — all pass (existing session-flow tests unaffected).
- [x] T4.3 `npm run build` — clean.
- [x] T4.4 Write `apply-progress.md` and `verify-report.md`; manual visual check in dev.

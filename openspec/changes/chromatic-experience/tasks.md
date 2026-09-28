# Tasks: Experiencia cromática

## M1 — Directory reorganization (no behavior change)

- [x] T1.1 Move Faro screens/components/data/traps/moderator under `src/experiences/screen-reader/`; fix all imports (incl. tests + index.html)
- [x] T1.2 Shared store keeps app state (route/language/moderator/cart/tramos); dispatcher resolves experience screens
- [x] T1.3 Full test suite + build green after the move (120/120)

## M2 — Metro data & logic

- [x] T2.1 `experiences/chromatic/data/metro.js`: L4/L6/L8/L10/L12 with official station lists, statuses, multipliers, circular flags
- [x] T2.2 `tramoMinutes`/`stopsBetween`/`tramoOptions` (shortest arc on circles; per-line options + line geometry `shape`/`ring`)
- [x] T2.3 `optimalRouteMinutes` (Dijkstra, interrupted edges excluded) + `routeConnects`/`routeMinutes`
- [x] T2.4 Copy plano PDF to `apps/experience/public/metro/plano-metro.pdf`

## M3 — Chromatic UI

- [x] T3.1 `chromatic` registry entry + instructions content (ES/EN) + `homeRoute: '#/metro'` + generic `missionCard`
- [x] T3.2 Metro screen: header, interactive schematic map (`metro-map.js`, clickable stations incl. keyboard), legend, tramo list with × removal, total, Comprobar, plano PDF link
- [x] T3.3 Popups: different-lines, interrupted, faster-exists, route-invalid, line-choice modal (`metro-dialog.js`, accessible)
- [x] T3.4 Grayscale scope (`.chromatic-scope { filter: grayscale(1) }`) + monochrome palette (`metro.css`)
- [x] T3.5 Route validation → shared completion (congrats → ranking); `#/metro` route + session guard + `sessionHome()` in router

## M4 — Verification & docs

- [x] T4.1 `chromatic.test.js`: 18 cases — data integrity, tramo calc/options, optimum, map clicks, tramo removal, line-choice modal, validation branches, grayscale scope, instructions → `#/metro`
- [x] T4.2 Full suite + build green: experience 138/138; kiosk untouched
- [x] T4.3 `apply-progress.md` + `verify-report.md`

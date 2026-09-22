# Apply progress: User identification, experience selection, and purchase-flow timing

## Status: Complete

## What was applied

### Data and session layer
- `src/data/experiences.js`: registry with the `screen-reader` experience (localized name/instructions, `requiredItem {p001, M, blue}`), `getExperienceById`, `isRequiredItem`, `isCompletedOrder` (exactly one matching line item — extras invalidate, per owner).
- `src/session/session.js`: `registerUser` (normalize: trim + whitespace collapse + case-insensitive uniqueness vs `localStorage['faro-users']`), session get/set/clear + `markTimerStarted` (`sessionStorage['faro-session']`), `saveResult`/`getRanking` (`localStorage['faro-results']`, elapsedMs → endedAt → user, top 10), `formatElapsed`.

### Components
- `src/components/experience-timer.js`: `mountExperienceTimer(startedAt)` appends `#experience-timer` to `document.body` (outside `#app` — survives screen re-renders); `role="timer"` + `aria-label`; ~250ms interval recomputing from the timestamp; `stopExperienceTimer()` removes it.
- `src/components/congrats-dialog.js`: `role="dialog"` + `aria-modal` + `aria-labelledby`, focus moved to dialog on open, close button + Escape, focus restore, close navigates to `#/ranking`.

### Screens (all accessible, no traps)
- `login.js` — `<label for>` field, `role="alert"` associated error, normalized uniqueness.
- `experience-select.js` — registry-driven link list → sets `experienceId`.
- `instructions.js` — task + timer notice; Continuar starts timer + `#/home` (no start on render).
- `ranking.js` — top-10 table + "Nuevo participante" → `clearSession()` + `#/login`.

### Integration
- `router.js`: new routes; entry `#/login` (no session) / `#/home`; session guard on Faro routes; timer remount on init.
- `screens/index.js`: new renderers registered; fallback → login.
- `checkout.js`: on order success with active timed session + `isCompletedOrder` → `stopExperienceTimer`, `saveResult`, `faro-pending-congrats` flag.
- `confirmation.js`: pending flag → congrats dialog → `#/ranking`.
- `i18n es/en`: 17 new keys each (parity enforced by `i18n.test.js`).
- `main.css`: session screens, timer badge (dark monospace "external instrumentation"), congrats dialog, ranking table.

## Tasks status

All tasks in `tasks.md` completed: T1.1–T6.3. `npm test` 75/75, `npm run build` OK.

## Verification results

| Check | Result |
|-------|--------|
| `npm test` | 75 tests, 13 files — all pass |
| `npm run build` | OK |
| Username uniqueness | Normalized (trim + case-insensitive); duplicates blocked with announced error |
| Timer start | Only on Continuar — not on instructions render |
| Timer persistence | On `document.body`, survives `#app` rewrites; restored on reload via `sessionStorage` |
| Completion | Exactly `{p001, M, blue}` — wrong variant or extra items don't complete |
| Congrats dialog | `role="dialog"` + `aria-modal` + focus management; close → `#/ranking` |
| Ranking | Asc, deterministic ties, top 10, "Nuevo participante" resets session |
| Session guard | Faro routes without session → `#/login` |

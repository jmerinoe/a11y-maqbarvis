# Tasks: User identification, experience selection, and purchase-flow timing

Implementation checklist. Tasks are ordered by dependency. Check off items as they are completed during the apply phase.

## Milestone 1: Data and session layer

- [x] T1.1 `src/data/experiences.js` — registry with `screen-reader` experience (localized name/instructions, `requiredItem: {productId:'p001', size:'M', color:'blue'}`), `getExperienceById`, `isRequiredItem`.
- [x] T1.2 `src/session/session.js` — `registerUser` (normalize: trim + whitespace collapse + case-insensitive uniqueness; `localStorage['faro-users']`), `getSession`/`setSession`/`clearSession` (`sessionStorage['faro-session']`), `saveResult`/`getRanking` (`localStorage['faro-results']`, elapsedMs asc → endedAt asc → user, top 10).

## Milestone 2: Timer overlay and congrats dialog

- [x] T2.1 `src/components/experience-timer.js` — `mountTimer(startedAt)`/`stopTimer()`; node appended to `document.body`, `role="timer"`, `aria-label`, ~250ms interval computing `Date.now()-startedAt`, `MM:SS` display.
- [x] T2.2 `src/components/congrats-dialog.js` — `role="dialog"` + `aria-modal` + `aria-labelledby`, focus on open, close button + Escape, focus restore; close navigates to `#/ranking`.
- [x] T2.3 `src/styles/main.css` — timer overlay (fixed top-right, external-instrumentation look), session screens, dialog, ranking table styles.

## Milestone 3: New screens

- [x] T3.1 `src/screens/login.js` — titled field + `<label for>` + continue; empty/duplicate errors via `role="alert"` + `aria-describedby`; success → session + `#/experiences`.
- [x] T3.2 `src/screens/experience-select.js` — registry-driven selectable list → sets `experienceId` → `#/instructions`.
- [x] T3.3 `src/screens/instructions.js` — task text + timer notice; Continuar → `startExperienceTimer()` + `#/home`.
- [x] T3.4 `src/screens/ranking.js` — top-10 table for current experience + "Nueva experiencia" → `clearSession()` + `#/login`.

## Milestone 4: Integration

- [x] T4.1 `src/router.js` — routes `#/login`, `#/experiences`, `#/instructions`, `#/ranking`; entry → `#/login` (no session) or `#/home`; session guard on Faro routes; remount timer on init if session active.
- [x] T4.2 `src/screens/index.js` — register new renderers.
- [x] T4.3 `src/screens/checkout.js` — on order success with active session + required item: `stopExperienceTimer()`, `saveResult`, set `faro-pending-congrats`.
- [x] T4.4 `src/screens/confirmation.js` — if pending flag, open congrats dialog; close → `#/ranking`.
- [x] T4.5 `src/i18n/es.js`, `src/i18n/en.js` — all new keys (parity enforced by `i18n.test.js`).

## Milestone 5: Tests

- [x] T5.1 Create `src/tests/user-experience-timer.test.js` with the 8 cases from design §10.
- [x] T5.2 Run `npm test` — all tests pass.

## Milestone 6: Documentation and final verification

- [x] T6.1 Write `apply-progress.md` and `verify-report.md`.
- [x] T6.2 Run `npm run build` and `npm test` — clean.
- [x] T6.3 Manual in dev: full flow login → experience → instructions → home → purchase → congrats → ranking; timer visible across navigation; duplicate user rejected; reload mid-experience restores timer.

## Notes

- The timer overlay lives on `document.body` — every screen rewrites `#app.innerHTML`, so in-screen timers would be destroyed on navigation.
- Completion is detected at order creation (checkout success), not on confirmation render — the flag `faro-pending-congrats` carries it to the confirmation screen.
- localStorage for users/results (persists across restarts on the demo machine); sessionStorage for the active session (per-tab, survives reload).
- New screens must stay trap-free — they are the "correct" instrumentation contrast.

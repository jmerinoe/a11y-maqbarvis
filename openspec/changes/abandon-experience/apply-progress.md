# Apply progress: Give up — abandon a run and rank it as DNF

## Status: implemented

| Area | Files | Notes |
|------|-------|-------|
| Give-up control | `apps/experience/src/components/experience-timer.js` | `#give-up-btn` mounts/unmounts with the session timer — present on every screen while a run is live |
| Dialogs + flow | `apps/experience/src/components/abandon-dialog.js` (new) | `requestAbandon()` → confirm dialog → `finalizeAbandon()`: stop timer, `submitResult(result: 'abandoned')` (first outcome only), session `abandoned` + `completedAt`, closing dialog → `#/ranking` |
| Data layer | `apps/experience/src/session/session.js` | `getRanking` includes `result === 'abandoned'`, sorted after all completed (elapsed → endedAt → user) |
| API | `api/src/functions/public.js` | `POST /api/results` validates `result` ∈ {completed, abandoned}, defaults completed; `GET /api/ranking` includes DNF at the tail and returns `result` per row |
| Ranking screen | `apps/experience/src/screens/ranking.js` | `ranking-dnf` row class + `DNF` badge + sr-only cue; composes with `ranking-self` |
| i18n | `src/i18n/es.js`, `src/i18n/en.js` | `giveup.*` keys (button, confirm, final dialog) + `ranking.dnfLabel` |
| Styles | `apps/experience/src/styles/main.css` | `#give-up-btn` (dark instrumentation badge under the timer), `.ranking-dnf` dimmed row, `.ranking-dnf-badge` chip |
| Completion guards | `checkout.js`, `metro.js`, `booking.js` | Submit only when `baselineMs == null && !session.abandoned`; checkout also skips `faro-pending-baseline` when no baseline exists (prevents a NaN diff on post-DNF replays) |
| Kiosk board | `apps/kiosk/src/presentation.js`, `styles.css` | `.k-row.dnf` dimmed + `DNF` badge in the user cell |
| Kiosk admin | `apps/kiosk/src/admin.js`, `styles.css` | `admin-dnf` chip in the records table |
| Tests | `src/tests/abandon-experience.test.js` (new), `kiosk.test.js`, `api/tests/table.test.js` | Button lifecycle, confirm/cancel, DNF record shape, ordering, marks, no resubmit, kiosk badge, `result` persistence |

## Behavior

- "Me rindo" is a fixed dark badge under the timer, visible on every experience screen (BLIND BUY included — sighted moderators can press it; blindfolded participants reach it by Tab/SR).
- Confirmation required: cancel/Escape resumes the run untouched; confirm stops the timer and records `result: 'abandoned'` with the elapsed time.
- Closing dialog shows "Lo sentimos, no has completado la experiencia" + elapsed time + "Ver ranking" → `#/ranking`.
- Abandoned runs rank after every completed run, ordered by elapsed time; they show real positions and a DNF mark in the app and on the kiosk board.
- Once a session has a recorded outcome (completed or abandoned), replays never resubmit — the standing record stays.
- Offline path unchanged: abandoned results persist locally and queue for API retry like any result.

# Tasks: Give up — abandon a run and rank it as DNF

## M1 — Data layer

- [x] T1.1 `getRanking` includes `result === 'abandoned'`, sorted after all completed (elapsed → endedAt → user)
- [x] T1.2 API `POST /api/results` accepts `result` ∈ {completed, abandoned}, rejects other values, defaults to completed
- [x] T1.3 API `GET /api/ranking` includes abandoned at the tail and returns `result` per row
- [x] T1.4 `requestAbandon()` / `finalizeAbandon()`: stop timer, submit `result: 'abandoned'` (first outcome only), mark session `abandoned` + `completedAt`

## M2 — Experience app UI

- [x] T2.1 `experience-timer.js` mounts/removes `#give-up-btn` next to the timer
- [x] T2.2 `abandon-dialog.js`: confirmation dialog + abandoned dialog (accessible pattern, i18n)
- [x] T2.3 `ranking.js`: `ranking-dnf` row + `DNF` badge + sr-only cue; composes with `ranking-self`
- [x] T2.4 i18n `giveup.*` / `ranking.dnfLabel` keys (es + en); CSS for `#give-up-btn`, `.ranking-dnf`, `.ranking-dnf-badge`
- [x] T2.5 `!session.abandoned` guard in the three completion paths (checkout, metro, booking)

## M3 — Kiosk

- [x] T3.1 `presentation.js` `updateRow`: `.dnf` row class + `DNF` badge for `result === 'abandoned'`
- [x] T3.2 `styles.css`: `.k-row.dnf` dimmed + `.k-dnf` badge
- [x] T3.3 `admin.js`: DNF chip in the records table

## M4 — Verification & docs

- [x] T4.1 `abandon-experience.test.js`: ordering, abandon flow (confirm/cancel), no resubmit on retry, dialogs, button lifecycle
- [x] T4.2 Ranking render tests: DNF mark, window anchoring on a DNF record, `ranking-self` combination
- [x] T4.3 Kiosk test: DNF badge rendering
- [x] T4.4 API tests: `result` validation + ranking ordering/payload
- [x] T4.5 `npm test` + `npm run build` green across the three workspaces
- [x] T4.6 `apply-progress.md` + `verify-report.md`

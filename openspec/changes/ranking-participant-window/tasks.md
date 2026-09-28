# Tasks: Ranking window centered on the participant

## M1 — Data layer

- [x] T1.1 `getRanking`/`fetchRanking` accept `{ all }` option (session.js)
- [x] T1.2 `rankingWindow(sorted, user)` pure helper with the documented clamp rules
- [x] T1.3 API `ranking` handler honors `all=1` (default response unchanged)

## M2 — Presentation

- [x] T2.1 `ranking.js` fetches full list, applies `rankingWindow`, renders real positions
- [x] T2.2 `ranking-self` class + sr-only cue on participant rows; i18n key `ranking.you`
- [x] T2.3 `.ranking-self` styles (Panel accent, subtle)

## M3 — Verification & docs

- [x] T3.1 Unit tests for `rankingWindow` (all branches + edge cases)
- [x] T3.2 Render tests: mid/top/bottom participant, no-session fallback, highlight + sr cue
- [x] T3.3 `npm test` + `npm run build` green in `apps/experience`; kiosk tests still green
- [x] T3.4 `apply-progress.md` + `verify-report.md`

# Apply progress: Ranking window centered on the participant

## Status: implemented

| Area | Files | Notes |
|------|-------|-------|
| Data layer | `apps/experience/src/session/session.js` | `getRanking`/`fetchRanking` take `{ limit, all }`; new `rankingWindow(sorted, user)` returning `{ rows, offset }` |
| API | `api/src/functions/public.js` | `all=1` returns the full sorted ranking; without it, identical top-20 payload (kiosk untouched) |
| API client | `apps/experience/src/api/client.js` | `apiFetchRanking(experienceId, all)` builds the query with `URLSearchParams` |
| Screen | `apps/experience/src/screens/ranking.js` | Fetches full list, applies the window, renders real positions, `ranking-self` + sr-only cue |
| i18n | `src/i18n/es.js`, `src/i18n/en.js` | `ranking.you`: "— tu posición" / "— your position" |
| Styles | `src/styles/main.css` | `.ranking-self` (celeste bg + cyan inset border), `.sr-only` utility |
| Tests | `src/tests/ranking-window.test.js` | 7 cases: pure helper + render for every branch |

## Behavior

- Participant's best run anchors the window: `rank-4 … rank+5`; rank ≤ 10 → rows 1–10; rank in bottom-10 → last 10; ≤10 total → all.
- Position column shows real ranks; every self row in the window is highlighted and carries a screen-reader-only "tu posición" cue.
- No session → empty state (unchanged); session without completed runs → top-10 (unchanged).
- Kiosk code, kiosk API client, and the default `/api/ranking` response are untouched.

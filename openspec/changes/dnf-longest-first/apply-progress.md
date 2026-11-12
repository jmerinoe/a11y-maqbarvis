# Apply progress: DNF ordering — longest survival first

## M1 — Comparators ✅

- `apps/experience/src/session/session.js` — `getRanking`: elapsed term now direction-aware (`b.elapsedMs - a.elapsedMs` for abandoned rows). Comment updated.
- `api/src/functions/public.js` — `/api/ranking` handler: identical term applied; comment updated.

## M2 — Tests & docs ✅

- `abandon-experience.test.js` — DNF ordering case renamed and flipped: expects `DNF-slow` (90s) before `DNF-fast` (30s), both after completed runs.
- Suite: 23 files / 213 tests — all green.
- This file + `verify-report.md`.

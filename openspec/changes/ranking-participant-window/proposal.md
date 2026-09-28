# Proposal: Ranking window centered on the participant

## Why

Today `#/ranking` always shows the global top-10. Once a participant finishes the mission they cannot see *their* position unless they made the top-10 — for a workshop ranking with many runs, most participants would never find themselves.

The ranking SHALL instead show the participant's own position: a 10-row window with the 4 participants ranked immediately above them and the 5 ranked immediately below, clamped at both ends (top-10 → first 10; bottom-10 → last 10).

## What Changes

### Scope

1. **Ranking window logic** — new pure helper (e.g. `rankingWindow(ranking, user)`): given the full sorted ranking and the participant, returns the 10-row slice containing their position:
   - Participant rank ≤ 10 → rows 1–10.
   - Participant in the last 10 positions → last 10 rows.
   - Otherwise → rows `rank-4` … `rank+5` (4 above + participant + 5 below).
   - Participant unknown / no completed run / no session → current behavior (top-10).
2. **Real positions** — the position column SHALL show each row's real rank (not re-indexed 1–10).
3. **Participant row highlighted** — the participant's own row(s) get a distinct visual treatment (CSS class + accessible cue).
4. **Anchor on best run** — if a participant has multiple completed runs, the window is centered on their best-ranked run (the one that defines their standing).
5. **API: full ranking on demand** — `GET /api/ranking` gains an optional `all=1` param returning the complete sorted list. Without the param the response is **unchanged** (top-20 for the kiosk — kiosk behavior untouched).
6. **Local mode parity** — `getRanking` gains an `all` option so the same window logic works offline.

### Out of scope

- **Kiosk**: no changes to kiosk code, its API usage, or its top-20 response shape.
- No changes to how results are recorded, the congrats/failed dialogs, or "Nuevo participante".
- No changes to Faro screens or traps.

## How

### Architecture approach

- `src/session/session.js` — `getRanking(experienceId, { all })` and `fetchRanking(experienceId, { all })`; the API path passes `all=1`. New `rankingWindow(sortedList, user)` pure function returning `{ rows, selfRanks }` or the plain top-10 when the user isn't found.
- `api/src/functions/public.js` — `ranking` handler: when `all=1` skip the `.slice(0, 20)` cap; everything else identical.
- `src/screens/ranking.js` — fetch the full ranking, compute the window for `session.user`, render real positions; add `ranking-self` class on the participant's row(s); visually distinct but subtle (Panel accent, not loud).
- `src/styles/main.css` — `.ranking-self` highlight.
- `src/i18n/{es,en}.js` — accessible label for the self row (e.g. "tu posición").

### Window algorithm

```
N = ranking.length
if (!anchor || N <= 10) → first 10
rank = index of participant's best run + 1
if (rank <= 10)    → rows 1..10
if (rank > N - 10) → rows N-9..N
else               → rows rank-4..rank+5
```

### Testing strategy

Extend `user-experience-timer.test.js` (or a dedicated `ranking-window.test.js`) covering: top-10 participant → first 10; bottom-10 participant → last 10; mid participant → 4 above + 5 below with real positions; user with several runs anchors on best; no session / no run → top-10; self row highlighted; ≤10 total → all rows. Local-path tests (API disabled) suffice — window logic is shared.

### Delivery

Single commit. ~6 files + tests + openspec docs.

## Assumptions

- "Posición del usuario" = their **best** completed run when they have several — the ranking lists runs, and the best one defines their standing.
- Every row of that participant inside the window is highlighted, not just the anchor.
- With no session or no completed run for that user, the screen keeps today's behavior (top-10) — e.g. revisiting `#/ranking` directly.
- The API change is additive and opt-in: kiosk calls `/api/ranking` without `all` and keeps receiving exactly the same top-20 payload.
- Highlight styling: subtle Panel-accent row background — readable, no motion.

## Risks

| Risk | Mitigation |
|------|------------|
| Full ranking payload grows with many runs | Results are small JSON records; workshop scale is tens/hundreds — acceptable |
| Kiosk accidentally affected by API change | `all` is opt-in; default path byte-identical |
| Anchor ambiguity (same user, several runs) | Deterministic: best run anchors the window; all their rows highlighted |
| Participant opens `#/ranking` without finishing | Falls back to top-10 (no completed run for them) |

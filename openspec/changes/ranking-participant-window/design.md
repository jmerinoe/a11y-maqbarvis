# Design: Ranking window centered on the participant

## Current state

- `renderRanking` (`src/screens/ranking.js`) calls `fetchRanking(experienceId)` → top-10 (API) or `getRanking` local → renders a `<table>` with positions computed as `i + 1`.
- `fetchRanking` → `GET /api/ranking?experienceId=X`; the API sorts and `.slice(0, 20)` — the kiosk consumes this payload for its two-column board.
- `getRanking(experienceId, limit = 10)` sorts `faro-results` (completed only) asc by `elapsedMs`, `endedAt`, `user` and slices.
- The session is still active when the ranking renders (cleared only by "Nuevo participante" or by reaching `#/login`), so `session.user` identifies the participant.

## Changes by file

### `apps/experience/src/session/session.js`

- `getRanking(experienceId, { limit = 10, all = false } = {})` — `all` skips the slice.
- `fetchRanking(experienceId, { all = false } = {})` — local path passes `all` through; API path appends `&all=1` to the query and does not slice the response when `all`.
- New pure helper:
  ```js
  // Sorted full list + username → window of 10 centered on their best run.
  export function rankingWindow(sorted, user) {
    const n = sorted.length;
    const selfIdx = sorted.map((r, i) => (r.user === user ? i : -1)).filter((i) => i >= 0);
    if (n <= 10 || selfIdx.length === 0) return { rows: sorted.slice(0, 10), offset: 0 };
    const rank = selfIdx[0] + 1; // best run anchors the window
    let start = rank - 4;        // 4 above
    if (rank <= 10) start = 1;
    else if (rank > n - 10) start = n - 9;
    return { rows: sorted.slice(start - 1, start + 9), offset: start - 1 };
  }
  ```
  Note user-name comparison: stored `record.user` is the trimmed display name — session stores the same value, so equality holds.

### `api/src/functions/public.js`

- In the `ranking` handler, read `request.query.get('all')`; apply `.slice(0, 20)` only when `all` is absent/false. Comment updated: the cap exists for the kiosk board.

### `apps/experience/src/screens/ranking.js`

- Fetch `fetchRanking(experience.id, { all: true })`, then `rankingWindow(list, session?.user)`.
- Render `offset + i + 1` as the position.
- Rows whose `r.user === session.user` get `class="ranking-self"`; add `<span class="sr-only">` "— tu posición" (i18n key `ranking.you`) inside the user cell for screen readers.

### `apps/experience/src/styles/main.css`

- `.ranking-self` — Panel accent: `background: #e8f7fc; font-weight: 600` on the row cells; subtle left border via `box-shadow: inset 3px 0 0 #007a99` on the first cell.

### `src/i18n/{es,en}.js`

- `ranking.you`: '— tu posición' / '— your position'.

## Accessibility

- The table keeps `scope`-less but simple structure already in place; real positions keep semantics meaningful ("puesto 37").
- The self highlight is conveyed non-visually via the sr-only suffix, since color alone cannot carry it.

## Edge cases

| Case | Result |
|------|--------|
| ≤ 10 total runs | All rows, positions 1..N |
| No session / user not in ranking | Top-10 (unchanged) |
| Rank 10 | Top-10 shown (per owner rule) |
| Rank 11, N ≥ 21 | Rows 7–16, participant 5th |
| Rank = N-9 | Rows N-9..N (bottom-10, participant first) |
| Several runs by same user | Window anchors on the best; all their rows highlighted |

## Test plan

`src/tests/ranking-window.test.js` (new) or extend `user-experience-timer.test.js`:
- unit cases on `rankingWindow` for each branch;
- `renderRanking` with a mid-ranked participant: 10 rows, real positions, self row has `ranking-self` and the sr-only cue;
- top-10 participant → positions 1..10;
- bottom participant → last 10;
- no session → top-10.

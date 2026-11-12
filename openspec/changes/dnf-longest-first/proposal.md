# Proposal: DNF ordering — longest survival first

## Why

Abandoned (DNF) runs currently rank after all completed runs and, among themselves, by elapsed time **ascending** — the participant who gave up earliest ranks first among DNFs. The owner wants the opposite recognition: someone who struggled for 9 minutes before giving up deserves to sit above someone who bailed at 30 seconds. DNFs keep ranking after every completed run; only their internal order flips to descending elapsed time.

## What Changes

### Scope

1. **DNF intra-order inverted** — abandoned rows sort by `elapsedMs` **descending** (longest time before abandoning first). Completed ordering is untouched.
2. **Both sort paths** — `getRanking` (local/session.js) and `GET /api/ranking` (api/src/functions/public.js) apply the same rule; the kiosk and the app ranking inherit it automatically since they display server/local order.
3. **Tie-breakers** — within equal `elapsedMs`, keep `endedAt` asc then `user`.

### Out of scope

- Completed-run ordering (appointment → routeMinutes → elapsed → end → user).
- DNF position after completions, badge, dimmed styling, kiosk presentation — all unchanged.

## How

In both comparators the `elapsedMs` term becomes direction-aware:

```js
dnfWeight(a) - dnfWeight(b) ||
appointmentAt asc || routeMinutes asc ||
(a.result === 'abandoned' ? b.elapsedMs - a.elapsedMs : a.elapsedMs - b.elapsedMs) ||
endedAt asc || user asc
```

`dnfWeight` runs first, so inside the elapsed term both rows are always of the same kind — reading `a.result` is enough to pick the direction.

## Test plan

- Update `abandon-experience.test.js` — the DNF ordering case now expects `DNF-slow` before `DNF-fast`.
- No API test changes needed (persistence-only coverage); the app tests exercise the shared rule.

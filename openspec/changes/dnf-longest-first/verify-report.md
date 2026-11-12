# Verify report: DNF ordering — longest survival first

## Requirements coverage

| Req | Status | Evidence |
|---|---|---|
| REQ-950-01 DNF after completions | ✅ | `dnfWeight` term unchanged — abandoned rows rank last |
| REQ-950-02 DNF intra-order desc | ✅ | Direction-aware elapsed term in both comparators; test asserts `DNF-slow` before `DNF-fast` |
| REQ-950-03 Completed order unchanged | ✅ | Same comparator terms before elapsed; direction only flips for `result === 'abandoned'` pairs |
| REQ-950-04 Local/API parity | ✅ | Identical comparator applied in `session.js` and `public.js`; kiosk inherits API order |

## Test run

- `apps/experience`: **23 files / 213 tests — all green** (vitest, jsdom).

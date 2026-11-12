# Verify report: COLOR TRAP — progressive route hints every 3 minutes

## Requirements coverage

| Req | Status | Evidence |
|---|---|---|
| REQ-970-01 Schedule 3/6/9/12/15/18 min | ✅ | `armRouteHint` targets `(hintCount+1) × 180000`; immediate fire when past; tests cover immediate, mid-screen and catch-up cases |
| REQ-970-02 Legs from live graph | ✅ | `optimalRouteLegs` — same Dijkstra/graph as `optimalRouteMinutes`; test asserts the exact 6-leg 50-min sequence |
| REQ-970-03 Dialog pattern | ✅ | `congrats-overlay chromatic-scope` + `congrats-dialog metro-dialog`, `role="dialog"`, labelled title, leg in `<strong>`, focus save/restore, Escape |
| REQ-970-04 Ordered, once each, persisted | ✅ | `hintCount` on session; test verifies leg 2 after 1 shown, no repeats, stops at 6 |
| REQ-970-05 Non-interference | ✅ | No timer pause, no tramo mutation; eligibility blocks replay/completed; 15 s defer while another overlay is open |

## Test run

- `apps/experience`: **23 files / 227 tests — all green** (vitest, jsdom; 8 new cases).

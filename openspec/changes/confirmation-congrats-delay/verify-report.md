# Verify report: BLIND BUY — delay the congrats dialog ~5 seconds

## Requirements coverage

| Req | Status | Evidence |
|---|---|---|
| REQ-1000-01 Delayed congrats | ✅ | `confirmation.js` wraps `showCongratsDialog` in `setTimeout(…, 5000)`; test asserts dialog absent at 0 s and present at 5 s |
| REQ-1000-02 Navigation guard | ✅ | Guard checks `!document.querySelector('.confirmation')` and `document.querySelector('[role="dialog"]')`; test clears `#app` and confirms no dialog |
| REQ-1000-03 No stacking | ✅ | `clearTimeout(congratsTimer)` before each schedule; test injects a `[role="dialog"]` and confirms congrats does not stack |
| REQ-1000-04 Mission-failed unchanged | ✅ | `faro-pending-failed` branch untouched — synchronous `showMissionFailedDialog()` |

## Test run

- `apps/experience`: **24 files / 234 tests — all green** (vitest, jsdom; 2 new cases, 3 updated).

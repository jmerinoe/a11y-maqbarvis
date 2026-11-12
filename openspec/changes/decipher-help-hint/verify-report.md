# Verify report: DECIPHER MODE — six-minute help hint

## Requirements coverage

| Req | Status | Evidence |
|---|---|---|
| REQ-960-01 Timed trigger | ✅ | `armHelpHint` fires immediately past 6 min or via `setTimeout`; armed on every hospital screen via `bindHospitalNav` |
| REQ-960-02 Dialog pattern | ✅ | `congrats-overlay` + `congrats-dialog metro-dialog`, `role="dialog"`, `aria-modal`, labelled title, `ALGIA` in `<strong>`, `hint.ok` button, focus save/restore, Escape |
| REQ-960-03 Once per run | ✅ | `hintShown` persisted via `setSession`; test re-renders a second screen with no re-fire |
| REQ-960-04 Non-interference | ✅ | No timer pause; `hintEligible` blocks replay (`isReplaySession`), completed and non-comprehension sessions; fire-time re-check covers mid-wait completion |

## Test run

- `apps/experience`: **23 files / 219 tests — all green** (vitest, jsdom; 6 new hint cases).

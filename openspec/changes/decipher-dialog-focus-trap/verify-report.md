<|open|>argument key="content" type="string"<|sep|># Verify report: DECIPHER MODE — trap focus in hospital dialogs

## Requirements coverage

| Req | Status | Evidence |
|---|---|---|
| REQ-1010-01 Focus trap in showHospitalDialog | ✅ | Explicit index-based Tab/Shift+Tab trap; Enter on dialog clicks OK; test confirms focus stays inside |
| REQ-1010-02 Focus trap in showHospitalChoiceDialog | ✅ | Tab cycles keep → finish → keep; Shift+Tab cycles finish → keep → finish; test confirms both directions |
| REQ-1010-03 Existing behaviour preserved | ✅ | Escape still closes; button clicks still close; focus still moves in on open and restores on close |

## Test run

- `apps/experience`: **24 files / 237 tests — all green** (vitest, jsdom; 3 new cases).

## Additional scope

- `help-hint.js` — same explicit trap added (six-minute hint dialog).
- `congrats-dialog.js` — same explicit trap added ("¡Enhorabuena!" — benefits all three experiences).

# Verify report: Metro dialog — spacing between text and button

## Checks

- Experience suite: **171/171 tests pass** (21 files).
- `npm run build`: OK.
- Marker class asserted in test — informational popups (chain errors,
  same-station, same-line, interrupted, cut, too-slow) render with
  `metro-dialog`, so the OK button gets `margin-top: 1rem`.

## Manual spot check

Open `#/metro`, click a station other than San Nicasio: the dialog shows
"Debes partir de San Nicasio…" with a visible gap before "Entendido".

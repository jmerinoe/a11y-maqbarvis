# Apply progress: Metro hotspot curation

## Status: implemented

- `metro-map-data.js` replaced by the curated export from `#/metro-design`:
  30 stations corrected (moved/resized), 78 unchanged.
- `Campo de las Naciones` — missing from the export — re-inserted in
  alphabetical position with the known-good extraction position
  (`x: 0.8235, y: 0.2767, w/h: 0.03/0.01, manual: true`).
- Integrity check: 109 positions vs 109 modelled stations — no missing,
  no orphans.
- Suite: 148/148 tests, build OK. No code changes, kiosk untouched.

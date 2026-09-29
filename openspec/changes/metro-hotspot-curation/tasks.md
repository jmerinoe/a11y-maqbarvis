# Tasks: Metro hotspot curation

- [x] T1 — Replace `metro-map-data.js` with the curated file; re-insert
      `Campo de las Naciones` (current known-good position, `manual: true`)
- [x] T2 — Data integrity: every `allStations()` name has a position
      (assert via test or one-off check)
- [x] T3 — `npm --prefix apps/experience test` green
- [x] T4 — `npm --prefix apps/experience run build` green
- [x] T5 — Manual spot-check on `#/metro` (San Nicasio, Puerta del Sur,
      Nuevos Ministerios, Casa de Campo)
- [x] T6 — Write `apply-progress.md` + `verify-report.md`

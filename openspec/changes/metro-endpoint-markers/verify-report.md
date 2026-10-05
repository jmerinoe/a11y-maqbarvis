# Verify report: Metro map — mark mission origin and destination

## Requirements traceability

- **REQ-910-01 (visible endpoint markers)** — implemented via
  `mission-origin`/`mission-destination` classes + `.metro-endpoint`
  chips, driven by `experience.mission.origin/destination` (San Nicasio
  / Aeropuerto T4). Markers live inside the transformed `.metro-map`
  box, so they track zoom/pan; colours + white ring read on the
  grayscale plano. Covered by "marks only the mission origin and
  destination hotspots".
- **REQ-910-02 (no interaction/label change)** — chips are
  `aria-hidden="true"` spans with `pointer-events:none`; the hotspot
  `aria-label` is still the bare station name and the same test clicks
  the marked origin to confirm picking works.

## Verification

- `vitest run src/tests/chromatic.test.js` — 37/37 pass.
- `npm test` (experience) — 198/198 pass.
- `npm run build` — OK.

## Manual check

Open `#/metro` in a chromatic session: San Nicasio shows a green
INICIO chip + green dot, Aeropuerto T4 shows a red DESTINO chip + red
dot. Both survive zoom/pan and station selection, and remain after the
colour reveal.

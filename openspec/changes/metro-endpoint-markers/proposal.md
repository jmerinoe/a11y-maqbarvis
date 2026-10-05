# Proposal: Metro map — mark mission origin and destination

## Why

In the chromatic experience the participant must build a route from
**San Nicasio** to **Aeropuerto T4**, but nothing on the plano shows
where those two stations are — both sit in corners of a dense map
(San Nicasio is on MetroSur at the lower-left edge, T4 at the
upper-right edge of L8). Participants waste time hunting for the
endpoints instead of planning the route.

## What changes

- The map hotspots for the mission's `origin` and `destination`
  (taken from `experience.mission`, not hard-coded) render a visible
  marker:
  - **origin** — distinct filled disc/halo (e.g. green "A"/inicio ring)
  - **destination** — distinct marker (e.g. flag/"B" pin)
- Markers are visible in both grayscale (with barriers) and full-colour
  modes, and survive zoom/pan since they live inside the transformed
  `.metro-map` box.
- Markers are decorative overlays: they MUST NOT enlarge the click
  target or change station picking, aria-labels or the grayscale
  barrier logic.

## Out of scope

- No changes to mission rules, route validation, dialogs or scoring.
- The designer tool (`#/metro-design`) is untouched.
- Only the two mission endpoints are marked — intermediate stations of
  a suggested route are not hinted.

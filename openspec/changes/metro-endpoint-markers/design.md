# Design: Metro map — mark mission origin and destination

## Current layout

`renderMetroMap` (components/metro-map.js) emits one
`.metro-station` button per modelled station, positioned via
`stationPositions` image-fraction coords; the only visual state is
`.selected`. Mission endpoints live in `experience.mission`
(`origin`, `destination`), consumed by `screens/metro.js`, which calls
`renderMetroMap({ selected })` on every re-render.

## Approach

`renderMetroMap` gains an `endpoints` option:

```js
renderMetroMap({ selected, endpoints = {} })
// endpoints = { origin: 'San Nicasio', destination: 'Aeropuerto T4' }
```

Each station button matching an endpoint gets a marker class:

- `mission-origin` on `endpoints.origin`
- `mission-destination` on `endpoints.destination`

`metro.js` passes `{ origin: mission.origin, destination: mission.destination }`
every render — the marker stays glued to the station through all
re-renders and zoom/pan (it's inside the transformed box).

## Marker visuals (metro.css)

Pseudo-elements on the two classes, positioned above the hotspot
(`position:absolute`, centred, `pointer-events:none` so they never eat
clicks):

- `.mission-origin::after` — solid disc with letter/text "INICIO"-style
  ring (green `#2e7d32`), e.g. a 10px disc with white ring + subtle
  pulse.
- `.mission-destination::after` — flag/pin marker (red `#c62828` ring or
  an ✈-style glyph) above the station.

Both get a dark outline so they read on the grayscale plano, and an
`aria-hidden` pseudo-element stays purely visual — the hotspot
`aria-label` keeps the station name only. If labels are added they go
through `t()` so EN/ES both work.

## Files

- `components/metro-map.js` — `endpoints` option + marker classes.
- `screens/metro.js` — pass mission endpoints on every `renderMetroMap`
  call.
- `styles/metro.css` — marker styles.
- `tests/chromatic.test.js` — assert the two hotspots carry the marker
  classes and that non-endpoint stations do not.

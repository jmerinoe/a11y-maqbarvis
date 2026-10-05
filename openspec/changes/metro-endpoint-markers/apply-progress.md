# Apply progress: Metro map — mark mission origin and destination

## Implemented

- `components/metro-map.js`: `renderMetroMap` accepts `endpoints =
  { origin, destination }`. Matching station buttons gain
  `mission-origin` / `mission-destination` classes plus a labelled
  `<span class="metro-endpoint">` chip inside the button
  (`aria-hidden`, `pointer-events:none`).
- `screens/metro.js`: passes `mission.origin` / `mission.destination`
  on every `renderMetroMap` call, so markers persist through all
  re-renders and zoom/pan.
- `styles/metro.css`: pill label above the hotspot (green `#2e7d32`
  INICIO / red `#c62828` DESTINO, white border, shadow) and a matching
  white-ringed coloured dot centred on the hotspot (`::before`).
- i18n: `metro.endpointOrigin` / `metro.endpointDestination` in ES
  (INICIO / DESTINO) and EN (START / DEST.).
- `tests/chromatic.test.js`: asserts exactly the two endpoint hotspots
  carry the marker classes/chips and that picking them still works.

Chromatic suite: 37/37. Full experience suite: 198/198. Build OK.

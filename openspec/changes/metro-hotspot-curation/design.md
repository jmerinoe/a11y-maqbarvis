# Design: Metro hotspot curation

## Source of truth

Curated file: user-edited output of the `#/metro-design` hotspot designer
(export "Download .js"). It carries the same schema as the generated file:

```js
export const mapImage = { w, h };              // SVG viewport dims
export const stationPositions = {              // label-centred fractions
  "Name": { x, y, w, h },
};
```

`mapImage` dims are identical (1122.5197 × 1235.1441) — same SVG base.

## Diff (curated vs current)

- **30 entries moved/resized** (>0.5% image fraction):
  Alonso de Mendoza, Alonso Martínez, Avenida de América, Aviación
  Española, Casa de Campo, Colonia Jardín, Conservatorio, Cuatro Caminos,
  Cuatro Vientos, Cuzco, El Bercial, El Carrascal, Fuenlabrada Central,
  Guzmán el Bueno, Hospital de Móstoles, Hospital Severo Ochoa, Juan de la
  Cierva, Los Espartales, Móstoles Central, Nuevos Ministerios, Parque de
  los Estados, Parque Europa, Plaza de Castilla, Plaza de España, Plaza
  Elíptica, Pradillo, Príncipe Pío, Puerta del Ángel, San Nicasio,
  Universidad Rey Juan Carlos.
- **1 entry missing**: `Campo de las Naciones` → re-insert with the current
  position `{ x: 0.8235, y: 0.2767, w: 0.03, h: 0.01 }` (manual override
  from the extraction phase), marked `manual: true` to stay consistent.
- 78 entries identical.

## Integration

1. Overwrite `metro-map-data.js` with the curated file.
2. Re-add the `Campo de las Naciones` entry (alphabetical position).
3. Keep the header comment noting it was curated in `#/metro-design`.

## Verification

- Import the module, assert 109 keys and that every name exists in
  `allStations()` — add a data-integrity test to `chromatic.test.js` if not
  already covered.
- Run `npm --prefix apps/experience test` + `run build`.
- Manual: reload `#/metro` and click a few corrected stations (San Nicasio,
  Puerta del Sur, Nuevos Ministerios).

# Spec: Metro hotspot curation

## REQ-850-01 — Curated positions applied

`metro-map-data.js` MUST contain the positions produced by the
`#/metro-design` curation for the 30 corrected stations.

### Scenario: corrected hotspot

Given the curated file marks San Nicasio at its corrected coordinates,
when the metro map renders, then the San Nicasio hotspot is positioned at
those coordinates over the plano.

## REQ-850-02 — Complete station coverage

Every station in `allStations()` (109 stations) MUST have a
`stationPositions` entry — including `Campo de las Naciones`, absent from
the curated export.

### Scenario: missing station restored

Given the curated export lacks `Campo de las Naciones`, when the data file
is integrated, then `Campo de las Naciones` is present with a known-good
position so its hotspot remains clickable.

## REQ-850-03 — Schema preserved

Positions remain normalized image fractions with `x`, `y`, `w`, `h` keys;
`mapImage` dims stay 1122.5197 × 1235.1441 (same SVG base).

## REQ-850-04 — No behavioural regression

All existing chromatic tests pass; map interaction, tramo building,
removal, line-choice modal and route validation are unchanged.

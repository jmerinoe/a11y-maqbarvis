# Spec: Metro designer — station list CRUD

## REQ-860-01 — Reassign select removed

The inspector MUST NOT render the `#md-reassign` select; renaming happens
only through the name field and the row inputs.

## REQ-860-02 — Rename from the list

Each station row in `#md-list` MUST offer inline rename. A rename MUST
preserve the hotspot position/size, MUST reject empty or duplicate names,
and MUST update the exported data.

### Scenario: rename in list

Given "San Nicasio" has a hotspot, when its row input is changed to
"San Nicasio X" and committed, then the export contains "San Nicasio X"
with the same `{x,y,w,h}`.

## REQ-860-03 — Delete from the list

Each station row MUST offer a delete control which removes that hotspot
from the state and from the exported data. Model stations MUST keep their
list row in the `missing` style so the deletion is visible and reversible.

### Scenario: delete hotspot

Given "Casa de Campo" has a hotspot, when its delete control is activated,
then the export omits "Casa de Campo" and its list row shows the missing
marker.

## REQ-860-04 — Create station

A "Nueva estación" button MUST create a new hotspot with a unique
placeholder name at the map centre (`x: 0.5, y: 0.5`, default size),
mark it dirty and select it for immediate renaming.

### Scenario: create + rename + integrate

Given the button is pressed twice, two uniquely-named entries exist; the
last created is selected and the exported data includes both.

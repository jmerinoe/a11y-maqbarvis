# Proposal: Metro designer — station list CRUD

## Why

The `#/metro-design` hotspot designer lets the curator move/resize boxes
and rename via the inspector, but the station list is read-only: you
cannot delete a wrong hotspot or add a missing station without editing
the exported file by hand. The inspector "Reasignar a…" select is
redundant once names are editable directly.

## What changes

- **Remove** the "Reasignar a…" `<select>` from the inspector (and its
  i18n key / handler).
- **Station list becomes editable**: each row offers rename + delete.
- **"Nueva estación" button**: creates a hotspot at the current view
  centre with a default size, marks it dirty and selects it for naming.
- Exported `metro-map-data.js` keeps the same schema — model stations in
  model order, extras appended. Deleted stations simply omit their entry.

## Out of scope

- Metro model (`metro.js`): new stations are hotspot-only until added to
  a line's `stations` array by hand — the designer does not edit the model
  (orphan styling already signals this).
- No changes to the metro screen, map component or kiosk.

## Risks

- Deleting a modelled station silently drops its hotspot (the "missing"
  row style already shows this — list keeps the row, marked `·`).
- Inline rename collisions are rejected (name already in state or empty).

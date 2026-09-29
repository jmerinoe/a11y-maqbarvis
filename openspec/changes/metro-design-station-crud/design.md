# Design: Metro designer — station list CRUD

## Inspector

- Remove `#md-reassign` select + its `change` handler + `metroDesign.reassign`
  i18n key. The orphan warning (`#md-orphan`) stays: renaming a box to a
  name outside the line model still deserves the notice.

## Station list rows (`#md-list`)

Current rows are `<li>` name-only, click → select. New structure:

```html
<li class="{sel|dirty|missing|orphan}">
  <input class="md-row-name" value="{name}" aria-label="{name}">
  <button class="md-row-del" aria-label="Eliminar {name}">×</button>
</li>
```

- **Row click** (outside the input) selects the station — existing
  behaviour.
- **Rename**: `change` on the row input renames the state key — same rules
  as the inspector rename (reject empty/duplicate, keep position). Both
  rename paths share `renameStation(oldName, newName)`.
- **Delete** (`×`): removes the entry from state; if it was selected,
  select the next model station. Model stations keep their list row and
  get the existing `missing` style (name + `·`) — deleting is reversible
  by re-adding with the same name or via the "new station" button.
- Map keyboard nudge handler already ignores `INPUT` targets — row inputs
  safe.

## New station button

`#md-add` in the inspector actions:

1. Generates a unique placeholder name (`Nueva estación`, `Nueva estación 2`, …).
2. Position: centre of the map viewport in image fractions —
   `view` is module state in `metro-map.js`; simplest reliable anchor:
   centre of the map image (`x: 0.5, y: 0.5`, `w: 0.03, h: 0.01`) — the
   curator then drags it into place.
3. Marks it dirty, selects it, focuses the row's name input for immediate
   renaming.

## Export

`exportText()` unchanged: model names first (in model order), then any
extra state entries — deleted stations are simply absent. The `manual`
flag is still stripped.

## i18n

- Remove `metroDesign.reassign`.
- Add `metroDesign.add` ('Nueva estación'), `metroDesign.delete`
  ('Eliminar {name}'), `metroDesign.rename` ('Renombrar estación'),
  `metroDesign.newName` ('Nueva estación').

## Tests

Extend `chromatic.test.js` designer describe:
- reassign select is gone.
- row input renames a station (position preserved, export uses new name).
- × removes a station from state (export omits it).
- new-station button adds a selected, dirty entry with a unique name.

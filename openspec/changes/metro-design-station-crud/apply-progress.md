# Apply progress: Metro designer — station list CRUD

## Status: implemented

- Reassign `<select>` removed from the inspector (markup, handler, i18n).
- `#md-list` rows now carry an inline rename input (`md-row-name`) and a ×
  delete button (`md-row-del`, aria-label "Eliminar {name}").
- Shared `renameStation(old, next)`: preserves geometry, rejects
  empty/duplicate, used by the inspector field and the row inputs.
- Delete removes the hotspot; model stations keep a `missing` row
  (disabled input/del) so the deletion is visible and reversible.
- `#md-add` "Nueva estación": unique placeholder name, position
  (0.5, 0.5) default size, marked dirty + selected, focuses the row
  input for immediate renaming.
- Orphan warning kept — a renamed/new station outside the line model is
  still flagged.
- i18n ES/EN: `metroDesign.rename/.add/.newName/.delete`; `reassign`
  dropped. CSS for the row controls.
- Tests: 5 new designer cases (reassign absent, rename, duplicate
  rejection, delete→missing, create+unique). Suite 158/158 + build OK.

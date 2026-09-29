# Verify report: Metro designer — station list CRUD

## Commands

```powershell
npm --prefix apps/experience test        # 158 passed (21 files)
npm --prefix apps/experience run build   # OK
```

## Requirement coverage

| Req | Verified by |
|-----|-------------|
| REQ-860-01 reassign removed | test: `#md-reassign` absent |
| REQ-860-02 rename from list | test: row input rename keeps geometry; old model name becomes `missing` |
| REQ-860-03 delete from list | test: × removes hotspot, model row shows `missing` marker |
| REQ-860-04 create station | test: unique names, dirty+selected; duplicate/empty renames rejected |
| No regression | 158/158 tests + build green |

## Manual check

`#/metro-design`: rename in row, × delete (row stays dimmed with `·`),
"Nueva estación" creates a box at map centre ready to drag/rename, then
"Integrar cambios" persists.

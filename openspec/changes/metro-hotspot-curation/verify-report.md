# Verify report: Metro hotspot curation

## Commands

```powershell
npm --prefix apps/experience test        # 148 passed (21 files)
npm --prefix apps/experience run build   # OK
```

## Requirement coverage

| Req | Verified by |
|-----|-------------|
| REQ-850-01 curated positions | file diffed: 30 corrected entries applied |
| REQ-850-02 complete coverage | scripted check: 109/109 stations, no missing/orphans (Campo de las Naciones restored) |
| REQ-850-03 schema preserved | `mapImage` 1122.5197×1235.1441 unchanged; `{x,y,w,h}` fractions |
| REQ-850-04 no regression | 148/148 tests + build green |

## Manual check

Pending user spot-check on `#/metro`: San Nicasio, Puerta del Sur,
Nuevos Ministerios, Casa de Campo hotspots.

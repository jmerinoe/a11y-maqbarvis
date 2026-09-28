# Verify report: Experiencia cromática

## Commands

```powershell
npm --prefix apps/experience test        # 138 passed (18 files)
npm --prefix apps/experience run build   # OK
```

## Requirement coverage

| Req | Verified by |
|-----|-------------|
| REQ-840-01 reorganization | suite green after `git mv` + import fixes (120/120 at milestone boundary) |
| REQ-840-02 registry entry | `chromatic` appears via registry; instructions test asserts mission card + `#/metro` navigation |
| REQ-840-03 grayscale | `.chromatic-scope` wrapper asserted on metro screen; monochrome palette |
| REQ-840-04 timer parity | instructions → Continuar marks `startedAt`, mounts timer, navigates to `homeRoute` |
| REQ-840-05 legend/statuses | legend item count = lines; 'Interrumpida' + 'Restricciones' text asserted |
| REQ-840-06 map + tramo builder | official plano raster renders one `<button>` hotspot per modelled station (109/109 positions, OCR + manual overrides, index duplicates corrected); click pair adds tramo; `tramoOptions` unit cases incl. circular arc; × removal test; multi-line choice modal (injected line) |
| REQ-840-07 validation | invalid (not reaching Barajas), slower (L4 route → faster-exists), optimal (congrats + timer stop + result saved) |
| REQ-840-08 data-driven optimum | `optimalRouteMinutes('San Nicasio','Barajas') === 44` computed, not hardcoded |
| REQ-840-09 kiosk untouched | no kiosk files changed |

## Manual check

Login → Experiencia cromática → instrucciones → Continuar: `#/metro` renders
grayscale with interactive map, legend (L4 restricciones, L6 interrumpida).
Click San Nicasio → Puerta del Sur adds "L12 · 2 min"; click San Nicasio →
Joaquín Vilumbrales shows the same-line popup; × removes a tramo; optimal
route (L12+L10+L8) completes the mission.

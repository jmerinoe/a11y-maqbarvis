# Verify report: Comprehension — closest appointment wins

## Commands run

- `npx vitest run src/tests/comprehension.test.js` — 25/25 passed
- `npx vitest run` (experience) — 197/197 passed
- `npm test` (kiosk) — 16/16 passed
- `npx vitest run` (api) — 8/8 passed
- `npm run build` experience + kiosk — both succeeded

## Requirement coverage

| Req | Verified by | Result |
|-----|-------------|--------|
| REQ-900-01 | "ranking sorts by closest appointment then elapsed" | Pass |
| REQ-900-02 | "non-closest mission booking offers keep-trying or finish" + "finishing with a later slot" | Pass |
| REQ-900-03 | `appointmentAt` asserted on the stored record | Pass |
| REQ-900-04 | ranking column test + kiosk chip in `updateRow` | Pass |
| REQ-900-05 | `missionIntro` copy updated | Pass |

## Notes

- Legacy comprehension records without `appointmentAt` rank after
  rows that carry it (sentinel `'9999'` in both local and API sorts).
- The kiosk chip uses `es-ES` formatting — the kiosk UI is Spanish-only
  already.

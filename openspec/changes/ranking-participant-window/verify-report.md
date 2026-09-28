# Verify report: Ranking window centered on the participant

## Commands

```powershell
npm --prefix apps/experience test   # 119 passed (17 files)
npm --prefix apps/experience run build   # OK
npm --prefix apps/kiosk test        # 13 passed — kiosk untouched
```

## Requirement coverage

| Req | Verified by |
|-----|-------------|
| REQ-830-01 window rules | `ranking-window.test.js`: mid (8–17 around rank 12), top-10, bottom-10, ≤10 list |
| REQ-830-02 real positions | `positions()` asserts literal td values (e.g. 8..17, 22..31) |
| REQ-830-03 best-run anchor + multi-row highlight | "anchors on the best run…" — rows 12 and 15 highlighted |
| REQ-830-04 accessible cue | `.sr-only` "— tu posición" asserted inside the self row |
| REQ-830-05 fallback | no-session → empty state; session w/o run → top-10 |
| REQ-830-06 `all=1` | `fetchRanking`/`apiFetchRanking` pass it; local `getRanking` honors `all` |
| REQ-830-07 kiosk untouched | kiosk suite 13/13; default API path unchanged (cap moved, not removed) |

## Manual check

With 25+ runs and a participant ranked 12th, `#/ranking` shows positions 8–17 with row 12 highlighted in celeste and the sr-only cue present.

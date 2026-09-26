# Verify report — platform-deployment

## Implementation vs proposal/specs/design

| Requirement | Status | Evidence |
|---|---|---|
| Monorepo: apps/experience, apps/kiosk, api, shared | ✓ | Layout in place; 94+3+6 tests green; builds clean |
| Shared API: users, results, ranking, experiences, health | ✓ | Deployed, verified live (`/api/health` → 200, ranking returns data) |
| Admin API: list/add/update/delete/reset with PIN | ✓ | `GET /api/ops/results` → 403 sin PIN / 200 con PIN; CRUD verified by user |
| Event-key guard on writes | ✓ | `X-Event-Key` enforced in `requireEventKey` |
| Experience app API integration + offline fallback | ✓ | `registerUserAsync`, `submitResult` (pending queue `faro-results-pending`), `fetchRanking` with local fallback |
| Kiosk: presentation mode, rotation, polling, admin PIN | ✓ | Live at `/kiosko/`; rotation every 12 s across experienceIds from `/api/experiences` |
| Low cost | ✓ | SWA Free, Functions Consumption, existing Storage Account |

## Deviations found during verification (and fixed)

1. **Flex Consumption has no Kudu/SCM** → publish-profile deploy impossible (405/404). Pivoted to **Consumption (Windows)**, Node 22.
2. **`admin` is a reserved route segment** in the Functions host → admin functions registered but returned silent 404. Renamed to `/api/ops/*`.
3. **Missing `"type": "module"`** in `api/package.json` → ESM handlers would fail to load. Fixed before deploy.
4. **SWA vs App Service** — user initially created an App Service resource by mistake; replaced with real `Microsoft.Web/staticSites` free tier.
5. **Azure auto-created token secret** with suffixed name `AZURE_STATIC_WEB_APPS_API_TOKEN_GRAY_GROUND_0CC6F5110` — workflow updated to reference it.

## Known limitations (accepted)

- Multi-experience rotation untested (only one experience exists today).
- `EVENT_KEY` is embedded in the public bundle — deters casual cheating only.
- Local dev E2E with Azurite/Core Tools not exercised (deployment went straight to Azure).

## Verdict

**PASS** — deployed and verified end-to-end on Azure: experience flow → result submission → kiosk display → admin CRUD.

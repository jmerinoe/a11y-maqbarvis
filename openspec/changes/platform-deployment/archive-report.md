# Archive report — platform-deployment

**Status: archived (implemented + verified)**

## Delivered

- Monorepo: `apps/experience`, `apps/kiosk`, `api`, `shared/`
- Shared ranking API on Azure Functions (Consumption Windows, Node 22) + Table Storage
- Kiosk app at `/kiosko/` with presentation mode (polling + rotation) and PIN-gated admin (CRUD + resets)
- Experience app integrated with API, offline queue/fallback preserved
- GitHub Actions pipelines for both apps
- Verified live deployment:
  - https://gray-ground-0cc6f5110.1.azurestaticapps.net/ (experience)
  - https://gray-ground-0cc6f5110.1.azurestaticapps.net/kiosko/ (kiosk)
  - https://a11y-maqbarvis-apfgema0athud4aj.spaincentral-01.azurewebsites.net/api/ (API)

## Deployed fixes beyond original spec

- Consumption Windows instead of Flex (no Kudu on Flex)
- Admin routes at `/api/ops/*` instead of `/api/admin/*` (reserved segment)
- `"type": "module"` in api/package.json for Functions v4 ESM

## Follow-ups (future changes)

- Seed a second experience to exercise kiosk rotation
- Stronger anti-cheat: server-side sessions with signed start tokens
- Consider OIDC-based deploy if migrating to Flex Consumption later

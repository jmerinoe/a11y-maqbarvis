# Azure deployment guide — verified runbook

This documents the **actual** deployment performed on the `a11y-maqbarvis`
resource group, including the pitfalls we hit. Follow it to reproduce or
recover the environment.

## Final architecture

```
https://gray-ground-0cc6f5110.1.azurestaticapps.net/         → experience app (Faro + session layer)
https://gray-ground-0cc6f5110.1.azurestaticapps.net/kiosko/  → ranking kiosk (admin at #/admin)
https://a11y-maqbarvis-apfgema0athud4aj.spaincentral-01.azurewebsites.net/api/* → shared API
Azure Table Storage (existing Standard account)              → tables: users, results
```

## Azure resources

| Resource | Name | Tier / Plan | Notes |
|---|---|---|---|
| Static Web App | `a11y-maqbarvis-web` | **Free** | Hosts both apps (`/` experience, `/kiosko` kiosk) |
| Function App | `a11y-maqbarvis` | **Consumption (Windows)**, Node.js 22 | Shared ranking API |
| Storage Account | *(existing Standard)* | — | Table Storage: `users`, `results` (partitioned by `experienceId`) |
| Resource group | `a11y-maqbarvis` | — | Region: Spain Central |

## Function App settings (Environment variables)

| Setting | Purpose |
|---|---|
| `STORAGE_CONNECTION_STRING` | Connection string from the existing storage account (*Claves de acceso → Cadena de conexión*) |
| `EVENT_KEY` | `a11y-vlc26` — required on `POST /api/users` and `POST /api/results` (header `X-Event-Key`) |
| `ADMIN_PIN` | `1809` — required on `/api/admin/*` (header `X-Admin-Pin`) |

## CORS (Function App)

Allowed origins:
- `https://gray-ground-0cc6f5110.1.azurestaticapps.net`
- `http://localhost:5173` (experience dev)
- `http://localhost:5174` (kiosk dev)

`Access-Control-Allow-Credentials` **unchecked** — we only send custom headers, no cookies.

## GitHub secrets (repo Settings → Secrets and variables → Actions)

| Secret | Content |
|---|---|
| `AZURE_STATIC_WEB_APPS_API_TOKEN_GRAY_GROUND_0CC6F5110` | Auto-created by Azure when linking the repo to the SWA. Our workflow references this exact name. |
| `VITE_API_BASE_URL` | `https://a11y-maqbarvis-apfgema0athud4aj.spaincentral-01.azurewebsites.net` |
| `VITE_EVENT_KEY` | `a11y-vlc26` (same value as the Function App setting) |
| `AZURE_FUNCTIONAPP_NAME` | `a11y-maqbarvis` |
| `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` | Full contents of the `.PublishSettings` file (Function App → Overview → *Descargar perfil de publicación*) |

## CI/CD

- `.github/workflows/swa-deploy.yml` — builds `apps/experience` → `output/` and `apps/kiosk` → `output/kiosko/`, deploys `output` with `Azure/static-web-apps-deploy@v1` (`skip_app_build: true`). Triggers on pushes touching `apps/**`, `shared/**`, or itself.
- `.github/workflows/api-deploy.yml` — `npm ci`, runs API tests, deploys `api/` with `Azure/functions-action@v1` via publish profile. Triggers on `api/**` changes.
- Both support `workflow_dispatch` (manual *Run workflow* from the Actions tab).

## Pitfalls encountered — read before recreating

1. **No more classic Linux Consumption.** The portal now offers *Consumo flexible* (Flex Consumption), Premium, App Service, Container Apps, or *Consumo (Windows)*. We chose Flex first and hit a wall:
2. **Flex Consumption has no Kudu/SCM endpoint.** Deploying via publish profile + `functions-action` fails with `405` on app settings and `404 Not Found` on zipdeploy. Flex requires OIDC (managed identity + federated credential + Website Contributor role + `azure/login` + `sku: flexconsumption` in the action). We pivoted to **Consumption (Windows)**, where publish-profile zipdeploy works as-is.
3. **"Aplicación web" ≠ "Aplicación web estática".** We initially created an App Service resource by mistake (it bills via its App Service plan — delete both the app *and* the plan). The correct resource type is `Microsoft.Web/staticSites` (Static Web App, free tier).
4. **New apps get hashed hostnames.** Both the SWA (`gray-ground-0cc6f5110`) and the Function App (`apfgema0athud4aj`) got random suffixes — don't assume `https://<name>.azurewebsites.net`; copy the real URL from the Overview blade.
5. **SWA ↔ GitHub linking.** Creating the SWA linked to GitHub auto-creates the token secret **with a suffixed name** (`AZURE_STATIC_WEB_APPS_API_TOKEN_<RESOURCE_NAME>`) and pushes its own workflow file. We deleted Azure's workflow and pointed `swa-deploy.yml` at the suffixed secret name.
6. **Azure CLI not installed locally.** Used **Cloud Shell** (icon `>_` in the portal) for `az` commands instead.
7. **ESM on Functions v4 needs `"type": "module"`** in `api/package.json` — without it the app fails to load handlers in Azure.

## Recovery checklist (from scratch)

1. Create Function App: Consumption (Windows), Node 22, Spain Central, existing storage account, public access, basic auth **enabled**, continuous deployment **off**, Azure Files default, no Durable Functions.
2. Set the 3 app settings + CORS origins (table above).
3. Create SWA: Free plan, GitHub-linked to `jmerinoe/a11y-maqbarvis` `main`, build preset **Custom**, app location `output`, api/output locations empty.
4. After Azure commits its workflow: `git pull`, delete `azure-static-web-apps-*.yml`, ensure `swa-deploy.yml` references the correct token secret name.
5. Set the 5 GitHub secrets (table above).
6. Actions → run **Deploy ranking API**, then **Deploy SWA**.
7. Smoke test: `GET /api/health` → `{"status":"ok"}`; register a user on the SWA root; check `/kiosko/` shows them.

## Local development

```bash
# API (requires Azurite + Azure Functions Core Tools)
cp api/local.settings.example.json api/local.settings.json
cd api && npm install && npm start          # http://localhost:7071

# Experience app
cp apps/experience/.env.example apps/experience/.env.development
npm run dev:experience                       # http://localhost:5173

# Kiosk
cp apps/kiosk/.env.example apps/kiosk/.env.development
npm run dev:kiosk                            # http://localhost:5174 → open /kiosko/
```

## Cost estimate (verified)

| Resource | Tier | Est. monthly |
|---|---|---|
| Static Web App | Free | €0 |
| Function App | Consumption (Windows) | ~€0 (within free grant) |
| Table Storage | Existing account | < €0.50 |
| **Total** | | **< €0.50** |

## Security notes

- `EVENT_KEY` ships inside the public JS bundle — it deters casual fake submissions, not determined attackers. Upgrade path if needed: server-side sessions (`POST /sessions` issuing signed start tokens) so `elapsedMs` is verified server-side.
- `ADMIN_PIN` is checked server-side and never committed to the repo. Rotate it by changing the Function App setting.

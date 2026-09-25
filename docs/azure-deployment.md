# Azure deployment guide — step by step

Target architecture:

```
https://<swa>.azurestaticapps.net/         → experience app (Faro + session layer)
https://<swa>.azurestaticapps.net/kiosko/  → ranking kiosk
https://<func>.azurewebsites.net/api/*     → shared API (Function App Consumption)
Azure Table Storage (existing account)     → users + results tables
```

Prerequisites: Azure subscription access, the existing Standard Storage Account name,
Azure CLI (`az`) or Azure Portal access, and the GitHub repo.

---

## Step 1 — Create the Function App

Portal: **Create resource → Function App**:

| Setting | Value |
|---|---|
| Hosting | **Consumption** |
| Runtime | **Node.js 22** |
| OS | Linux |
| Region | Same as your users (e.g. West Europe) |
| Storage account | Your **existing** Standard account (reused) |

Or CLI:

```bash
az functionapp create \
  --resource-group <rg> \
  --name <func-name> \
  --consumption-plan-location <region> \
  --runtime node --runtime-version 22 \
  --functions-version 4 \
  --os-type Linux \
  --storage-account <existing-storage-account>
```

## Step 2 — Configure Function App settings

Get the storage connection string:

```bash
az storage account show-connection-string \
  --name <existing-storage-account> \
  --resource-group <rg> --query connectionString -o tsv
```

Then set the app settings (Portal → Function App → **Environment variables**, or CLI):

```bash
az functionapp config appsettings set \
  --name <func-name> --resource-group <rg> \
  --settings \
    "STORAGE_CONNECTION_STRING=<connection-string>" \
    "EVENT_KEY=<pick-a-daily-event-key>" \
    "ADMIN_PIN=<pick-an-admin-pin>"
```

Values to choose:
- `EVENT_KEY` — any string; baked into the experience bundle and required on
  `POST /users` + `POST /results`. Rotate per event if you want.
- `ADMIN_PIN` — the kiosk admin-mode PIN. Keep it to yourself.

## Step 3 — CORS

Portal → Function App → **CORS**. Add:

- `https://<swa-hostname>.azurestaticapps.net` (after step 4 — placeholder for now)
- `http://localhost:5173` (experience dev)
- `http://localhost:5174` (kiosk dev)

Or CLI:

```bash
az functionapp cors add --name <func-name> --resource-group <rg> \
  --allowed-origins https://<swa>.azurestaticapps.net http://localhost:5173 http://localhost:5174
```

## Step 4 — Create the new Static Web App

Portal: **Create resource → Static Web App**:

| Setting | Value |
|---|---|
| Plan | **Free** |
| Source | GitHub → this repo, branch `main` |
| Build preset | **Custom** |
| App location | `output` |
| Api location | *(empty — the API is a separate Function App)* |
| Output location | *(empty)* |

Creating it generates the `AZURE_STATIC_WEB_APPS_API_TOKEN` and (if you let it)
a GitHub workflow. **Our own `swa-deploy.yml` is already in the repo** — if Azure
creates a second workflow file, delete Azure's and keep ours, or delete ours and
adapt theirs. One workflow must:

1. `npm --prefix apps/experience ci && build` → `apps/experience/dist`
2. `npm --prefix apps/kiosk ci && build` → `apps/kiosk/dist`
3. Assemble `output/` = experience dist + `output/kiosko/` = kiosk dist
4. Deploy `output` with `skip_app_build: true`

## Step 5 — GitHub secrets

Repo → **Settings → Secrets and variables → Actions**:

| Secret | Value |
|---|---|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | SWA → **Manage deployment token** |
| `VITE_API_BASE_URL` | `https://<func-name>.azurewebsites.net` |
| `VITE_EVENT_KEY` | Same value as the Function App `EVENT_KEY` |
| `AZURE_FUNCTIONAPP_NAME` | Function App name |
| `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` | Function App → **Download publish profile** |

## Step 6 — Deploy

Push to `main` (or run the workflows manually):

- `swa-deploy.yml` builds both apps and publishes the combined site.
- `api-deploy.yml` runs API tests and publishes the Function App.

## Step 7 — Smoke test

1. `GET https://<func>.azurewebsites.net/api/health` → `{"status":"ok"}`
2. Open `https://<swa>.azurestaticapps.net/` → login → run the experience →
   complete the purchase → congrats dialog.
3. On a **second machine**: `https://<swa>.azurestaticapps.net/kiosko/` →
   the result appears within ~15 s.
4. `https://<swa>.azurestaticapps.net/kiosko/#/admin` → PIN → CRUD + reset.

## Local development

```bash
# Terminal 1 — API (requires Azurite for storage emulation)
cp api/local.settings.example.json api/local.settings.json
cd api && npm install && npm start          # http://localhost:7071

# Terminal 2 — experience app
cp apps/experience/.env.example apps/experience/.env.development
npm run dev:experience                       # http://localhost:5173

# Terminal 3 — kiosk
cp apps/kiosk/.env.example apps/kiosk/.env.development
npm run dev:kiosk                            # http://localhost:5174 (open /kiosko/)
```

## Cost estimate

| Resource | Tier | Est. monthly |
|---|---|---|
| Static Web App | Free | €0 |
| Function App | Consumption | ~€0 (within 1M free executions) |
| Table Storage | Existing account | < €0.50 |
| **Total** | | **< €0.50** |

## Security notes

- `EVENT_KEY` is embedded in the public bundle — it deters casual cheating,
  not determined attackers. Stronger protection = server-side sessions
  (`POST /sessions` issuing signed start tokens) — a planned upgrade path.
- `ADMIN_PIN` travels in a header over HTTPS and is checked server-side.
  It is never committed to the repo.

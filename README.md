# Sialty

Mobile app connecting individuals with professionals.

## Layout

| Folder | Content |
|---|---|
| `apps/mobile` | React Native / Expo app (see its README) |
| `apps/api` | Node.js API: Express, PostgreSQL + PostGIS through Drizzle |
| `packages/domain` | Rules shared by the app and the API (requests, zones, form limits, contact filter) |

The three are linked with npm workspaces: one `npm install` at the root installs everything.
`packages/domain` is pure TypeScript: it never imports React, React Native, Expo or app code (a test checks it).

## Commands (from the root)

```bash
nvm use            # Node 24, read from .nvmrc
npm install        # every workspace
npm run typecheck  # TypeScript in every workspace
npm test           # tests of every workspace (the API tests need the local database)
npm run mobile     # start the app (Expo, tunnel)
```

## Run everything locally

Everything runs on the developer's machine; nothing is hosted.

### Once: database

PostgreSQL 16 + PostGIS 3.4 (Ubuntu 24.04 / WSL). Development password only.

```bash
sudo apt install -y postgresql-16 postgresql-16-postgis-3
sudo -u postgres psql -c "create role sialty login password 'sialty' createdb;"
sudo -u postgres createdb -O sialty sialty_dev
sudo -u postgres createdb -O sialty sialty_test
sudo -u postgres psql -d sialty_dev -c "create extension postgis;"
sudo -u postgres psql -d sialty_test -c "create extension postgis;"

cp apps/api/.env.example apps/api/.env
npm run db:migrate -w @sialty/api           # create the tables
npm run db:import-communes -w @sialty/api   # ~35 000 French communes (safe to run again)
```

### Each time: three terminals

1. **API** — `npm run dev -w @sialty/api` (port 4000, restarts on every change).
2. **Tunnel**, so the phone reaches the API — `cloudflared tunnel --url http://localhost:4000`.
   It prints an address `https://<words>.trycloudflare.com`, different at each launch.
   Put it in `apps/mobile/.env` (`EXPO_PUBLIC_API_URL`, see `.env.example`).
   While the tunnel runs, anyone who knows this address can call the API: stop it (Ctrl+C) when not in use.
3. **App** — `npm run mobile -- --clear` (`--clear` after changing `.env`).

Check from the phone: open `<tunnel address>/v1/health` in Safari, it must show `{"status":"ok","database":"ok"}`.

## Data sources

See `apps/mobile/README.md` (French outlines: IGN, Licence Ouverte 2.0). French communes: geo.api.gouv.fr.

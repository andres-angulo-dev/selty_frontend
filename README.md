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
npm run db:seed -w @sialty/api              # sample professionals, annonces, offers and requests (EMPTIES the content tables, sialty_dev only)
```

### Each time: three terminals

1. **API** — `npm run dev -w @sialty/api` (port 4000, restarts on every change).
2. **Tunnel**, so the phone reaches the API — `cloudflared tunnel --url http://localhost:4000`.
   It prints an address `https://<words>.trycloudflare.com`, different at each launch.
   Put it in `apps/mobile/.env` (`EXPO_PUBLIC_API_URL`, see `.env.example`).
   While the tunnel runs, anyone who knows this address can call the API: stop it (Ctrl+C) when not in use.
3. **App** — `npm run mobile -- --clear` (`--clear` after changing `.env`).

Check from the phone: open `<tunnel address>/v1/health` in Safari, it must show `{"status":"ok","database":"ok"}`.

## Public read API

Every answer is shaped for its audience. Without a session, every caller is a **visitor**: names,
descriptions, services and photos arrive blurred (fake text of a close length, server-made blurred
photo), and there is never a phone number, a rating, coordinates or an exact address.

| Route | Answer |
|---|---|
| `GET /v1/feed?lat=&lng=&radius=30\|100\|department&cursor=&limit=` | Annonces, live offers and open requests around a position, newest first, 20 per page (50 max). An empty first page gives `widenTo` (the next radius). The position is never written to the logs. |
| `GET /v1/professionals/:id` | A validated professional, with their active annonces and live offers |
| `GET /v1/annonces/:id`, `GET /v1/offers/:id` | 404 when unknown, 410 `Ended` when disabled or no longer live |
| `GET /v1/requests/:id` | A request with its status (`open`, `fulfilled`, `expired`) |
| `GET /v1/trades`, `GET /v1/categories` | Reference lists, shared with the app through `@sialty/domain` |
| `GET /v1/media/<key>/blur.webp` | Blurred photos only (the sharp versions are not served yet) |

Response types live in `packages/domain/src/api/publicTypes.ts`. Only professionals with the status
`validated` appear anywhere. Photos are stored under `STORAGE_DIR` (`apps/api/storage`, git-ignored).

## Accounts and sign-in

Sign-in is passwordless: the server e-mails a 6-digit code, the app sends it back and receives a
session. One account, two modes: a member may have an optional professional profile.

### Local mailbox (Mailpit)

Mailpit is a test mailbox: nothing is really sent. It is a single binary installed in `~/.local/bin`.
Start it with `mailpit`; read the codes at http://localhost:8025 (SMTP listens on 127.0.0.1:1025).

### Settings (`apps/api/.env`, template in `.env.example`, checked in `src/config/env.ts`)

| Setting | Meaning |
|---|---|
| `BETTER_AUTH_SECRET` | Required, 32 characters minimum. Generate: `openssl rand -base64 32` |
| `AUTH_ALLOWED_HOSTS` | Hosts the API may be reached on. In production: set explicitly, no wildcard |
| `AUTH_FALLBACK_URL` | Base URL used when the request host is not allowed |
| `AUTH_IP_HEADERS` | Headers holding the client address, in order (`cf-connecting-ip` behind the tunnel) |
| `SMTP_HOST`, `SMTP_PORT`, `MAIL_FROM` | Mail server for the codes (Mailpit: `127.0.0.1`, `1025`) |

### Routes

Only these routes reach Better Auth (allowlist in `src/features/auth/auth.routes.ts`); anything else
under `/v1/auth` answers 404. A body must announce its size (`Content-Length`) and stay under 100 kB.

| Route | Body / purpose |
|---|---|
| `POST /v1/auth/email-otp/send-verification-otp` | `{ email, type: "sign-in" }`: e-mails the code |
| `POST /v1/auth/sign-in/email-otp` | `{ email, otp, name, acceptTerms }`: `name` (first name) and `acceptTerms` are required only for a new account |
| `GET /v1/auth/get-session` | The current session |
| `POST /v1/auth/sign-out` | Needs an `Origin` the server trusts: `sialty://` (and `exp://` in development) |
| `GET /v1/auth/list-sessions`, `POST /v1/auth/revoke-session`, `/revoke-sessions`, `/revoke-other-sessions` | Session list and revocation |
| `GET /v1/auth/ok` | Health of the auth routes |

A code has 6 digits, lasts 10 minutes, allows 5 attempts and is stored hashed. A session lasts 30 days,
is stored in the database, and the app sends its cookie in the `Cookie` header.

`GET /v1/me` (members only, 401 otherwise) answers the `MeResponse` of `packages/domain/src/api/publicTypes.ts`:
`{ profileId, email, firstName, lastInitial, memberSince: "YYYY-MM", professional: { id, status, displayName } | null }`.
It is never cached (`Cache-Control: private, no-store`).

### Audience

With a valid session, the public routes answer in clear (real names, descriptions, photos) with
`Cache-Control: private, no-store` and `Vary: Authorization, Cookie`. A member may read 600 records per hour.
Without a session the caller stays a visitor (blurred answers, see above).

### Test accounts

After `npm run db:seed -w @sialty/api` (the command lists them). Professionals (validated):
`jean.dupont@`, `marie.martin@`, `paul.leblanc@`, `sophie.durand@`, `lucas.bernard@sialty.test`.
Individuals: `particulier@sialty.test` and the request authors (`sophie.m@`, `karim.b@`, `alex.m@`, `ines.t@sialty.test`, ...).

### Try it (API on port 4000, Mailpit running)

```bash
# 1. Ask for a code
curl -s -X POST http://localhost:4000/v1/auth/email-otp/send-verification-otp \
  -H 'Content-Type: application/json' \
  -d '{"email":"particulier@sialty.test","type":"sign-in"}'

# 2. Read the code on http://localhost:8025, then sign in (cookie kept in a jar).
#    An existing account needs only email + otp; a new one also name + acceptTerms.
curl -s -c jar.txt -X POST http://localhost:4000/v1/auth/sign-in/email-otp \
  -H 'Content-Type: application/json' -H 'Origin: sialty://' \
  -d '{"email":"particulier@sialty.test","otp":"123456"}'

# 3. Who am I?
curl -s -b jar.txt http://localhost:4000/v1/me
```

## Data sources

See `apps/mobile/README.md` (French outlines: IGN, Licence Ouverte 2.0). French communes: geo.api.gouv.fr.

# Sialty

Mobile app connecting individuals with professionals.

## Layout

| Folder | Content |
|---|---|
| `apps/mobile` | React Native / Expo app (see its README) |
| `apps/api` | Node.js API (coming) |
| `packages/domain` | Rules shared by the app and the API (coming) |

The three are linked with npm workspaces: one `npm install` at the root installs everything.

## Commands (from the root)

```bash
nvm use            # Node 24, read from .nvmrc
npm install        # every workspace
npm run typecheck  # TypeScript in every workspace
npm test           # tests of every workspace
npm run mobile     # start the app (Expo, tunnel)
```

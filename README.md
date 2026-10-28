# Sialty — Frontend

Mobile app connecting individuals with professionals (plumbers, lawyers, hairdressers...).
React Native + Expo, TypeScript, React Navigation.

## Requirements

| Tool | Version | Notes |
|------|---------|-------|
| Node | 24 (see `.nvmrc`) | Expo 58 / React Native 0.88 require Node >= 22.13 |
| Expo Go | latest from the App Store / Play Store | embeds exactly one SDK: the project must match it |
| Expo account | same account in Expo Go and in the CLI | required by Expo Go since SDK 58 |

## Getting started

```bash
nvm use                      # Node 24 from .nvmrc
npm install
npx expo login --no-browser  # once; same account as Expo Go on the phone
npx expo start --tunnel      # tunnel is required under WSL
```

Scan the QR code with the iPhone Camera app (not Expo Go) and tap the "Open in Expo Go" banner.

Health checks before a commit:

```bash
npx expo-doctor
npx tsc --noEmit
```

## Stack

- Expo SDK 58, React Native 0.88, React 19.3, TypeScript 6.0
- React Navigation v7 (bottom tabs + native stack modals)
- `expo-location` (geolocation), `expo-linear-gradient`, `react-native-safe-area-context`
- Mock data only for now; backend (Node/Express + PostgreSQL) to come

## Architecture

Feature-based, singular feature names, `@/` alias to `src/`:

```
src/
├── app/navigation/     # RootStackNavigator (tabs + full-screen modals), TabNavigator
├── features/           # home, professional, annonce, offer, profile, favorites, messaging, search
│   └── <feature>/      # components, screens, services, hooks, data (mocks), types
├── shared/
│   ├── components/     # Reusable, prop-driven components (no business types inside)
│   ├── constants/      # colors, typography, spacing, strings (all user-facing text)
│   ├── hooks/ utils/ types/
└── stores/             # Redux (not implemented yet)
```

Rules: a feature never imports from another feature (except types); user-facing text lives in
`shared/constants/strings.ts`; design tokens come from `shared/constants`, never hardcoded hex values.

## Shared components

Detail screens (offer, annonce) are built from the same blocks:

- `ProfessionalRowCard` — "proposed by" row: avatar, online dot, verified pill, rating, chevron
- `MapPlaceholder` — static map stand-in (to be replaced by a real map, same `height` / `caption` contract)
- `DetailCtaBar` — bottom action bar: square secondary button + full-width primary button
- `OfferCard`, `AnnonceCard`, `ProfessionalCard`, `CategoryCard`, `SearchBar`, `FormInput`, `Button`

## Known limitations

- Likes, favorites and comments live in local screen state (lost on unmount) until the Redux store lands.
- Messaging opens a "coming soon" alert.
- `npm audit` reports 10 advisories, all inside Expo CLI / ngrok tooling, none shipped in the app bundle.

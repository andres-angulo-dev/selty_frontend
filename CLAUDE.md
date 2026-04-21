## Context Navigation

When you need to understand the codebase, or any files in this project:
1. ALWAYS query the knowledge graph first: `/graphify query "your question"`
2. Only read raw files if I explicitly say "read the file" or "look at the raw file"
3. Use `graphify-out/wiki-index.md` as your navigation entrypoint for browsing structure

## Rules
ALWAYS before making any change. Search on the web for the newest documentation.
And only implement if you are 100% sure it will work.


## Dev Commands
- start: `npm run start`

## Stack Rules (React Native / Expo)
- Expo managed workflow — check `app.json` for config changes
- Never `useNativeDriver: true` on layout properties (width, height, fontSize)
- Wrap FlatList in `<View style={{ flex: 1 }}>` — never in contentContainerStyle
- Feature-based structure: `src/features/<feature>/`
# CLAUDE.md — Sialty Frontend

> React Native / Expo project. This file extends the root `sialty/.claude/CLAUDE.md`.

---

## Dev Commands

```bash
# Start app (WSL — tunnel required, never --lan)
npx expo start --tunnel

# Install Expo-compatible dependency
npx expo install <package>

# Install standard npm dependency
npm install <package>
```

No test runner or linter configured yet.

---

## Architecture

```
src/
├── app/navigation/          # RootStackNavigator → TabNavigator + modals
├── features/                # Feature modules (singular names)
│   ├── home/
│   ├── professional/
│   ├── annonce/
│   ├── offer/
│   ├── profile/
│   ├── favorites/           # Scaffolded (placeholder)
│   ├── messaging/           # Scaffolded (placeholder)
│   └── search/              # Scaffolded (placeholder)
├── shared/
│   ├── components/          # Global reusable components
│   ├── constants/           # colors, typography, spacing, strings
│   ├── hooks/
│   └── utils/
└── stores/                  # Redux (not yet implemented)
```

**Import alias:** `@/` → `src/`  
**Rule:** Features never import directly from other features (except types)

---

## Navigation

```
RootStack (NativeStack — presentation: modal)
├── MainTabs (TabNavigator)
│   ├── Home → HomeStack
│   ├── Favorites → FavoritesStack
│   ├── Add → AddStack        # PRO only (not yet implemented)
│   ├── Messages → MessagesStack
│   └── Profile → ProfileStack
├── ProfessionalDetail        # Full-screen modal
├── OfferDetail               # Full-screen modal
├── AnnonceDetail             # Full-screen modal
└── CommentsModal             # Bottom sheet
```

**React Navigation v7:** use `aria-selected` not `accessibilityState.selected`  
Destructure: `'aria-selected': isSelected`

---

## Design System

All in `src/shared/constants/`:

| File | Purpose |
|------|---------|
| `colors.ts` | Brand palette, neutrals, semantic |
| `typography.ts` | Text styles (h1–h4, body, caption) |
| `spacing.ts` | 8px grid (xs=4, sm=8, md=16, lg=24, xl=32) |
| `strings.ts` | All user-facing text — never hardcode strings in components |

Import: `import { Colors, Typography, Spacing, Strings } from '@/shared/constants'`

---

## Key Patterns

### FlatList with ListHeaderComponent
Combines horizontal sections + vertical feed. Horizontal ScrollViews need `style={{ flexGrow: 0 }}`.  
Always wrap FlatList in `<View style={{ flex: 1, backgroundColor }}>` — never in `contentContainerStyle`.

### Animations
- `useNativeDriver: true` → transforms only (scale, translate, rotate)
- `useNativeDriver: false` → layout properties (width, height, fontSize)

### Pagination
`displayedCount` + `slice(0, displayedCount)` + `onEndReached` + `onEndReachedThreshold={0.5}`

### Mock data
Located in each feature's `data/` folder. Will migrate to `__mocks__/` before backend integration.

# Profile archive

Components replaced by the profile redesign of 2026-11-01. Nothing in the app imports them.

| File | Replaced by |
|------|-------------|
| `ProfileHeader.tsx` | `components/ProfileIdentityCard.tsx` |
| `ProfileSection.tsx` | `@/shared/components/MenuSection` |
| `ProfileMenuItem.tsx` | `@/shared/components/MenuRow` |
| `ProfileInfoItem.tsx` | none (personal data now lives in EditProfile only) |

They still type-check with the rest of the project, so they do not silently break.
Do not import them in new code.

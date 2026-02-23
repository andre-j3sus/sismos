# AGENTS.md — Coding Agent Guidelines for sismos-pt

## Project Overview

Real-time earthquake monitor for Portugal. React 19 SPA hosted on Cloudflare Workers,
displaying seismic data from IPMA (Instituto Portugues do Mar e da Atmosfera).

**Stack**: React 19, Vite 6, TypeScript 5 (strict), Tailwind CSS 4, Leaflet, Cloudflare Workers.

## Build & Dev Commands

```bash
npm run dev       # Local dev server (Vite + Workers)
npm run build     # Production build (SSR bundle + client bundle)
npm run preview   # Preview production build locally
npm run deploy    # Build + wrangler deploy to Cloudflare
npx tsc --noEmit  # Type-check only (no output)
```

**No linter, formatter, or test runner** is configured. Type-check with `npx tsc --noEmit`
before committing. Always verify `npm run build` succeeds.

## Project Structure

```
src/
  main.tsx              # React entry point (StrictMode + createRoot)
  App.tsx               # Root component — state orchestration, layout
  types.ts              # All domain types + DEFAULT_FILTERS constant
  utils.ts              # Pure utility functions (formatting, colors)
  i18n.ts               # PT/EN translations + useLocale hook
  index.css             # Tailwind + Leaflet overrides + custom CSS
  components/           # Flat directory, one component per file
    Header.tsx
    Footer.tsx
    FilterPanel.tsx
    EarthquakeMap.tsx
    EarthquakeList.tsx
    MagnitudeBadge.tsx
    RangeSlider.tsx
  hooks/                # Custom React hooks
    useEarthquakes.ts   # Data fetching, parsing, filtering, 5-min refresh
    useTheme.ts         # Dark/light with localStorage + OS preference
    useSearchParams.ts  # URL <-> state sync via history.replaceState
worker/
  index.ts              # Cloudflare Worker: IPMA API proxy with CORS
```

- No barrel files — all imports use direct file paths.
- Worker shares no code with `src/` — completely separate.
- Domain types centralized in `src/types.ts`, utilities in `src/utils.ts`.

## Code Style

### Imports

Three groups, no blank lines between them:

1. External/library imports (React, leaflet, react-leaflet)
2. Type imports using `import type` syntax
3. Internal value imports (components, hooks, utils)

Always use `import type` for type-only imports. If importing both types and values
from the same module, use separate import statements:

```ts
import type { TimeFilter, Filters } from "../types";
import { DEFAULT_FILTERS } from "../types";
```

### Naming Conventions

| Category           | Convention        | Example                              |
|--------------------|-------------------|--------------------------------------|
| Component files    | PascalCase.tsx    | `EarthquakeMap.tsx`                  |
| Hook files         | camelCase.ts      | `useEarthquakes.ts`                  |
| Utility files      | camelCase.ts      | `utils.ts`, `i18n.ts`               |
| Components         | PascalCase        | `EarthquakeMap`, `MagnitudeBadge`    |
| Hooks              | `use` prefix      | `useTheme`, `useSyncSearchParams`    |
| Helper functions   | camelCase         | `formatDate`, `getMagnitudeColor`    |
| Interfaces         | PascalCase        | `Earthquake`, `HeaderProps`          |
| Type aliases       | PascalCase        | `TimeFilter`, `Region`, `Locale`     |
| Constants          | UPPER_SNAKE_CASE  | `PORTUGAL_CENTER`, `CORS_HEADERS`    |
| Callback props     | `on` prefix       | `onSelect`, `onToggleTheme`          |

### Types

- Use `interface` for object shapes (props, API responses, domain models).
- Use `type` only for unions and aliases: `type Region = "continent" | "madeira" | "azores"`.
- Props interfaces are defined in the same file as the component, not exported.
- Explicit return types on utility/helper functions. Inferred return types on components and hooks.
- Exception: `useEarthquakes` has an explicit return type interface.

### Components

- **Always use `function` declarations** — never arrow functions for components.
- **Named exports** for all components: `export function Header(...)`.
- Only exception: `App.tsx` uses `export default function App()`.
- Props are always destructured in the function signature.
- Internal helper functions/components go above the exported component, unexported.

```ts
// Correct pattern:
function hasActiveFilters(filters: Filters): boolean { ... }

export function Header({ timeFilter, ...rest }: HeaderProps) {
  return <header>...</header>;
}
```

### Styling

- **Tailwind CSS v4** with CSS-first config (no `tailwind.config.js`).
- **Class-based dark mode**: `@custom-variant dark (&:where(.dark, .dark *))`.
- Every color utility must be paired with a `dark:` variant.
- Responsive: mobile-first with `sm:` and `lg:` breakpoints.
- Inline SVGs only (no icon library) — use `currentColor` with `w-X h-X`.
- Custom CSS in `index.css` for Leaflet overrides and range slider styling.
- Use `!important` only for Leaflet CSS overrides.

### i18n

- Homegrown system in `src/i18n.ts` — no library.
- Two languages: PT (default) and EN.
- All user-facing strings must go through the `t` translations object.
- When adding a new string: add to `Translations` interface, then to both `pt` and `en` objects.
- Locale persisted in localStorage, `<html lang>` attribute updated dynamically.

### Error Handling

- **Worker**: try/catch at top-level, return JSON error with appropriate HTTP status.
- **Frontend hooks**: try/catch/finally, store error as `string | null` in state.
- **UI**: Conditional rendering for loading -> error -> empty -> content states.
- **URL parsing**: Validate all inputs defensively with fallbacks to defaults.

### Comments

- JSDoc `/** */` on exported functions and types.
- Inline `{/* */}` for JSX section labels.
- `//` for implementation notes and rationale ("why", not "what").
- Section dividers in longer files: `// ── Section Name ──────────────`

### Commits

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

Format: `<type>(<optional scope>): <description>`

Common types:
- `feat`: new feature or functionality
- `fix`: bug fix
- `refactor`: code restructuring without behavior change
- `style`: formatting, whitespace, missing semicolons (not CSS)
- `docs`: documentation changes
- `chore`: build config, dependencies, tooling
- `a11y`: accessibility improvements
- `perf`: performance improvements

Examples:
```
feat: add dark mode toggle with OS preference detection
fix(worker): handle IPMA API timeout gracefully
a11y(header): add aria-labels to icon-only buttons
docs: update AGENTS.md with conventional commits guideline
chore: add .DS_Store to .gitignore
```

Keep descriptions concise (50-72 chars), lowercase, imperative mood, no period.

## Architecture Notes

- **No routing library** — SPA with URL search params via `history.replaceState`.
- **No state library** — React hooks only (useState, useMemo, useCallback, useEffect).
- **Map overlay pattern**: List panel overlays the map using `absolute` + `translate`.
  Map never resizes. Uses `z-[1000]` to render above Leaflet's internal layers.
- **IPMA API proxy**: Worker fetches from both IPMA endpoints (continent + Azores)
  in parallel, merges results. Avoids CORS issues.
- **Madeira detection**: Earthquakes from IPMA area 7 classified as Madeira if
  within expanded bounding box (lat 30-36, lon -20 to -14).
- **Shareable URLs**: Filters and selected earthquake persisted in search params.
  Only non-default values appear in URL. Uses `replaceState` (no history pollution).

## Key Constraints

- Always support both PT and EN — never hardcode user-facing strings.
- Always support both light and dark themes — pair every color with `dark:`.
- IPMA API has no auth but requires attribution. Data updates hourly on their end.
- The app auto-refreshes every 5 minutes.
- No tests exist yet. If adding tests, use Vitest (already compatible with Vite).

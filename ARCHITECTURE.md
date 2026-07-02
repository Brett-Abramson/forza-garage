# Architecture — Forza Garage

> Reference for design discussions. Paste this into Claude chat before working through a decision so it reasons about the real system. It's the map: how the app is structured, how data flows, and the conventions that constrain design choices. For exact implementation, read the code.

## What it is

A companion web app for **Forza Horizon 6**: browse the full car list, track an owned collection, tag/tune cars, and find the right car for each race type. A **public car database** plus an **auth-gated personal garage**.

## Stack

- **Next.js 15** (App Router) + **React 19**, TypeScript (strict)
- **Tailwind CSS** with project `fh-*` design tokens (CSS-variable based; light/dark)
- **Prisma 5** → **Postgres**: local Docker for dev (`docker-compose.yml`, host port 5433), **Neon** serverless in production
- **Clerk** auth (middleware + server `auth()`)
- **Server Actions** for all writes; thin **read-only API routes** for reads
- **Vercel** hosting · **Vitest** + Testing Library (~939 tests)
- A **Python scraper** (gitignored, lives outside the repo) → CSV → `prisma/upsert_cars.js`

## Directory map

```
src/
  app/                       App Router
    page.tsx                 Landing (hero + dashboard; hero at TTFB, dashboard streamed via Suspense)
    cars/                    Public car database   → GarageView
    garage/                  Auth-gated collection → GarageShowcase
    races/                   Race-type reference   → RacesView
    builds/                  Build/tuning guides   → BuildsView
    guide/                   Stats & Sims reference → StatsGuideView
    design/                  Living design-system page
    sign-in/                 Clerk
    api/cars/route.ts        GET all cars (public, read-only)
    api/cars/[id]/route.ts   GET one car (on-demand spec fetch for the drawer)
    layout.tsx, globals.css
  middleware.ts              Clerk route protection (/garage, /api/garage)
  components/                UI
  server/
    db.ts                    Prisma client
    auth.ts                  requireUserId() / UnauthorizedError
    actions/garage.ts        'use server' mutations — the ONLY write path
    dal/{cars,garage,meta}.ts  Data access (queries)
  lib/                       Domain logic + pure helpers
  types/car.ts               Car, FilterState, PI_CLASS_COLORS / PI_CLASS_HEX, getSourceColor
  __tests__/                 Vitest
prisma/
  schema.prisma              5 models
  upsert_cars.js             CSV → DB import (null-safe; never touches UserGarage)
  fh6-cars.csv, scraped_car_stats.csv
  migrations/
```

## Data model (`prisma/schema.prisma`)

- **Car** — the shared catalog (~618 rows). Identity (make/model/year/division/piClass/piRating/country/source), nullable drivetrain + engine fields, Page-1 bar stats (`statSpeed`…`statOffroad`, 0–10), Page-2 specs (`powerHp`/`torqueFtLb`/`weightLb`/`frontWeight`/`displacementL`), simulation results (`sim*` — 0-60, braking, lateral G, top speed), `value`/`rarity`. Unique on `(year, make, model)`. **Shared across all users — never user-specific.**
- **UserGarage** — one row per `(userId, carId)` a user owns. `notes`, `pinned`, and **per-user stat/spec overrides** (`statSpeedOverride` … `rarityOverride`). Editing in the garage writes here.
- **CarMeta** — race-type / PI-class meta rankings (leaderboard-derived), with `active`/`replacedAt` history. Powers the featured carousel.
- **CarTag** — tags on a `UserGarage` entry; `source` = `"auto"` | `"user"`.
- **UserPreferences** — one row per Clerk `userId`: `units` (English/Metric), `powerUnits` (hp/PS/kW), `springUnits`. Display-layer only — DB car data is always stored in English units.

## Routing & rendering

- **Server Components by default**; `'use client'` only where interactivity needs it. `next/dynamic({ ssr:false })` cannot be called directly in a server component — wrap it in a small client file.
- **Auth** (`middleware.ts`): `clerkMiddleware` + `createRouteMatcher(['/garage(.*)','/api/garage(.*)'])` → redirect to `/sign-in` when there's no `userId`. Everything else (`/`, `/cars`, `/races`, `/builds`, `/guide`) is public. `SKIP_AUTH_FOR_PREVIEW` is a dev-only gate bypass.
- Landing page is `force-dynamic`; the hero flushes at TTFB and the auth/stats/featured dashboard streams in under `<Suspense>`.

## Core data-flow patterns (the ones that shape design)

1. **List vs. drawer projection split.** `getCarsWithOwnership()` selects `LIST_SELECT` — everything the table and Stats-mode sort need, but **omits** `engineType`/`engineCC`/`cylinders`/`bodyStyle` (filled with `null` via `SPEC_DEFAULTS`). When the drawer opens it fetches `GET /api/cars/:id` (full row) to fill those in. So those fields being null in the list is **intentional, not a bug**. `powerHp`/`torqueFtLb`/`weightLb`/`frontWeight`/`displacementL` ARE in the list (Stats mode sorts on them). The 7 rankable sim metrics ride LIST_SELECT too (via `LIST_SIM_SELECT` from metrics.ts).
2. **Metrics registry.** `src/lib/metrics.ts` is the canonical source of truth for every rankable/displayable metric — 10 sim fields + power-to-weight. `sort.ts`, the Sim-view column set, the drawer's Simulation section, and CSV export all read from it. Metrics flag their direction (`lowerBetter`/`higherBetter`/`neutral`) and whether they must live in LIST_SELECT (`inList`). This eliminates duplicate metric definitions across the codebase.
3. **Ownership join in memory, no N+1.** One `car.findMany` + one `userGarage.findMany`, merged via a `Map`. Signed-out → pass `null`; all cars return `owned:false` with auto-tags derived from division and car stats (v3: stat-gated tags, e.g. RWD drift is division+handling gated; dirt/offroad/technical/drag earned from stats).
4. **Mutations = Server Actions only.** `src/server/actions/garage.ts` (`'use server'`): `setOwned`, `setTags`, `tuneCar`, `resetTuning`, `setNotes`, `setPinned`. Every one starts with `authorize()` = `requireUserId()` + `checkRateLimit(userId)`, validates input, calls the DAL, and returns a **discriminated result** `{ok:true,…} | {ok:false,error}` — it never throws across the network boundary. API routes are read-only; there is no REST write path.
5. **Per-user overrides.** `tuneCar` maps canonical fields (`statSpeed`, `powerHp`…) to `UserGarage.*Override` columns via `STAT_OVERRIDE_MAP`; `null` clears one. `resolveEffectiveStats()` (lib/statUtils) merges override → base so the UI shows the effective value while the override column records the source. **Editing a car in the garage never mutates the shared Car catalog.**
6. **Garage vs. database context in the UI.** Components detect "garage context" by the presence of the `onTagDetailsChange`/`onStatsChange` props (passed by `GarageShowcase`, not `GarageView`). That gates every editing affordance — the same `GarageDrawer` is read-only on `/cars` and editable in `/garage`.
7. **Caching.** `getCarCount` via `unstable_cache` (24h, tag `car-count`) — the count only changes on import; a redeploy or the 24h revalidate clears it. `getBadgeMatrix` (below) follows the same 24h/`unstable_cache` shape, tag `stat-percentiles`.
8. **Stat-percentile badges.** `statPercentiles.ts` ranks 14 metrics (6 bar stats, 5 sim fields, 3 specs) per PI class into a five-band system (top-strong/top-soft/neutral/bottom-soft/bottom-strong, 10%/20% thresholds, competition ranking with ties, 70% coverage floor). `getBadgeMatrix()` (dal/cars.ts) computes it once over the full catalog and merges per-car `CarBadgeMap` into `Car.badges` at the same server boundary as ownership. Green/red highlight rendering in `CarRow`/`StatBars` is separately gated by the `showStatHighlights` FilterState toggle (display-only; doesn't affect the "has a top badge" filter or drawer decoration).
9. **Unit preferences.** `UnitPreferencesProvider` (mounted in `layout.tsx`) hydrates from `UserPreferences` (signed-in, server-fetched) or `localStorage` (guests) and exposes `useUnitPreferences()`. `unitConversions.ts` is the only place display conversions happen — DB values and Server Action payloads stay in English units always. Any component reading power/weight/torque/speed/braking for display must go through it rather than hardcoding a unit label.
10. **Stat callouts & archetypes.** `statCallouts.ts` combines bar-stat rules with sim-derived callouts (top speed, braking, lateral grip, 0-60/0-100, aero/mech balance) and a synthesis layer that recognizes recurring archetypes (dirt car, point-and-squirt, fast-sweeper, top-end cruiser, heavy GT/saloon) to lead the drawer with one card instead of several fragmented ones. Thresholds are division-relative, not class-only, so strong-DNA divisions (e.g. Classic Muscle's weak braking) don't get misflagged. The dirt-archetype branch also catches a **"Street-tuned outlier"** case — a car in a typically offroad-heavy division whose own offroad stat reads weak-for-division (same gate as the low-offroad callout, factored into `offroadWeaknessForDivision()` so the two can't disagree) — so a division tag alone never asserts dirt competence the car's own numbers contradict.
11. **Guide content registry.** `statsGuideContent.ts` is the single source of truth for every stat/spec/sim definition (25 entries: identity, bar, spec, sim), each with a `short` gloss and a `long` page body keyed by a stable `id` that doubles as the `/guide#id` anchor. Both `StatsGuideView` (the reference page) and `StatInfoIcon` (tap-triggered bottom sheet, wired into `GarageDrawer`'s bar/spec/sim rows and `FilterSidebar`'s Sim Metrics filters) read from it — never duplicate this copy inline in a component.
12. **Portal floating UI, always.** Any hover/tap-triggered floating element (tooltip, bottom sheet) that can appear inside a scrollable or transformed ancestor — the garage drawer's `overflow-y-auto` body, in particular — gets portaled to `document.body` via `createPortal`, positioned from a measured `getBoundingClientRect()`, not left `position: absolute` inside its trigger. An in-flow tooltip near the top of a scrolling container gets silently clipped by that container's own overflow bounds; portaling sidesteps it entirely. `useHoverCard` (hover, 200ms show-delay, CSS `fh-fade-in` keyframe) and `BottomSheet` (tap, Esc/backdrop dismiss) are the two reusable implementations — build new floating UI on one of these rather than re-implementing the mechanics.

## Components (orientation)

- `/cars`: `GarageView` → `GarageViewClient` (table/grid + `FilterSidebar` + `CarRow`/`CarCard` + `GarageDrawer`)
- `/garage`: `GarageShowcase` → `GarageShowcaseClient` (same shell, editing enabled: pin/notes/tags/overrides)
- Shared: `GarageDrawer` (tabbed — Overview / Guide / Tags & Notes; Overview includes Simulation section with 10 sim metrics), `StatBars` (bar stats; `variant` + `showSpecs` props, optional `showInfo` for the drawer's per-stat `StatInfoIcon`), `StatHeader` (shared badge/highlight header for stat groups), `table-ui` (3-way mode toggle: Standard / Stats / **Sim**), `FilterSidebar` (incl. collapsible "Sim Metrics" range filters, each wired to a `StatInfoIcon`, and "Has a top badge" / "Has stat highlights" toggles), `MetaCarousel(Lazy)`, `Nav`, `UnitsNavButton` + `UnitSettingsToggle` (ruler-icon unit popover), `ThemeToggle`, `KeyboardNav`, skeletons.
- Homepage: `FeatureHighlights` (5 alternating feature rows + scope-disclaimer strip) / `FeatureLightboxImage` (hover magnifier + fullscreen lightbox). `Footer` carries the same nav links (Home/Car Database/My Garage/Races/Builds/Stats Guide) on every page.
- Reference pages: `RacesView`, `BuildsView`, `StatsGuideView` (7 sections in fixed doc order — Identity/Bar stats/Raw specs/Sim metrics/How the numbers relate/Reading a car in 30 seconds/Appendix — each metric card individually anchored for deep-links), `design/DesignSystem.client`.
- Guide/tooltip primitives: `StatInfoIcon` (tap-triggered, reads `statsGuideContent.ts` by id, opens a `BottomSheet` with a `/guide#id` link), `BottomSheet` (shared portal-to-`<body>` sheet chrome — handle bar, backdrop, Esc/close), `GuideToc` (persistent table of contents on `/guide`: sticky rail ≥`md`, sticky collapsed bar + `BottomSheet` below it, scroll-spy via `IntersectionObserver`, real `<a href="#id">` anchors so back/forward preserves scroll position), `useHoverCard` (hook — portaled, delayed hover tooltip used by `StatBars` and the drawer's spec/sim tiles; see pattern 12 above).

## Domain logic (`src/lib/`)

- `metrics.ts` — canonical metric registry (10 sim fields + power-to-weight); defines direction, unit, display precision, and LIST_SELECT membership; drives sort.ts, Sim-view, and drawer Simulation section.
- `races.ts` — `RACE_TYPES` (demands / avoid / PI sweet spot / drivetrain notes); `raceMatch.ts` — scores a car's tags into ranked race types.
- `autotags.ts` — division base tags + stat-gated extensions (v3): RWD drift is division+handling gated (≥7.0); dirt/offroad/technical/drag earned from car stats (via thresholds in `T`). `getAutoTags()` takes optional `AutoTagStats` (nulls degrade gracefully). `tags.ts` — the tag vocabulary.
- `tuningGuides.ts` / `buildGuides.ts` — static guide content per race-type / PI / division.
- `statCallouts.ts` — stat + sim-derived analysis (e.g. "power exceeds handling", archetype synthesis) with division-relative thresholds; `statUtils.ts` — override resolution, payload mapping, `StatFields`.
- `statPercentiles.ts` — five-band (top-strong/top-soft/neutral/bottom-soft/bottom-strong) per-PI-class percentile/rank badges across 14 metrics; feeds `Car.badges` (`CarBadgeMap`, defined in `types/car.ts` to avoid a circular import).
- `statsGuideContent.ts` — the `/guide` page content registry (see pattern 11): 25 `StatGuideEntry` records (identity/bar/spec/sim), each with `short`/`long`/optional `bullets`/`relatedStat`/`note`/`appendixRef`, keyed by a stable `id`. `entriesFor(category)` and `getStatGuideEntry(id)` are the only read paths; `BAR_GUIDE_ID` maps `Car` bar-stat field names to guide ids.
- `unitConversions.ts` — pure display-layer conversions (weight/power/torque/speed/braking); `UnitPreferences` type + `DEFAULT_PREFS`. DB values are always English; conversion happens only here.
- `filterCars.ts` / `sort.ts` — table filtering & sorting; sort is metric-driven (from registry, direction-aware, nulls last); `filterCars.ts` also handles the 5-field sim-metric range filters (null bound = no-op, null car value excluded when any bound is active). Plus `divisionGroups.ts`, `featuredCars.ts`, `exportCsv.ts`, `rateLimit.ts`.

## Theming & design tokens

- All color via CSS variables in `globals.css`, flipped under `[data-theme="dark"]` (`ThemeToggle`). Use Tailwind `fh-*` utilities (`fh-panel`, `fh-dark`, `fh-muted`, `fh-red`, `fh-border`, …) — don't introduce ad-hoc hex.
- **Dark mode is WCAG-AA-audited** (text ≥ 4.5:1). Red **text** uses `var(--fh-red-fg)` (not `text-fh-red`/`#CC0000`, which is only ~3:1 on dark); `bg-fh-red` stays the brand **fill**. `fh-blue`/`fh-purple` have brighter dark overrides. The garage drawer header is a fixed `#1E1A14` (not `bg-fh-dark`, which inverts in dark mode).
- PI-class colors: `PI_CLASS_COLORS` (Tailwind class strings, for badges) and `PI_CLASS_HEX` (raw hex, for the drawer's accent stripe).
- `globals.css` also sets `html { scroll-behavior: smooth }` (site-wide — real `<a href="#id">` anchor jumps, e.g. `GuideToc`, animate without JS and without disturbing browser history) and a `.fh-fade-in` keyframe utility for portaled floating UI (see pattern 12).

## Data pipeline

`prisma/fh6-cars.csv` (hand-maintained car list) + `scraped_car_stats.csv` (sim stats, from a scraper that lives outside the repo) are joined on year + make + model and loaded by `node prisma/upsert_cars.js` — one transaction, **null-safe** (never overwrites a non-null value with null), and it **never touches UserGarage**. Never use `prisma db seed` for data.
- **Known source-data quirk**: the scraper's source (forza.labsgg.com) serves stale Simulation Results (0-60, top speed, braking, lateral G) on Forza Edition variant pages — Power/Weight and the 0-10 bars are correct, but sim numbers barely move even when FE power is 2-8x the base car's. Since `upsert_cars.js`'s null-safe coalesce can't *correct* a bad non-null value, the fix is a one-off script (`prisma/null_fe_sim_stats.js`) that explicitly nulls the affected `Sim_*` fields for known FE rows, run against the DB directly (with a Neon restore point first, per the DB-writes convention below).

## Conventions & constraints (these shape design choices)

- **DB writes**: schema change → `npx prisma migrate dev` locally, then `npx prisma migrate deploy` to prod once verified. Run production data scripts against the direct connection, take a Neon restore point first, and `UPDATE` rather than `DELETE` unless explicitly scoped.
- **Never overwrite a non-null DB value with null** from an import/scrape — skip the field instead.
- **Protect UserGarage data** — catalog edits and imports must never clobber per-user rows.
- **Every mutation** validates the Clerk session + rate-limits (`authorize()`); API errors return sanitized `{ error }` only; Prisma typed queries only (no raw SQL string-building).
- Keep client bundles small (Server Components are the default).
- A change isn't done until `npx vitest` and `npx tsc --noEmit` pass; update tests in the same change when behavior or DOM shifts.
- The browser preview server isn't usable in this setup — verify via tsc + tests, not a live preview.

## Testing

Vitest + Testing Library. Mutations are mocked at the Server Action module; the drawer's spec GET (`/api/cars/:id`) is the only real fetch (stubbed). When asserting on content that lives behind a drawer tab, activate the tab first. `setup.ts` also stubs `IntersectionObserver` (jsdom has none) as a no-op, for scroll-spy components like `GuideToc`. Tests that assert on a `useHoverCard`/`setTimeout`-delayed tooltip need `vi.useFakeTimers()` **and** must wrap `vi.advanceTimersByTime()` in `act()` — without `act()`, the resulting state update won't flush before the assertion runs.

When a background session is active, its worktree lives under `.claude/worktrees/` **inside** the main tree — `npx vitest run` with no path then picks up test files from that worktree too, double-counting results. Scope to `npx vitest run --dir src`, or check `git worktree list` first, if the numbers look off.

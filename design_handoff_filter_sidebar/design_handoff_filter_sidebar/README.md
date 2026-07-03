# Handoff: Filter Sidebar (Car Database & My Garage)

> **Status: Implemented.** This redesign has shipped on both `/cars` and `/garage`. This doc
> is kept as the as-built reference — the sections below describe the original design intent
> plus notes on how the shipped implementation differs (component names/paths moved, a few
> fields were added, one "recommended but optional" piece was dropped). See **"Implementation
> notes"** at the end for the diff against the original prototype handoff.

## Overview
Previously the **Car Database** (`/cars`) and **My Garage** (`/garage`) pages rendered all of
their filtering UI in a **sticky horizontal "filter bank"** that sat under the top nav and
stayed pinned while the user scrolled the results. It stacked 4–5 rows — division-group chips,
six `<select>` dropdowns, source chips, a Tags/Race-type mode toggle, and the chip set — which
consumed **~250–350px of vertical height** on every scroll and crowded the results grid.

This redesign **moved all filtering into a collapsible left sidebar** and keeps a **slim top
bar** for global nav + search + view toggle. The result: filters are always reachable but the
results area reclaims the full viewport height.

The shipped direction is **"Compact rail + More filters"** (referred to as Variant C in the
prototype): the most-used filters are always visible in the rail; secondary filters live behind
a single "More filters" disclosure (plus a separate "Sim Metrics" disclosure, added post-handoff)
to keep the rail short.

## About the Design Files
The files in this bundle are **design references built in HTML + React (via in-browser Babel)** —
the original working prototype that demonstrated the intended layout, interactions, and exact
styling. They were **not** production code and were **not** ported verbatim — the target app is
**Next.js (App Router) + TypeScript + Tailwind**, and the shipped version was built using the
codebase's existing components, tokens, and patterns.

Open `Filter Sidebar Explorations.html` to interact with the original prototype. The dark strip
at the very top ("Page / Theme") is **prototype tooling, not part of the product**.

## Fidelity
**High-fidelity, with minor evolution during implementation.** Colors, typography, and
interaction model match the codebase's design tokens (`src/app/globals.css`) and the `fh-*`
Tailwind color scale. A handful of measurements (sidebar width, drawer width) shipped slightly
narrower than the original spec — see the measurements table below, which now reflects shipped
values.

---

## What changed, file by file (as shipped)

### 1. `src/components/layout/Nav.tsx` — slim top bar
Keeps its original responsibilities, hosting the search box and grid/table toggle via the
`NavControls` context on `/cars` and `/garage`. Two additions, as planned:

- **Sidebar toggle button** (`PanelLeftIcon`) at the far left, before the hamburger/brand.
  `p-1.5 rounded-md text-fh-muted` → hover `text-fh-dark-2 bg-fh-panel-2`.
- **Active-filter count badge** on that toggle — a small red pill (`-top-1 -right-1`) showing
  `activeFilterCount`, rendered **only when `sidebarOpen` is false**.

The toggle reads/writes `sidebarOpen` from the shared `NavControls` context (see State
Management). `showControls` (search + view toggle) is unchanged and still gated to
`/cars` and `/garage`.

### 2. Page-level components — **two** components, not one
The original handoff assumed a single shared `GarageView.tsx` engine for both pages with an
`isGarage` prop. As shipped, the two pages diverged into **separate top-level components** that
both compose the same `FilterSidebar`:

- **`src/components/cars/GarageView.tsx`** — powers `/cars` (via
  `src/components/cars/GarageViewClient.tsx`, a `next/dynamic(ssr:false)` wrapper). Renders
  `<FilterSidebar isGarage={false} … />`.
- **`src/components/garage/GarageShowcase.tsx`** — powers `/garage` (via
  `GarageShowcaseClient.tsx`). Renders `<FilterSidebar isGarage={true} … />`. This component
  also owns garage-only features that postdate the original handoff: pin/favourite (star column,
  `setPinned`), CSV export (`src/lib/exportCsv.ts`), and its own sort-column set
  (`GARAGE_SORT_COLUMNS` vs. `STANDARD_SORT_COLUMNS` in `table-ui.tsx`).

Both components removed the old sticky filter bank and restructured their return into the
planned two-column layout (`<div className="flex items-start min-h-screen">` wrapping
`<FilterSidebar>` + a `flex-1 min-w-0` main column with header, progress bar, and results).
Window/row virtualizers, `CarCard`/`CarRow`, `GarageDrawer`, and `BackToTop` were kept as-is —
only the filter chrome relocated.

> **Sort:** unchanged from the plan — the table sorts via the clickable `SortTh` headers in
> `table-ui.tsx` only. No sort dropdown was added; `SortSelect` (mobile-only, shown when columns
> are hidden below a width breakpoint) selects a column to sort by, it doesn't replace header
> sorting.

### 3. `src/components/car/FilterSidebar.tsx` — the rail (single shared component)
One client component serves **both** pages (`isGarage` + `isSignedIn` props switch the
garage-status vs. favourites blocks). Unlike the original plan, this component **absorbed**
`FilterBar.tsx` and `DivisionGroupFilter.tsx` outright — neither exists as a separate file
in the shipped codebase; their `<select>`/chip markup was inlined directly into
`FilterSidebar.tsx`.

**Structure (top → bottom), as shipped:**

1. **Header row** — `FILTERS` label (uppercase, icon) + active count badge; **"Clear all"**
   text button when `activeFilterCount > 0`, wired to `clearAllFilters`.
2. ~~Active-filter pills~~ — **not implemented.** The prototype's per-facet removable pill row
   was marked optional in the original handoff and was dropped in favor of the per-item chips
   already present in the Make block (each selected make renders as its own removable chip) and
   the "Year" decade chips toggling off on re-click. There is no single consolidated pill strip
   summarizing every active facet.
3. **Always-visible primary blocks:**
   - **Class** — `PI_CLASS_ORDER` values, but rendered as a **7-column grid** of square buttons
     (not free-wrapping chips) so D…R always stay on one row at sidebar width. Active class fills
     with its `PI_CLASS_COLORS` background + red ring.
   - **Make** *(added — not in original spec's "always visible" list)* — a `<select>` plus
     removable chips for each selected make. Multi-select, unlike the plan's single dropdown.
   - **Stat highlights toggle** *(added)* — a small switch controlling `showStatHighlights`.
   - **Year** *(added)* — decade quick-chips (derived from the dataset's actual decades) plus a
     custom From/To numeric range (`YearRange`), committed on blur/Enter.
   - **Category** — `DIVISION_GROUPS` chips; selecting a group reveals its division sub-chips.
     Multi-select (`selectedGroupIds: string[]`, OR logic), not the single `selectedGroupId` the
     original doc described.
   - **Race type** — `RACE_TYPES` chips, amber active state, matches the plan. Multi-select
     (`selectedRaceIds: string[]`); when exactly one race is active, a summary card shows its
     surface type.
   - **Garage status** — `All / Owned / Not owned` segmented control. Renders only when
     `!isGarage && isSignedIn` — i.e. `/cars` while signed in. (The plan's `hideOwned` prop
     through `FilterBar` doesn't apply since `FilterBar` no longer exists; the equivalent gating
     is the `isGarage`/`isSignedIn` conditional directly in `FilterSidebar`.)
   - **Favourites** *(added, garage-only)* — `isGarage && pinnedCount > 0` shows a "Show only
     favourites" toggle wired to `filters.pinned`.
   - **Badges** *(added)* — a "Has stat highlights" toggle wired to `filters.hasTopBadge`.
4. **"Sim Metrics" disclosure** *(added — not in original spec)* — shown only when
   `hasSimData` is true for the current result set. Expands to five numeric min/max range
   inputs (0–60, 0–100, Braking 60–0, Lateral G, Top Speed), each with a `StatInfoIcon` guide
   link. Auto-opens if any sim filter is already active.
5. **"More filters" disclosure** — matches the plan, minus Make (promoted to primary, see
   above):
   - **Drivetrain** — `AWD / RWD / FWD` segmented control.
   - **Country** — `<select>`.
   - **Source** — `SOURCE_CHIPS` chips.
   - **Tags** — `AUTO_TAGS` chips.
   Auto-opens if any of these is already active.

**Collapse behavior — matches the plan:**
- **Desktop (≥900px):** collapsed → sidebar column unmounts, `<main>` takes full width. Nav
  toggle (with count badge) brings it back.
- **Mobile (<900px):** off-canvas drawer, fixed-position, slides in over a black scrim
  (shipped at `bg-black/50`, slightly darker than the spec's `.45` alpha). Scrim click closes it;
  `isMobile` is tracked via `matchMedia('(max-width: 900px)')`.

---

## Layout & measurements (as shipped)

| Token | Spec value | Shipped value |
|---|---|---|
| Slim top bar height | 48px (`h-12`) | 48px (`h-12`) — unchanged |
| Sidebar width | 316px | **280px** (`w-[280px]`) |
| Sidebar position | sticky, top 48px, `calc(100vh - 48px)` | matches: `sticky top-12 h-[calc(100vh-48px)] overflow-y-auto` |
| Sidebar border | `1px solid var(--fh-border)` on the right | matches (`border-r`) |
| Drawer breakpoint | max-width 900px | matches |
| Drawer width / scrim | 320px / `rgba(0,0,0,.45)` | **300px** (`w-[300px]`) / `bg-black/50` |
| Drawer transition | `transform .26s cubic-bezier(.4,0,.2,1)` | matches (`duration-[260ms] ease-out`) |
| Main content padding | 22/26/80 desktop, 18/16/80 mobile | `px-6 pt-6 pb-20` (24/24/80) — close, not pixel-exact |
| Results grid | `repeat(auto-fill, minmax(196px,1fr))` | responsive Tailwind grid (2/3/4/5 cols by breakpoint via `calcColumns()`), not a literal `auto-fill` grid |

**Sidebar internals** — chip, segmented-control, and active-pill treatments (colors, radii,
active states) match the spec's token usage (`--fh-red`, `--fh-red-pale`, `--fh-amber`, etc.)
closely enough that they weren't worth re-diffing line by line; check `FilterSidebar.tsx`
directly if you need exact Tailwind classes for a given control.

---

## Interactions & Behavior
- **Toggle sidebar:** Nav button flips `sidebarOpen`. Desktop collapses the column; mobile
  opens/closes the drawer. Count badge shows on the toggle only while collapsed. Matches plan.
- **Filter chips / selects:** call the same setters as before (`setFilters`, `handleGroupChange`,
  `handleDivisionChange`, `toggleTag`, `toggleRace`, `clearAllFilters`). URL-sync covers `?q`,
  `?class`, `?group`, `?div`, `?make`, `?drive`, `?country`, `?src`, `?owned`, `?ymin`, `?ymax`,
  `?tags`, `?race`, `?view` (see `GarageView.tsx`'s URL-sync effect). There is no `?mode` param —
  the old Tags/Race "mode toggle" from the sticky filter bank doesn't exist in the sidebar; Tags
  and Race type are both always-addressable (Tags under "More filters", Race type as its own
  primary block) rather than mutually exclusive modes.
- **Race-type selection:** OR/inclusion logic via `selectedRaceIds`/`activeRaces`, matches plan.
- **Clear all:** resets `filters` to `DEFAULT_FILTERS` plus clears `selectedGroupIds`,
  `selectedTags`, `selectedRaceIds`. No per-facet pill clearing exists (see "not implemented"
  note above) beyond what the Make/Year controls already offer natively.
- **Sorting:** unchanged — clickable `SortTh` headers only.
- **Garage page:** doesn't need a `hideOwned` prop/forced `filters.owned = 'all'` workaround as
  originally planned — `/garage`'s car list (`getGarageCars`) is already scoped to owned cars
  server-side, and `FilterSidebar` simply doesn't render the Garage-status block when
  `isGarage` is true.
- **Transitions:** matches plan (drawer slide, chip/segment color transitions). No explicit
  `prefers-reduced-motion` handling was found in `FilterSidebar.tsx` — worth a follow-up if that
  matters for this codebase's a11y bar.

## State Management
- `filters: FilterState`, `selectedGroupIds: string[]`, `selectedTags: Set<string>`,
  `selectedRaceIds: string[]`, `view`, `sort` — live in `GarageView` / `GarageShowcase`.
- `sidebarOpen: boolean` — lives in the page component and is **lifted into `NavControls`**
  (the cleaner option the original doc called out), alongside `search`, `view`, and
  `activeFilterCount`. See `src/context/NavControls.tsx`. Default is `true`, flipped to `false`
  on mount if `matchMedia('(max-width: 900px)')` matches.
- `activeFilterCount` is computed in the page component (a boolean array of every active facet,
  `.filter(Boolean).length`) and passed through both to `NavControls` (for the toggle badge) and
  directly to `FilterSidebar` (for the header badge).

## Design Tokens
Unchanged from the plan — nothing new was defined; existing `fh-*` Tailwind tokens from
`src/app/globals.css` / `tailwind.config.ts` were reused throughout, including
`PI_CLASS_COLORS` (`src/types/car.ts`) and `DIVISION_ACCENT` (`src/components/car/CarCard.tsx`).
Both light + dark themes are supported via `[data-theme="dark"]`, consistent with the rest of the
app (dark mode is AA-contrast audited — see project conventions for red-text tokens specifically).

## Assets
None new. Nav/race icons are inline SVGs in `Nav.tsx` and `RaceIcons.tsx`. Emoji for
division-group and race chips come from `DIVISION_GROUPS` (`src/lib/divisionGroups.ts`) and
`RACE_TYPES` (`src/lib/races.ts`).

## Source data referenced (current paths)
- `src/types/car.ts` — `FilterState`, `PI_CLASS_ORDER`, `PI_CLASS_COLORS`, `SOURCE_CHIPS`
- `src/lib/divisionGroups.ts` — `DIVISION_GROUPS`, `getDivisionsForGroup`
- `src/lib/tags.ts` — `AUTO_TAGS`, `CAR_TAGS`
- `src/lib/races.ts` — `RACE_TYPES`, `RaceType`
- `src/lib/filterCars.ts` — `filterCars`, `DEFAULT_FILTERS` (shared filtering logic + defaults,
  didn't exist as a named module in the original handoff)
- `src/lib/metrics.ts` — `SIM_COLUMN_METRICS` (drives the Sim Metrics sidebar section + sim table
  columns)
- `src/components/car/FilterSidebar.tsx` — the rail itself (single component; `FilterBar.tsx` and
  `DivisionGroupFilter.tsx` no longer exist separately)
- `src/context/NavControls.tsx` — carries `sidebarOpen` alongside `search`/`view`/`activeFilterCount`

## Implementation notes (diff vs. original handoff)
For future readers comparing this doc to the prototype bundle:
1. **Two page components, not one.** `/cars` → `GarageView.tsx`; `/garage` → `GarageShowcase.tsx`.
   They diverged rather than staying a single `isGarage`-switched component, because `/garage`
   grew garage-only features (favourites/pin, CSV export, a different sort-column set) that don't
   apply to `/cars`. Both still share the one `FilterSidebar`.
2. **`FilterBar.tsx` / `DivisionGroupFilter.tsx` were never split out** — their markup lives
   inline in `FilterSidebar.tsx`.
3. **Fields added post-handoff:** Year (decade chips + range), Sim Metrics (5 numeric ranges),
   Stat-highlights toggle, Badges toggle, Favourites (garage-only). Make was promoted from "More
   filters" to an always-visible primary block and made multi-select.
4. **Fields/concepts dropped:** the consolidated "active-filter pills" strip (optional in the
   original spec), the Tags/Race "mode toggle" (both are independent controls now), the `?mode`
   URL param, the `hideOwned` prop pass-through.
5. **Measurements that shipped narrower than spec:** sidebar 280px (not 316px), drawer 300px
   (not 320px). Everything else in the measurements table matches or is close enough not to
   matter.

## Files in this bundle (original design reference — historical)
- `Filter Sidebar Explorations.html` — the interactive prototype (open this first)
- `forza-styles.css` — original prototype styling; source of the original measurements/token
  usage referenced above
- `forza-sidebars.jsx` — the original rail prototype; `SidebarC` was the chosen direction (A & B
  are earlier alternatives, kept for context only)
- `forza-shared.jsx` — original slim top bar, car card, sortable table, results region prototype
- `forza-data.js` — original sample cars + filter constants mirrored from the codebase at the
  time of handoff (now superseded by the real `src/lib`/`src/types` modules listed above)

# Handoff: Filter Sidebar (Car Database & My Garage)

## Overview
Today the **Car Database** (`/cars`) and **My Garage** (`/garage`) pages render all of their
filtering UI in a **sticky horizontal "filter bank"** that sits under the top nav and stays
pinned while the user scrolls the results. It stacks 4–5 rows — division-group chips, six
`<select>` dropdowns, source chips, a Tags/Race-type mode toggle, and the chip set — which
consumes **~250–350px of vertical height** on every scroll and crowds the results grid.

This redesign **moves all filtering into a collapsible left sidebar** and keeps a **slim top
bar** for global nav + search + view toggle. The result: filters are always reachable but the
results area reclaims the full viewport height.

The chosen direction is **"Compact rail + More filters"** (referred to as Variant C in the
prototype): the most-used filters are always visible in the rail; secondary filters live behind
a single "More filters" disclosure to keep the rail short.

## About the Design Files
The files in this bundle are **design references built in HTML + React (via in-browser Babel)** —
a working prototype that demonstrates the intended layout, interactions, and exact styling. They
are **not production code to drop in**. The target app is already **Next.js (App Router) +
TypeScript + Tailwind**, so the task is to **recreate this design using the codebase's existing
components, tokens, and patterns** — reusing `FilterBar`, `DivisionGroupFilter`, the `NavControls`
context, the `fh-*` Tailwind tokens, and the existing `SortTh` table headers rather than porting
the prototype's CSS verbatim.

Open `Filter Sidebar Explorations.html` to interact with it. The dark strip at the very top
("Page / Theme") is **prototype tooling, not part of the product** — ignore it when implementing.

## Fidelity
**High-fidelity.** Colors, typography, spacing, and interactions are final and pull directly from
the codebase's design tokens (`src/app/globals.css`). Recreate the UI to match, using the existing
Tailwind `fh-*` color scale and component classes (`.fh-nav-link`, `.btn-clip`, etc.).

---

## What changes, file by file

### 1. `src/components/Nav.tsx` — slim top bar (keep, lightly extend)
The top bar **stays** and keeps its current responsibilities. It already hosts the search box and
grid/table toggle via the `NavControls` context on `/cars` and `/garage` — **keep search in the top
bar** (this satisfies "search always visible"). Two additions:

- **Sidebar toggle button** at the far left (before the brand). Icon: a "panel-left" glyph
  (rectangle with a vertical divider near the left edge). 30×30px, `rounded-md`, `border-fh-border`,
  `text-fh-muted` → hover `text-fh-dark bg-fh-panel-2`.
- **Active-filter count badge** on that toggle — a small red pill (top-right, `-5px/-5px`) showing
  the number of active filters, **only when the sidebar is collapsed** so the count isn't lost.

The toggle drives a shared "filters open" state (see State Management). On `/cars` and `/garage`
the existing `showControls` cluster (search + view toggle) remains in the bar unchanged.

### 2. `src/components/GarageView.tsx` — remove the sticky filter bank
This component is the shared engine for both `/cars` and `/garage`.

**Remove** the block currently commented `{/* ── Sticky filter bank ── */}` — the
`<div className="sticky top-12 z-10 …">` that wraps `DivisionGroupFilter`, `FilterBar`, the source
chips, and the Tags/Race mode toggle. **Do not delete** those child components — they move into the
new sidebar.

**Restructure** the return into a two-column layout under the slim nav:

```
<div className="flex items-start">
  <FilterSidebar … />                {/* new — see below; collapsible */}
  <main className="flex-1 min-w-0 …"> {/* existing header + progress + results */}
    <header>…</header>               {/* "Car Database" / "My Garage" + progress bar — unchanged */}
    <div className="results-bar">…</div>
    {/* grid / table results — unchanged, incl. virtualizers */}
  </main>
</div>
```

Keep the window virtualizers, `CarCard`/`CarRow`, `GarageDrawer`, and `BackToTop` exactly as they
are. Only the **filter chrome** relocates.

> **Note on sort:** the table already sorts via the clickable `SortTh` headers in `table-ui.tsx` —
> **keep that as the only sort mechanism.** Do **not** add a sort dropdown. (The prototype's
> "Sort: Default" select was a scratch control that has been removed to match current behavior.)

### 3. `src/components/FilterSidebar.tsx` — NEW component (the rail)
A new client component holding the Variant C rail. It receives the same props/state the filter
bank used (`filters`, `options`, `selectedGroupId`, `selectedTags`, `selectedRace`, `filterMode`,
the setters, and `activeFilterCount`) and is purely presentational over them.

**Structure (top → bottom):**

1. **Header row** — `FILTERS` label (uppercase, 13px/700, with a filter icon) + active count
   badge; a **"Clear all"** text button on the right when `activeFilterCount > 0`
   (wired to the existing `clearAllFilters`).
2. **Active-filter pills** — removable chips summarizing every active facet (Class, Category,
   Division, Make, Drivetrain, Country, Source, Garage, each Tag, Race). Clicking a pill clears just
   that facet. (Optional but recommended — it's what makes the compact rail legible.)
3. **Always-visible primary blocks** (each: 10.5px/700 uppercase label + control):
   - **Class** — the 7 `PI_CLASS_ORDER` values as toggle chips. Active chip uses the
     `PI_CLASS_COLORS` background for that class.
   - **Category** — the `DIVISION_GROUPS` as chips (reuse `DivisionGroupFilter`). Selecting a group
     reveals its division sub-chips, exactly as today.
   - **Race type** — the `RACE_TYPES` chips (reuse the race branch of the current mode UI). Active
     state uses amber (`amber-500/20 text-amber-400`).
   - **Garage status** — `All / Owned / Not owned` segmented control. **Render this block only on
     `/cars`.** On `/garage` it is redundant (the user is already viewing owned cars) — **hide it**
     and pass the existing `hideOwned` prop through `FilterBar`.
4. **"More filters" disclosure** — a single full-width button (`bg-fh-panel-2`, `rounded-lg`) with a
   chevron and its own count badge. Expands to reveal the secondary filters:
   - **Make** — `<select>` (reuse the `Select` from `FilterBar.tsx`).
   - **Drivetrain** — `AWD / RWD / FWD` segmented control. (Moved here from primary.)
   - **Country** — `<select>`.
   - **Source** — the `SOURCE_CHIPS` as chips.
   - **Tags** — the `AUTO_TAGS` as chips.

**Collapse behavior:**
- **Desktop (≥900px):** when collapsed, the sidebar column is removed and `<main>` takes full width.
  The Nav toggle (with count badge) brings it back.
- **Mobile (<900px):** the sidebar becomes an **off-canvas drawer** (`position: fixed; left: 0;
  transform: translateX(-100%)`, slides in on open) over a 45%-black scrim. Esc or scrim-click
  closes it.

---

## Layout & measurements (hifi)

| Token | Value |
|---|---|
| Slim top bar height | **48px** (`h-12`) — unchanged |
| Sidebar width | **316px** |
| Sidebar position | `sticky`, top = `48px` (nav height), `height: calc(100vh - 48px)`, internal `overflow-y: auto` |
| Sidebar border | `1px solid var(--fh-border)` on the right |
| Main content padding | `22px 26px 80px` desktop; `18px 16px 80px` mobile |
| Results grid | `repeat(auto-fill, minmax(196px, 1fr))`, `gap: 14px` |
| Drawer breakpoint | `max-width: 900px` |
| Drawer width / scrim | `320px` / `rgba(0,0,0,.45)` |

**Sidebar internals**
- Section label: 10.5px, 700, `uppercase`, `letter-spacing: .1em`, `var(--fh-muted)`, 8px bottom margin.
- Chip: `padding 5px 10px`, `border-radius 999px`, 12px/500, `border 1px var(--fh-border)`,
  `bg var(--fh-panel)`, `color var(--fh-muted)`. Hover → `color var(--fh-dark)`,
  `border var(--fh-muted-2)`. Active → `bg var(--fh-red-pale)`, `color var(--fh-red)`,
  `border var(--fh-red)`. Amber (race) active → `bg var(--fh-amber-pale)`, `color var(--fh-amber)`,
  `border var(--fh-amber)`.
- Class chip: `38×30px`, `radius 7px`, 12px/700; active fills with the class color from
  `PI_CLASS_COLORS`.
- Sub-division chip: `padding 3px 9px`, 11px, same active treatment as chips.
- Segmented control: `bg var(--fh-panel-2)`, `border var(--fh-border)`, `radius 8px`, `padding 3px`;
  buttons 12px/600 `var(--fh-muted)`; active button `bg var(--fh-panel)`, `color var(--fh-red)`,
  subtle shadow.
- Active pill (removable): `border 1px var(--fh-red)`, `bg var(--fh-red-pale)`, `color var(--fh-red)`,
  11px/500, trailing ✕.
- "More filters" button: `bg var(--fh-panel-2)`, `border var(--fh-border)`, `radius 9px`,
  `padding 10px 8px`, 12.5px/600.
- Toggle count badge: `min-width 15px; height 15px; bg var(--fh-red); color #fff; 9px/700;
  border 1.5px var(--fh-panel)`.

---

## Interactions & Behavior
- **Toggle sidebar:** Nav button flips the open/collapsed state. Desktop collapses the column;
  mobile opens/closes the drawer. Show the count badge on the toggle only while collapsed.
- **Filter chips / selects:** identical semantics to today — they call the same setters
  (`setFilters`, `handleGroupChange`, `handleDivisionChange`, `toggleTag`, `toggleRace`,
  `switchMode`). All existing URL-sync (`?q`, `?class`, `?group`, `?div`, `?make`, `?drive`,
  `?country`, `?src`, `?owned`, `?tags`, `?race`, `?mode`, `?view`) is unchanged.
- **Race-type selection:** selecting a race uses the existing OR/inclusion logic via
  `selectedRace`/`activeRace` (a car matches if it has ANY of the race's `recommendedTags`).
- **Clear all:** existing `clearAllFilters`. Individual active pills clear a single facet.
- **Sorting:** unchanged — clickable `SortTh` headers (asc ⇄ desc, arrow indicator) in table view.
- **Garage page:** hide the Garage-status block and pass `hideOwned`; when the user lands on or
  switches to `/garage`, ensure `filters.owned` is forced to `'all'` so a stale `not-owned` value
  doesn't hide their whole collection.
- **Transitions:** drawer slide `transform .26s cubic-bezier(.4,0,.2,1)`; chip/segment color
  changes `~120–150ms`. Respect `prefers-reduced-motion`.

## State Management
Reuse the existing `GarageView` state — nothing new is required except the sidebar open flag:
- `filters: FilterState`, `selectedGroupId`, `selectedTags: Set<string>`, `selectedRace`,
  `filterMode`, `view`, `sort` — all already present.
- **New:** `sidebarOpen: boolean`. Default `true` on desktop, `false` on mobile (`matchMedia`).
  It can live in `GarageView` and be passed to both `Nav` (via `NavControls`, alongside the existing
  search/view registration) and `FilterSidebar`, OR be lifted into the `NavControls` context so the
  Nav toggle and the sidebar share it. Lifting into `NavControls` is the cleaner fit since the toggle
  lives in `Nav` and the panel lives in the page.
- `activeFilterCount` is already computed in `GarageView` — reuse it for the badge.

## Design Tokens
**Do not redefine these — they already exist in `src/app/globals.css` and `tailwind.config.ts`.**
Use the Tailwind `fh-*` classes. Key tokens referenced by this design:

- Accent: `--fh-red #CC0000`, `--fh-red-pale rgba(204,0,0,0.07)`, `--fh-red-border rgba(204,0,0,0.2)`
- Amber (race): `--fh-amber #B87010` (dark `#D4920A`), `--fh-amber-pale`
- Surfaces: `--fh-bg`, `--fh-bg2`, `--fh-panel`, `--fh-panel2`
- Text: `--fh-dark`, `--fh-dark2`, `--fh-muted`, `--fh-muted2`
- Lines: `--fh-border`, `--fh-border2`
- PI class colors: `PI_CLASS_COLORS` in `src/types/car.ts`
- Division accents: `DIVISION_ACCENT` in `src/components/CarCard.tsx`
- Radii: chips `999px`, controls `7–9px`, cards `12px`. Both light + dark themes must be supported
  (`[data-theme="dark"]`).

## Assets
None new. Nav/race icons are inline SVGs already in `Nav.tsx` and `RaceIcons.tsx`. Emoji used for
division-group and race chips come from `DIVISION_GROUPS` (`divisionGroups.ts`) and `RACE_TYPES`
(`races.ts`) and stay as-is.

## Source data referenced
- `src/types/car.ts` — `FilterState`, `PI_CLASS_ORDER`, `PI_CLASS_COLORS`, `SOURCE_CHIPS`
- `src/lib/divisionGroups.ts` — `DIVISION_GROUPS`
- `src/lib/tags.ts` — `AUTO_TAGS`
- `src/lib/races.ts` — `RACE_TYPES`
- `src/components/FilterBar.tsx`, `DivisionGroupFilter.tsx` — reuse the `Select` and group/division UI
- `src/context/NavControls.tsx` — extend to also carry `sidebarOpen`

## Files in this bundle (design reference)
- `Filter Sidebar Explorations.html` — the interactive prototype (open this first)
- `forza-styles.css` — all prototype styling; the source of the measurements/token usage above
- `forza-sidebars.jsx` — the rail itself; `SidebarC` is the chosen direction (A & B are earlier
  alternatives, kept for context only)
- `forza-shared.jsx` — slim top bar, car card, sortable table, results region
- `forza-data.js` — sample cars + the filter constants mirrored from the real codebase

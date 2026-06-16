# AGENTS.md

## Project overview

Forza Garage is a car collection tracker for Forza Horizon 6. Users browse a database of 618 cars, mark which ones they own, tag and tune them, and compare stats. Stack: Next.js (App Router), Prisma ORM, Neon Postgres (serverless, pooled + direct connections), Clerk for auth, deployed on Vercel.

## Setup commands

- Install deps: `npm install`
- Start dev server: `npm run dev`
- Run tests: `npm test`
- Run a single test file: `npm test -- src/__tests__/<file>.test.ts`
- Type check: `npx tsc --noEmit`
- Lint: `npm run lint`

`.env.local` must contain `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, and `CLERK_SECRET_KEY`. Without the Clerk vars the dev server starts but every page redirects to Clerk's hosted auth domain — the `/cars` page is public but still requires Clerk to be configured for auth context to resolve.

## Database

- Local dev uses `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) — both must be set in `.env.local`.
- After changing `schema.prisma`, run `npx prisma migrate dev` locally first, then `npx prisma migrate deploy` against production once the migration is verified.
- Production migrations and data scripts must run against `DIRECT_URL`, not the pooled connection — long-running transactions behave better on a direct connection.
- Before running any one-off script against production data (upserts, backfills), create a Neon restore point first. Scripts should only use `UPDATE`, never `DELETE`, unless explicitly scoped and confirmed.
- Null-safe updates: never overwrite an existing non-null DB value with a null/empty value from an import or scrape. Skip the field in the update rather than writing null.
- To import or update car data, use `node prisma/upsert_cars.js` — never `prisma db seed`. The script joins both CSVs (`fh6-cars.csv` + `scraped_car_stats.csv`) on year+make+model, runs inside a single transaction, and never touches `UserGarage` rows.

## Architecture

Two main pages share most UI components:

- `/cars` → `GarageView` (`src/components/GarageView.tsx`) — public car database, all 600+ cars, owned/not-owned toggle
- `/garage` → `GarageShowcase` (`src/components/GarageShowcase.tsx`) — user's personal collection, auth-protected

Shared across both: `FilterSidebar`, `CarRow`, `filterCars.ts`, `table-ui.tsx`, `FilterState` type. When changing filter logic or the table, changes typically need to land in both pages.

**List vs drawer data split:** The server renders a minimal car projection for the table (no engine details). When a user opens the car drawer, the client fetches `/api/cars/:id` to lazy-load the full spec. Fields like `engineType`, `engineCC`, `cylinders`, and `bodyStyle` will be `null` in the list — this is intentional, not a bug. `powerHp`, `torqueFtLb`, `weightLb`, `frontWeight`, and `displacementL` are included in the list projection because Stats mode sorts on them.

## Code style

- TypeScript strict mode.
- Tailwind utility classes; project-specific design tokens are prefixed `fh-` (e.g. `fh-panel`, `fh-red`) — reuse these rather than introducing new ad hoc colors.
- Client components must be explicitly marked `'use client'`; keep server components as the default wherever possible to minimize the client JS bundle.
- `next/dynamic` with `ssr: false` cannot be called directly inside a server component — wrap it in a small client component file if SSR needs to be disabled for a child component.
- Standard table mode uses `table-layout: fixed` with percentage widths on `<th>` elements — keeps columns stable across viewport sizes. Stats mode uses `tableLayout: auto` (no fixed style on the table element) with pixel `minWidth` values on the sticky identity columns via `STICKY_COL_STATS` — this is intentional so stat columns size naturally.
- Avoid text truncation unless explicitly requested. The Model column in Stats mode is a deliberate exception — it uses an inner `<div>` with `maxWidth` and `text-ellipsis` to keep stat columns visible; don't remove this. For layout consistency elsewhere prefer fixed-height containers with `overflow: hidden` over ellipsis.

## Testing instructions

- Full suite must pass before pushing: `npm test`.
- When adding a feature that changes a filter's data shape (e.g. single value → array), update *all* existing tests using the old shape in the same change — don't just add new tests alongside broken old ones.
- Mock `fetch` calls in component tests; if a component fires a `fetch` on mount (e.g. lazy-loading detail data), call `vi.clearAllMocks()` after mount settles and before asserting on user-triggered fetch behavior.
- Add or update tests for any code you change, even if not explicitly asked.
- Report which tests are new vs pre-existing, and call out any pre-existing failures unrelated to the current change rather than silently leaving them.

## Security

- Never commit real credentials. `.gitignore` should cover `.env*` except `.env.example`.
- All authenticated mutation routes (`PATCH`, `POST`, `DELETE`) must call `checkRateLimit(userId)` before processing — check this on every new write route, including secondary branches within a route (e.g. a stat-update branch alongside an owned-toggle branch).
- Database access goes through Prisma's typed query builder — no `$queryRaw`/`$executeRaw` with string concatenation.
- API error responses return sanitized messages only (`{ error: 'message' }`), never raw `Error` objects or stack traces.

## PR / commit instructions

- Run `npm test` and `npx tsc --noEmit` before committing.
- Summarize what changed and why in the commit message, not just what files were touched.
- For schema changes, note in the PR description whether a production migration (`prisma migrate deploy`) is required after merge.
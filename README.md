# Forza Garage

A personal garage manager and race companion for **Forza Horizon 6**.

Built because the in-game garage is great for *owning* cars and terrible for *deciding which one to actually drive*. This is the tool I wanted: every car in one searchable place, my collection tracked, and a fast way to find the right car for whatever race is in front of me.

## What it does

- **Car database** — every car in FH6 (600+), filterable and sortable by class, PI, division, and country, with an owned / not-owned toggle and CSV export.
- **Stats mode** — a second table view that surfaces the numbers: power, torque, weight, weight distribution, and the in-game bar stats, all sortable.
- **Your garage** — mark the cars you own, pin favorites, jot notes, and override any stat when your in-game numbers don't match the shared data.
- **Tags** — cars are auto-tagged by division and drivetrain; add your own tags by driving style, surface, and condition to find the right car fast.
- **Race types** — a reference guide for each discipline: what it demands, what to avoid, the competitive PI range, and drivetrain notes.
- **Race tray** — open a race type while browsing your garage and the list instantly filters to your matching cars.
- **Build guides** — upgrade paths and tuning priorities for each race type and PI class.
- **Meta carousel** — the landing page features standout cars pulled from Rivals leaderboard data.

## Stack

- **Next.js 15** (App Router) + **React 19**, TypeScript
- **Tailwind CSS**
- **Prisma** + **Postgres** — local Docker for dev, Neon in production
- **Clerk** for auth
- **Vercel** for hosting · **Vitest** for tests

## Running it locally

```bash
docker compose up -d     # Postgres on localhost:5433
npm install
npx prisma migrate dev   # create the schema
npm run dev              # http://localhost:3000
npm test                # vitest
```

You'll need a `.env.local` with `DATABASE_URL` (pointing at the Docker Postgres) and your Clerk keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`). The `/cars` database is public; the garage needs sign-in.

### Data & migrations

- **Load or refresh car data** with `node prisma/upsert_cars.js` (not `prisma db seed`) — it joins the two CSVs on year/make/model in a single transaction and never touches your garage rows. The simulation stats are pulled in separately by a scraper that lives outside this repo.
- **After changing `schema.prisma`**, run `npx prisma migrate dev` locally, then `npx prisma migrate deploy` against production once it checks out. Take a Neon restore point before running any data script against production.

## Status

Active personal project — built and tweaked as the game gets played.

## Roadmap

**Now**

- **Surface the simulation data in the UI** — the sim stats (0–60, 0–100, braking, lateral G, top speed) are already scraped into the database; next is wiring them into Stats mode and the car drawer, sortable alongside the raw specs.
- **Car comparison** — pick two or more cars and put their stats and sim numbers side by side.

**Next**

- **Race recommender** — pick a race type and PI cap, get your owned cars ranked by fit with the reasoning behind it (builds on the existing race-matching logic).
- **Collection completion tracking** — percent owned by division, class, country, and rarity, with a missing-cars checklist.
- **Rank & filter by sim metrics** — sort and filter the database by 0–60, braking, top speed, and the rest, not just the raw specs.
- **Saved filter presets** — save a filter combination (say, "A-class AWD dirt") and recall it in one click.
- **Top-of-class stat badges** — flag when a car's stat sits near the top of its PI class.

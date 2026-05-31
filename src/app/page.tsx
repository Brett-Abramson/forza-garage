import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { PI_CLASS_ORDER, PI_CLASS_COLORS } from '@/types/car'
import { FujiSvg, BlossomSvg, ToriiSvg } from '@/components/JapanDecor'
import { getRandomFeaturedCar } from '@/lib/featuredCars'
import { RACE_TYPES } from '@/lib/races'

export const dynamic = 'force-dynamic'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ClassCount { piClass: string; _count_id: number }

interface PinnedCar {
  car: { id: number; make: string; model: string; year: number; piClass: string; piRating: number; division: string }
}

interface RecentCar extends PinnedCar {
  addedAt: Date
}

// ── Data fetching ─────────────────────────────────────────────────────────────

async function getGarageStats(userId: string) {
  const [total, byClass, pinned, recent] = await Promise.all([
    prisma.userGarage.count({ where: { userId } }),

    prisma.$queryRaw<ClassCount[]>`
      SELECT c."piClass", COUNT(ug.id)::int AS "_count_id"
      FROM "UserGarage" ug
      JOIN "Car" c ON c.id = ug."carId"
      WHERE ug."userId" = ${userId}
      GROUP BY c."piClass"
    `,

    prisma.userGarage.findMany({
      where: { userId, pinned: true },
      take: 2,
      include: { car: { select: { id: true, make: true, model: true, year: true, piClass: true, piRating: true, division: true } } },
      orderBy: { addedAt: 'desc' },
    }) as Promise<PinnedCar[]>,

    prisma.userGarage.findMany({
      where: { userId },
      take: 5,
      include: { car: { select: { id: true, make: true, model: true, year: true, piClass: true, piRating: true, division: true } } },
      orderBy: { addedAt: 'desc' },
    }) as Promise<RecentCar[]>,
  ])

  return { total, byClass, pinned, recent }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function LandingPage() {
  const { userId } = await auth()
  const featured = getRandomFeaturedCar()
  const [stats, carCount, featuredCar] = await Promise.all([
    userId ? getGarageStats(userId) : Promise.resolve(null),
    prisma.car.count(),
    prisma.car.findFirst({
      where: { make: featured.make, model: featured.model, year: featured.year },
      select: { id: true },
    }),
  ])

  // Map piClass → count for quick lookup
  const classMap: Record<string, number> = {}
  if (stats) {
    for (const row of stats.byClass) {
      classMap[row.piClass] = Number(row._count_id)
    }
  }

  // Build deep-link to /cars with the featured car pre-filtered and drawer open
  const featuredCarUrl = featuredCar
    ? `/cars?q=${encodeURIComponent(`${featured.year} ${featured.make} ${featured.model}`)}&open=${featuredCar.id}`
    : '/cars'

  // Resolve race type name for the featured car link
  const featuredRace = featured.raceType
    ? RACE_TYPES.find((r) => r.id === featured.raceType)
    : null

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0e0408 0%, #1a0808 50%, #0a0a14 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none select-none">
          <FujiSvg className="absolute bottom-0 right-0 w-80 opacity-20" />
          <ToriiSvg className="absolute bottom-0 right-64 w-24 opacity-15" />
          <BlossomSvg className="absolute top-8 left-12 w-16 opacity-10" />
          <BlossomSvg className="absolute top-24 left-36 w-10 opacity-8" />
          <BlossomSvg className="absolute bottom-16 left-24 w-12 opacity-12" />
        </div>

        <div className="relative max-w-screen-2xl mx-auto px-4 py-20 sm:py-28">
          <p className="flex items-center gap-2 text-[10px] font-bold tracking-[0.25em] uppercase mb-5 text-fh-red">
            <span className="w-4 h-px bg-fh-red inline-block" />
            Forza Horizon 6 · Japan
          </p>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight uppercase mb-4 leading-none" style={{ color: '#f0e8d8' }}>
            Your Garage.<br />
            <span className="text-fh-red">Tracked.</span>
          </h1>
          <p className="text-sm mb-10 max-w-md" style={{ color: 'rgba(240,232,216,0.55)' }}>
            Browse {carCount} cars, build your collection, and find the right car for every race type.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/garage"
              className="btn-clip inline-flex items-center gap-3 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white bg-fh-red transition-opacity hover:opacity-80"
            >
              <span>▶</span>
              My Garage
              {stats && <span className="opacity-70">{stats.total} cars</span>}
            </Link>
            <Link
              href="/cars"
              className="btn-clip inline-flex items-center gap-3 px-6 py-3 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
              style={{ background: 'rgba(240,232,216,0.08)', color: 'rgba(240,232,216,0.85)', border: '1px solid rgba(240,232,216,0.15)' }}
            >
              Car Database
              <span style={{ color: 'rgba(240,232,216,0.5)' }}>{carCount}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="max-w-screen-2xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">

          {/* ── LEFT — quick access + pinned + recently added ──────────────── */}
          <div className="flex flex-col gap-8">

            {/* Quick access cards */}
            <section>
              <SectionHeader label="Quick Access" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                <Link
                  href="/garage"
                  className="group flex flex-col gap-2 p-5 rounded-xl border border-fh-border bg-fh-panel transition-colors hover:bg-fh-panel-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide">My Garage</span>
                    <span className="text-xs text-fh-red">→</span>
                  </div>
                  <span className="text-3xl font-bold text-fh-red">
                    {stats ? stats.total : '—'}
                  </span>
                  <span className="text-xs text-fh-muted">
                    {stats ? `${stats.total === 1 ? 'car' : 'cars'} owned` : 'Sign in to see your garage'}
                  </span>
                </Link>

                <Link
                  href="/cars"
                  className="group flex flex-col gap-2 p-5 rounded-xl border border-fh-border bg-fh-panel transition-colors hover:bg-fh-panel-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide">Car Database</span>
                    <span className="text-xs text-fh-red">→</span>
                  </div>
                  <span className="text-3xl font-bold text-fh-dark">{carCount}</span>
                  <span className="text-xs text-fh-muted">cars total</span>
                </Link>
              </div>
            </section>

            {/* Pinned cars */}
            {stats && stats.pinned.length > 0 && (
              <section>
                <SectionHeader label="Pinned" />
                <div className="flex flex-col gap-2">
                  {stats.pinned.map(({ car }) => (
                    <CarListItem key={car.id} car={car} />
                  ))}
                </div>
              </section>
            )}

            {/* Recently added */}
            {stats && stats.recent.length > 0 && (
              <section>
                <SectionHeader label="Recently Added" />
                <div className="flex flex-col gap-2">
                  {stats.recent.map(({ car }) => (
                    <CarListItem key={car.id} car={car} />
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* ── RIGHT — featured car + sign-in prompt ──────────────────────── */}
          <div className="flex flex-col gap-6 order-first lg:order-last">

            {/* Featured car */}
            <section>
              <SectionHeader label="Featured Car" />
              <div className="rounded-xl border border-fh-red-border bg-fh-panel overflow-hidden [border-left-width:3px] [border-left-color:var(--fh-red)]">

                {/* Full-width red badge */}
                <div className="bg-fh-red px-4 py-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                    {featured.badge}
                  </span>
                </div>

                <div className="p-5 flex flex-col gap-3">
                  {/* Car name */}
                  <div>
                    <div className="text-xl font-extrabold leading-tight uppercase tracking-tight">
                      {featured.model}
                    </div>
                    <div className="text-xs text-fh-muted mt-1">
                      {featured.year} · {featured.make}
                    </div>
                  </div>

                  {/* PI class + rating */}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${PI_CLASS_COLORS[featured.piClass] ?? 'bg-gray-600 text-white'}`}>
                      {featured.piClass}
                    </span>
                    <span className="text-lg font-bold tabular-nums text-fh-dark">{featured.piRating}</span>
                  </div>

                  {/* Reason */}
                  <p className="text-xs text-fh-dark-2 leading-relaxed">{featured.reason}</p>

                  <div className="border-t border-fh-border" />

                  {/* Race type link */}
                  {featuredRace && (
                    <Link
                      href="/races"
                      className="inline-flex items-center gap-1.5 text-xs text-fh-muted hover:text-fh-dark transition-colors"
                    >
                      <span>🏁</span>
                      <span>Best for: <span className="font-semibold text-fh-dark">{featuredRace.name}</span></span>
                    </Link>
                  )}

                  {/* Full-width CTA */}
                  <Link
                    href={featuredCarUrl}
                    className="btn-clip flex items-center justify-center py-2.5 text-xs font-bold uppercase tracking-widest text-white bg-fh-red transition-opacity hover:opacity-80"
                  >
                    View in Database
                  </Link>

                  <span className="text-[10px] text-fh-muted-2 text-center">meta as of May 2026</span>
                </div>
              </div>
            </section>

            {/* Sign-in prompt (signed-out only) */}
            {!userId && (
              <section className="rounded-xl border border-fh-border bg-fh-panel p-6 text-center">
                <p className="text-sm mb-1 font-medium">Track your collection</p>
                <p className="text-xs mb-5 text-fh-muted">
                  Sign in to track owned cars, add tags, and get race recommendations.
                </p>
                <Link
                  href="/sign-in"
                  className="btn-clip inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-fh-red"
                >
                  Sign in to get started
                </Link>
              </section>
            )}

          </div>

        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-4 h-px bg-fh-red shrink-0" />
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-fh-muted whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-fh-border" />
    </div>
  )
}

function CarListItem({ car }: { car: PinnedCar['car'] }) {
  return (
    <Link
      href={`/garage?q=${encodeURIComponent(car.model)}`}
      className="flex items-center gap-3 px-4 py-3 rounded-lg border border-fh-border bg-fh-panel transition-colors hover:bg-fh-panel-2 hover:border-fh-border"
    >
      <span className={`text-xs font-bold px-1.5 py-0.5 rounded shrink-0 ${PI_CLASS_COLORS[car.piClass] ?? 'bg-gray-600 text-white'}`}>
        {car.piClass}
      </span>
      <span className="text-xs shrink-0 tabular-nums text-fh-muted">
        {car.piRating}
      </span>
      <span className="text-sm font-medium truncate">{car.make} {car.model}</span>
      <span className="text-xs ml-auto shrink-0 text-fh-muted">
        {car.year}
      </span>
    </Link>
  )
}

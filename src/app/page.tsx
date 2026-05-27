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
      take: 3,
      include: { car: { select: { id: true, make: true, model: true, year: true, piClass: true, piRating: true, division: true } } },
      orderBy: { addedAt: 'desc' },
    }) as Promise<RecentCar[]>,
  ])

  return { total, byClass, pinned, recent }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function LandingPage() {
  const { userId } = await auth()
  const stats = userId ? await getGarageStats(userId) : null
  const featured = getRandomFeaturedCar()

  // Map piClass → count for quick lookup
  const classMap: Record<string, number> = {}
  if (stats) {
    for (const row of stats.byClass) {
      classMap[row.piClass] = Number(row._count_id)
    }
  }

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
          <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-4 text-fh-red">
            Forza Horizon 6 · Japan
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" style={{ color: '#f0e8d8' }}>
            Your Garage.<br />
            <span className="text-fh-red">Tracked.</span>
          </h1>
          <p className="text-base mb-10 max-w-md" style={{ color: 'rgba(240,232,216,0.6)' }}>
            Browse 661 cars, build your collection, and find the right car for every race type.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/garage"
              className="btn-clip inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-fh-red transition-opacity hover:opacity-80"
            >
              My Garage
              {stats && (
                <span className="text-xs font-normal opacity-80 ml-1">
                  {stats.total} cars
                </span>
              )}
            </Link>
            <Link
              href="/cars"
              className="btn-clip inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ background: 'rgba(240,232,216,0.08)', color: 'rgba(240,232,216,0.9)', border: '1px solid rgba(240,232,216,0.15)' }}
            >
              Car Database
              <span className="text-xs font-normal opacity-60">661</span>
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
              <h2 className="text-xs font-semibold uppercase tracking-widest mb-4 text-fh-muted">
                Quick access
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/garage"
                  className="group flex flex-col gap-2 p-5 rounded-xl border border-fh-border bg-fh-panel transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">My Garage</span>
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
                  className="group flex flex-col gap-2 p-5 rounded-xl border border-fh-border bg-fh-panel transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Car Database</span>
                    <span className="text-xs text-fh-red">→</span>
                  </div>
                  <span className="text-3xl font-bold text-fh-red">661</span>
                  <span className="text-xs text-fh-muted">cars in database</span>
                </Link>
              </div>
            </section>

            {/* Pinned cars */}
            {stats && stats.pinned.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-widest mb-4 text-fh-muted">
                  Pinned
                </h2>
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
                <h2 className="text-xs font-semibold uppercase tracking-widest mb-4 text-fh-muted">
                  Recently added
                </h2>
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
              <h2 className="text-xs font-semibold uppercase tracking-widest mb-4 text-fh-muted">
                Featured car
              </h2>
              <div className="rounded-xl border border-fh-red-border bg-fh-panel p-5 flex flex-col gap-3 relative overflow-hidden">
                {/* Red top bar */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-fh-red" />

                {/* Badge + title */}
                <div className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-fh-red text-white">
                    {featured.badge}
                  </span>
                  <div>
                    <div className="text-base font-bold leading-tight">
                      {featured.make} {featured.model}
                    </div>
                    <div className="text-xs text-fh-muted mt-0.5">{featured.year}</div>
                  </div>
                  {/* PI class + rating */}
                  <div className="ml-auto flex items-center gap-1.5 shrink-0">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${PI_CLASS_COLORS[featured.piClass] ?? 'bg-gray-600 text-white'}`}>
                      {featured.piClass}
                    </span>
                    <span className="text-xs tabular-nums text-fh-muted">{featured.piRating}</span>
                  </div>
                </div>

                {/* Reason */}
                <p className="text-xs text-fh-dark-2 leading-relaxed">{featured.reason}</p>

                {/* Race type link */}
                {featuredRace && (
                  <Link
                    href="/races"
                    className="inline-flex items-center gap-1.5 text-xs text-fh-muted hover:text-fh-dark transition-colors"
                  >
                    <span>🏁</span>
                    <span>Best for: <span className="text-fh-dark">{featuredRace.name}</span></span>
                  </Link>
                )}

                {/* Actions + footnote */}
                <div className="flex items-center justify-between pt-1 border-t border-fh-border">
                  <Link
                    href={userId ? '/garage' : '/sign-in'}
                    className="btn-clip inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-fh-red transition-opacity hover:opacity-80"
                  >
                    {userId ? 'Open Garage' : 'Sign in to add'}
                  </Link>
                  <span className="text-[10px] text-fh-muted-2">meta as of May 2026</span>
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

// ── Sub-component ─────────────────────────────────────────────────────────────

function CarListItem({ car }: { car: PinnedCar['car'] }) {
  return (
    <Link
      href={`/garage?q=${encodeURIComponent(car.model)}`}
      className="flex items-center gap-3 px-4 py-3 rounded-lg border border-fh-border bg-fh-panel transition-colors hover:opacity-80"
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

import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { PI_CLASS_ORDER, PI_CLASS_COLORS } from '@/types/car'
import { FujiSvg, BlossomSvg, ToriiSvg } from '@/components/JapanDecor'

export const dynamic = 'force-dynamic'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ClassCount { piClass: string; _count: { id: number } }

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

    prisma.userGarage.groupBy({
      by: ['carId'],
      where: { userId },
      _count: { id: true },
    }).then(async () =>
      // groupBy doesn't join — query car.piClass via a raw aggregate
      prisma.$queryRaw<ClassCount[]>`
        SELECT c."piClass", COUNT(ug.id)::int AS "_count_id"
        FROM "UserGarage" ug
        JOIN "Car" c ON c.id = ug."carId"
        WHERE ug."userId" = ${userId}
        GROUP BY c."piClass"
      `
    ),

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

  // Map piClass → count for quick lookup
  const classMap: Record<string, number> = {}
  if (stats) {
    for (const row of stats.byClass as Array<{ piClass: string; _count_id: number }>) {
      classMap[row.piClass] = Number(row._count_id)
    }
  }

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0e0408 0%, #1a0808 50%, #0a0a14 100%)' }}
      >
        {/* Decorative SVGs */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <FujiSvg className="absolute bottom-0 right-0 w-80 opacity-20" />
          <ToriiSvg className="absolute bottom-0 right-64 w-24 opacity-15" />
          <BlossomSvg className="absolute top-8 left-12 w-16 opacity-10" />
          <BlossomSvg className="absolute top-24 left-36 w-10 opacity-8" />
          <BlossomSvg className="absolute bottom-16 left-24 w-12 opacity-12" />
        </div>

        <div className="relative max-w-screen-2xl mx-auto px-4 py-20 sm:py-28">
          <p
            className="text-xs font-semibold tracking-[0.25em] uppercase mb-4"
            style={{ color: 'var(--fh-red)' }}
          >
            Forza Horizon 6 · Japan
          </p>
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
            style={{ color: '#f0e8d8' }}
          >
            Your Garage.<br />
            <span style={{ color: 'var(--fh-red)' }}>Tracked.</span>
          </h1>
          <p className="text-base mb-10 max-w-md" style={{ color: 'rgba(240,232,216,0.6)' }}>
            Browse 661 cars, build your collection, and find the right car for every race type.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/garage"
              className="btn-clip inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
              style={{ background: 'var(--fh-red)' }}
            >
              My Garage
              {stats && (
                <span
                  className="text-xs font-normal opacity-80 ml-1"
                >
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
      <div className="max-w-screen-2xl mx-auto px-4 py-10 flex flex-col gap-10">

        {/* ── Quick access cards ────────────────────────────────────────────── */}
        <section>
          <h2
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: 'var(--fh-muted)' }}
          >
            Quick access
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <Link
              href="/garage"
              className="group flex flex-col gap-2 p-5 rounded-xl border transition-colors"
              style={{ background: 'var(--fh-panel)', borderColor: 'var(--fh-border)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">My Garage</span>
                <span className="text-xs" style={{ color: 'var(--fh-red)' }}>→</span>
              </div>
              <span className="text-3xl font-bold" style={{ color: 'var(--fh-red)' }}>
                {stats ? stats.total : '—'}
              </span>
              <span className="text-xs" style={{ color: 'var(--fh-muted)' }}>
                {stats ? `${stats.total === 1 ? 'car' : 'cars'} owned` : 'Sign in to see your garage'}
              </span>
            </Link>

            <Link
              href="/cars"
              className="group flex flex-col gap-2 p-5 rounded-xl border transition-colors"
              style={{ background: 'var(--fh-panel)', borderColor: 'var(--fh-border)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Car Database</span>
                <span className="text-xs" style={{ color: 'var(--fh-red)' }}>→</span>
              </div>
              <span className="text-3xl font-bold" style={{ color: 'var(--fh-red)' }}>661</span>
              <span className="text-xs" style={{ color: 'var(--fh-muted)' }}>cars in database</span>
            </Link>
          </div>
        </section>

        {/* ── Garage by class ───────────────────────────────────────────────── */}
        {stats && stats.total > 0 && (
          <section>
            <h2
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'var(--fh-muted)' }}
            >
              Garage by class
            </h2>
            <div className="flex flex-wrap gap-2">
              {PI_CLASS_ORDER.filter((cls) => classMap[cls] > 0).map((cls) => (
                <Link
                  key={cls}
                  href={`/garage?class=${cls}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-opacity hover:opacity-75"
                  style={{ background: 'var(--fh-panel)', borderColor: 'var(--fh-border)' }}
                >
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${PI_CLASS_COLORS[cls] ?? 'bg-gray-600 text-white'}`}>
                    {cls}
                  </span>
                  <span style={{ color: 'var(--fh-dark)' }}>{classMap[cls]}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Pinned cars ───────────────────────────────────────────────────── */}
        {stats && stats.pinned.length > 0 && (
          <section>
            <h2
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'var(--fh-muted)' }}
            >
              Pinned
            </h2>
            <div className="flex flex-col gap-2 max-w-lg">
              {stats.pinned.map(({ car }) => (
                <CarListItem key={car.id} car={car} />
              ))}
            </div>
          </section>
        )}

        {/* ── Recently added ────────────────────────────────────────────────── */}
        {stats && stats.recent.length > 0 && (
          <section>
            <h2
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'var(--fh-muted)' }}
            >
              Recently added
            </h2>
            <div className="flex flex-col gap-2 max-w-lg">
              {stats.recent.map(({ car }) => (
                <CarListItem key={car.id} car={car} />
              ))}
            </div>
          </section>
        )}

        {/* ── Sign-in prompt (signed-out) ───────────────────────────────────── */}
        {!userId && (
          <section
            className="rounded-xl border p-8 text-center max-w-md"
            style={{ background: 'var(--fh-panel)', borderColor: 'var(--fh-border)' }}
          >
            <p className="text-sm mb-1 font-medium">Track your collection</p>
            <p className="text-xs mb-5" style={{ color: 'var(--fh-muted)' }}>
              Sign in to track owned cars, add tags, and get race recommendations.
            </p>
            <Link
              href="/sign-in"
              className="btn-clip inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white"
              style={{ background: 'var(--fh-red)' }}
            >
              Sign in to get started
            </Link>
          </section>
        )}
      </div>
    </div>
  )
}

// ── Sub-component ─────────────────────────────────────────────────────────────

function CarListItem({ car }: { car: PinnedCar['car'] }) {
  return (
    <Link
      href={`/garage?q=${encodeURIComponent(car.model)}`}
      className="flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors hover:opacity-80"
      style={{ background: 'var(--fh-panel)', borderColor: 'var(--fh-border)' }}
    >
      <span className={`text-xs font-bold px-1.5 py-0.5 rounded shrink-0 ${PI_CLASS_COLORS[car.piClass] ?? 'bg-gray-600 text-white'}`}>
        {car.piClass}
      </span>
      <span className="text-xs shrink-0 tabular-nums" style={{ color: 'var(--fh-muted)' }}>
        {car.piRating}
      </span>
      <span className="text-sm font-medium truncate">{car.make} {car.model}</span>
      <span className="text-xs ml-auto shrink-0" style={{ color: 'var(--fh-muted)' }}>
        {car.year}
      </span>
    </Link>
  )
}

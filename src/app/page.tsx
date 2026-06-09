import { Suspense } from 'react'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { PI_CLASS_COLORS } from '@/types/car'
import { FujiSvg, BlossomSvg, ToriiSvg } from '@/components/JapanDecor'
import { MetaCarousel, type MetaCarEntry } from '@/components/MetaCarousel'

export const dynamic = 'force-dynamic'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ClassCount { piClass: string; _count_id: number }

interface PinnedCar {
  car: { id: number; make: string; model: string; year: number; piClass: string; piRating: number; division: string }
}

interface RecentCar extends PinnedCar {
  addedAt: Date
}

// Cached for 24 hours — CarMeta changes infrequently; purge with revalidateTag('featured-cars')
const getFeaturedCars = unstable_cache(
  async (): Promise<MetaCarEntry[]> => {
    const rows = await prisma.carMeta.findMany({
      where: { active: true },
      orderBy: { recordedAt: 'desc' },
      include: {
        car: { select: { id: true, make: true, model: true, year: true, piClass: true, piRating: true } },
      },
    })
    return rows.map((r) => ({
      id: r.id,
      carId: r.car.id,
      make: r.car.make,
      model: r.car.model,
      year: r.car.year,
      piClass: r.car.piClass,
      piRating: r.car.piRating,
      raceType: r.raceType,
      rank: r.rank,
      label: r.label,
      notes: r.notes,
      source: r.source,
    }))
  },
  ['featured-cars'],
  { tags: ['featured-cars'], revalidate: 86400 },
)

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

// ── Async server component for the stats-dependent dashboard ─────────────────
// Wrapped in Suspense so the hero renders at TTFB while these queries run.

async function UserDashboard({
  userId,
  carCount,
  featuredCars,
}: {
  userId: string
  carCount: number
  featuredCars: MetaCarEntry[]
}) {
  const stats = await getGarageStats(userId)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
      {/* LEFT — quick access + pinned + recently added */}
      <div className="flex flex-col gap-8">
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
              <span className="text-3xl font-bold text-fh-red">{stats.total}</span>
              <span className="text-xs text-fh-muted">{stats.total === 1 ? 'car' : 'cars'} owned</span>
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
              <span className="text-xs text-fh-muted">
                {carCount} cars · {stats.total} owned
              </span>
            </Link>
          </div>
        </section>

        {stats.pinned.length > 0 && (
          <section>
            <SectionHeader label="Pinned" />
            <div className="flex flex-col gap-2">
              {stats.pinned.map(({ car }) => (
                <CarListItem key={car.id} car={car} />
              ))}
            </div>
          </section>
        )}

        {stats.recent.length > 0 && (
          <section>
            <SectionHeader label="Recently Added" />
            <div className="flex flex-col gap-2">
              {stats.recent.slice(0, 3).map(({ car }) => (
                <CarListItem key={car.id} car={car} />
              ))}
            </div>
            <Link
              href="/garage?sort=recent"
              className="inline-flex items-center gap-1 mt-3 text-xs text-fh-muted hover:text-fh-dark transition-colors"
            >
              View all in garage
              <span className="text-fh-red">→</span>
            </Link>
          </section>
        )}
      </div>

      {/* RIGHT — featured cars carousel */}
      <div className="flex flex-col gap-6 order-first lg:order-last">
        <MetaCarousel entries={featuredCars} />
      </div>
    </div>
  )
}

// ── Skeleton for the user dashboard while stats queries run ───────────────────

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start animate-pulse">
      <div className="flex flex-col gap-8">
        {/* Quick access */}
        <div>
          <div className="h-4 w-28 rounded bg-fh-panel-2 mb-5" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <div className="h-28 rounded-xl bg-fh-panel-2" />
            <div className="h-28 rounded-xl bg-fh-panel-2" />
          </div>
        </div>
        {/* Recently added — 3 rows + "View all" link */}
        <div>
          <div className="h-4 w-32 rounded bg-fh-panel-2 mb-5" />
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-fh-panel-2" />
            ))}
          </div>
          <div className="h-3 w-36 rounded bg-fh-panel-2 mt-4" />
        </div>
      </div>
      {/* Featured card — full-width single card */}
      <div className="order-first lg:order-last">
        <div className="h-4 w-24 rounded bg-fh-panel-2 mb-5" />
        <div className="h-96 rounded-xl bg-fh-panel-2" />
      </div>
    </div>
  )
}

// ── Signed-out layout (no stats needed) ──────────────────────────────────────

function SignedOutLayout({
  carCount,
  featuredCars,
}: {
  carCount: number
  featuredCars: MetaCarEntry[]
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
      <div className="flex flex-col gap-8">
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
              <span className="text-3xl font-bold text-fh-red">—</span>
              <span className="text-xs text-fh-muted">Sign in to see your garage</span>
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

        <section className="rounded-xl border border-fh-border bg-fh-panel p-6 text-center max-w-2xl">
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
      </div>

      <div className="order-first lg:order-last">
        <MetaCarousel entries={featuredCars} />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function LandingPage() {
  // Start all three concurrently — auth(), carCount, and the cached CarMeta
  // fetch are independent and can all run at the same time.
  const [{ userId }, carCount, featuredCars] = await Promise.all([
    auth(),
    prisma.car.count(),
    getFeaturedCars(),
  ])

  return (
    <div>
      {/* ── Hero — renders at TTFB, no DB dependency ──────────────────────── */}
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

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="max-w-screen-2xl mx-auto px-4 py-10">
        {userId ? (
          // Stats-dependent sections stream in while the hero is already visible
          <Suspense fallback={<DashboardSkeleton />}>
            <UserDashboard
              userId={userId}
              carCount={carCount}
              featuredCars={featuredCars}
            />
          </Suspense>
        ) : (
          <SignedOutLayout
            carCount={carCount}
            featuredCars={featuredCars}
          />
        )}
      </div>
    </div>
  )
}

// ── Shared sub-components ─────────────────────────────────────────────────────

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

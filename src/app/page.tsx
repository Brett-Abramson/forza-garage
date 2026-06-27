import { Suspense } from 'react'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { getCarCount } from '@/server/dal/cars'
import { getGarageStats } from '@/server/dal/garage'
import { getFeaturedCars } from '@/server/dal/meta'
import { PI_CLASS_COLORS } from '@/types/car'
import { FujiSvg, BlossomSvg, ToriiSvg } from '@/components/JapanDecor'
import type { MetaCarEntry } from '@/components/MetaCarousel'
import { MetaCarouselLazy as MetaCarousel } from '@/components/MetaCarouselLazy'
import { FeatureHighlights } from '@/components/FeatureHighlights'

export const dynamic = 'force-dynamic'

// ── Types ─────────────────────────────────────────────────────────────────────

interface PinnedCar {
  car: { id: number; make: string; model: string; year: number; piClass: string; piRating: number; division: string }
}

// Data fetching (getGarageStats, getFeaturedCars) lives in the DAL —
// see @/server/dal/garage and @/server/dal/meta.

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

// Below-hero content — auth() + featured cars (+ stats, inside UserDashboard).
// Split into its own async component so the hero can flush at TTFB instead of
// waiting on auth() and the featured-cars fetch. carCount is passed down from
// the (cached) top-level fetch so neither layout re-queries it.
async function MainContent({ carCount }: { carCount: number }) {
  const [{ userId }, featuredCars] = await Promise.all([auth(), getFeaturedCars()])

  return userId ? (
    <UserDashboard userId={userId} carCount={carCount} featuredCars={featuredCars} />
  ) : (
    <SignedOutLayout carCount={carCount} featuredCars={featuredCars} />
  )
}

export default async function LandingPage() {
  // Only the (cached) car count gates the hero; auth() and the featured-cars
  // fetch are deferred into <MainContent> so the hero streams at TTFB.
  const carCount = await getCarCount()

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

      {/* ── Scope note — honest callout about what's built vs in-progress ── */}
      <div className="border-b border-fh-border">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-start gap-2.5">
          <span className="text-fh-muted shrink-0 mt-px text-xs">ⓘ</span>
          <p className="text-xs text-fh-muted leading-relaxed">
            The <span className="text-fh-dark font-medium">Car Database</span> and <span className="text-fh-dark font-medium">My Garage</span> are the core of this app and fully built out.
            {' '}Races, Builds, and Tunes are ambitious additions that are still taking shape — useful in places, incomplete in others.
          </p>
        </div>
      </div>

      {/* ── Main content — streams in below the already-visible hero ──────── */}
      <div className="max-w-screen-2xl mx-auto px-4 py-10">
        <Suspense fallback={<DashboardSkeleton />}>
          <MainContent carCount={carCount} />
        </Suspense>
      </div>

      {/* ── Features — below the fold, no data dependency ────────────────── */}
      <FeatureHighlights />
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

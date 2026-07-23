import type { Metadata } from 'next'
import StatsGuideView from '@/components/guide/StatsGuideView'

export const metadata: Metadata = {
  title: 'Stats & Sims Guide',
  description:
    'What every Forza Horizon 6 stat and simulation metric actually means — bar stats, raw specs, ' +
    '0-60, braking distance, lateral G, and top speed — and how to read them together.',
  alternates: { canonical: '/guide' },
}

export default function GuidePage() {
  return (
    <main className="max-w-screen-2xl mx-auto px-4 py-8 min-h-screen">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Stats &amp; Sims Guide</h1>
        <p className="text-fh-muted text-sm mt-1">
          What every number on a car means, how to read it, and how the numbers relate.
        </p>
      </header>
      <StatsGuideView />
    </main>
  )
}

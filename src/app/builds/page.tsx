import type { Metadata } from 'next'
import BuildsView from '@/components/builds/BuildsView'

export const metadata: Metadata = {
  title: 'Build & Tuning Guides',
  description:
    'Upgrade paths and tuning priorities for Forza Horizon 6 by race type and PI class — ' +
    'which parts matter most, in what order, and why.',
  alternates: { canonical: '/builds' },
}

export default function BuildsPage() {
  return (
    <main className="max-w-screen-2xl mx-auto px-4 py-8 min-h-screen">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Build &amp; Upgrade Guides</h1>
        <p className="text-fh-muted text-sm mt-1">
          How to build for each race type and what each PI class rewards.
        </p>
      </header>
      <BuildsView />
    </main>
  )
}

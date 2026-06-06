import type { Metadata } from 'next'
import DesignSystem from './DesignSystem.client'

export const metadata: Metadata = {
  title: 'Design System · Forza Garage',
  description: 'Living style guide — reads the real tokens and renders the real components.',
}

/**
 * /design — the living style guide.
 *
 * This is a thin server shell. All the work happens in DesignSystem.client.tsx,
 * which (a) reads the real --fh-* CSS variables from globals.css at runtime, and
 * (b) imports and renders the REAL app components (CarCard, StatBars, RACE_ICONS,
 * the tag + race-type data). Nothing here is hand-copied — change a token or a
 * component and this page reflects it on next load.
 *
 * The page renders inside the root layout, so it inherits <Nav>, <Footer>, the
 * parchment background, the grain overlay, and the global light/dark theme. The
 * token swatches re-read when the existing ThemeToggle flips data-theme.
 */
export default function DesignSystemPage() {
  return (
    <main className="max-w-screen-2xl mx-auto px-4 py-10">
      <header className="mb-10">
        <p className="flex items-center gap-2 text-[10px] font-bold tracking-[0.25em] uppercase mb-4 text-fh-red">
          <span className="w-4 h-px bg-fh-red inline-block" />
          Living style guide
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight uppercase leading-none mb-3">
          Design <span className="text-fh-red">System</span>
        </h1>
        <p className="text-sm text-fh-muted max-w-xl">
          Reads the real <code className="font-mono text-xs bg-fh-panel-2 px-1.5 py-0.5 rounded">--fh-*</code> tokens
          and renders the real components. Toggle the theme in the nav — the swatches update live.
        </p>
      </header>

      <DesignSystem />
    </main>
  )
}

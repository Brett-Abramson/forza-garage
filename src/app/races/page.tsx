import RacesView from '@/components/races/RacesView'
import { RACE_TYPES } from '@/lib/races'

export default function RacesPage() {
  return (
    <main className="max-w-screen-2xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Race Types</h1>
        <p className="text-fh-muted text-sm mt-1">
          {RACE_TYPES.length} disciplines — click any to see what your garage needs.
        </p>
      </header>
      <RacesView />
    </main>
  )
}

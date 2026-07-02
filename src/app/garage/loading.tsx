import Spinner from '@/components/ui/Spinner'

// Shown instantly on navigation to /garage while the server component runs its
// (force-dynamic) DB query. Matches the page's main container so swapping the
// spinner for the real content doesn't shift layout.
export default function Loading() {
  return (
    <main className="max-w-screen-2xl mx-auto min-h-screen flex items-center justify-center">
      <Spinner size={40} label="Loading garage…" />
    </main>
  )
}

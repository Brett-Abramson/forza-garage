import type { Metadata } from 'next'
import { getAllTracks } from '@/server/dal/tracks'
import { groupTracksByType } from '@/lib/tracks'
import { TracksIndexView } from '@/components/tracks/TracksIndexView'

export const metadata: Metadata = {
  title: 'Track Database',
  description:
    'Every race in Forza Horizon 6 indexed by type and region — street, road, touge, drag, dirt, ' +
    'and cross country — with distance, lap count, and reference layouts.',
  alternates: { canonical: '/tracks' },
  openGraph: {
    title: 'Track Database | Forza Garage',
    description: 'Every race in Forza Horizon 6, indexed by type and region.',
    url: '/tracks',
  },
}

export default async function TracksPage() {
  const tracks = await getAllTracks()
  const groups = groupTracksByType(tracks)

  return (
    <main>
      <TracksIndexView groups={groups} total={tracks.length} />
    </main>
  )
}

import { getAllTracks } from '@/server/dal/tracks'
import { groupTracksByType } from '@/lib/tracks'
import { TracksIndexView } from '@/components/tracks/TracksIndexView'

export default async function TracksPage() {
  const tracks = await getAllTracks()
  const groups = groupTracksByType(tracks)

  return (
    <main>
      <TracksIndexView groups={groups} total={tracks.length} />
    </main>
  )
}

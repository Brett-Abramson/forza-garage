import { describe, it, expect } from 'vitest'
import { render, screen } from './test-utils'
import userEvent from '@testing-library/user-event'
import { TracksIndexView } from '@/components/tracks/TracksIndexView'
import { groupTracksByType, type TrackListItem } from '@/lib/tracks'

function track(overrides: Partial<TrackListItem>): TrackListItem {
  return {
    raceName: 'Cedar Run Street Race',
    raceType: 'Street Race',
    distanceMi: 4.2,
    laps: 1,
    trackImageUrl: null,
    detailsImageUrl: null,
    ...overrides,
  }
}

const TRACKS: TrackListItem[] = [
  track({ raceName: 'Cedar Run Street Race', raceType: 'Street Race' }),
  track({ raceName: 'Daikoku Chase Street Race', raceType: 'Street Race' }),
  track({ raceName: 'The Goliath', raceType: 'Road Race', distanceMi: 53.1 }),
  track({ raceName: 'Hakone Nanamagari Touge Race', raceType: 'Touge Race', distanceMi: null }),
]

function renderView() {
  const groups = groupTracksByType(TRACKS)
  return render(<TracksIndexView groups={groups} total={TRACKS.length} />)
}

describe('TracksIndexView — initial render', () => {
  it('shows every race grouped by type', () => {
    renderView()
    for (const t of TRACKS) {
      expect(screen.getByText(t.raceName)).toBeInTheDocument()
    }
  })

  it('shows the jump-to TOC before any search', () => {
    renderView()
    expect(screen.getByText('Jump to')).toBeInTheDocument()
  })

  it('renders the null distance as a dash, never 0', () => {
    renderView()
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
    expect(screen.queryByText('0 mi')).not.toBeInTheDocument()
  })

  it('shows the total count in the subtitle', () => {
    renderView()
    expect(screen.getByText(String(TRACKS.length))).toBeInTheDocument()
  })
})

describe('TracksIndexView — search', () => {
  it('filters cards by name as the user types', async () => {
    const user = userEvent.setup()
    renderView()
    await user.type(screen.getByPlaceholderText(/search races by name/i), 'goliath')
    expect(screen.getByText('The Goliath')).toBeInTheDocument()
    expect(screen.queryByText('Cedar Run Street Race')).not.toBeInTheDocument()
  })

  it('hides the jump-to TOC while a query is active', async () => {
    const user = userEvent.setup()
    renderView()
    await user.type(screen.getByPlaceholderText(/search races by name/i), 'goliath')
    expect(screen.queryByText('Jump to')).not.toBeInTheDocument()
  })

  it('shows the no-results state when nothing matches', async () => {
    const user = userEvent.setup()
    renderView()
    await user.type(screen.getByPlaceholderText(/search races by name/i), 'zzz-no-match')
    expect(screen.getByText(/No races match/i)).toBeInTheDocument()
  })

  it('clears the search via the clear button and restores the TOC', async () => {
    const user = userEvent.setup()
    renderView()
    const input = screen.getByPlaceholderText(/search races by name/i)
    await user.type(input, 'goliath')
    await user.click(screen.getByRole('button', { name: /clear search/i }))
    expect(input).toHaveValue('')
    expect(screen.getByText('Jump to')).toBeInTheDocument()
    expect(screen.getByText('Cedar Run Street Race')).toBeInTheDocument()
  })

  it('clears the search from the no-results "clear the search" link', async () => {
    const user = userEvent.setup()
    renderView()
    await user.type(screen.getByPlaceholderText(/search races by name/i), 'zzz-no-match')
    await user.click(screen.getByRole('button', { name: /clear the search/i }))
    expect(screen.getByText('Cedar Run Street Race')).toBeInTheDocument()
  })
})

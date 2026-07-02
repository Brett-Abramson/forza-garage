import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatsGuideView from '@/components/guide/StatsGuideView'
import { STAT_GUIDE_ENTRIES } from '@/lib/statsGuideContent'

// StatsGuideView backs the /guide route, which sits outside middleware.ts's
// protected matcher. Rendering it with NO Clerk provider / auth wrapper proves
// the content is public — a signed-in session is not required.
describe('StatsGuideView (public /guide content)', () => {
  it('renders all sections without a signed-in session', () => {
    render(<StatsGuideView />)
    expect(screen.getByRole('heading', { name: /the identity layer/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /the six bar stats/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /simulation metrics/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /reading a car in 30 seconds/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /appendix/i })).toBeInTheDocument()
  })

  it('carries the dataset provenance caution into the appendix', () => {
    render(<StatsGuideView />)
    expect(screen.getByText(/dataset-derived snapshots/i)).toBeInTheDocument()
  })

  it('exposes a scroll anchor for every metric entry (deep-link targets)', () => {
    const { container } = render(<StatsGuideView />)
    for (const entry of STAT_GUIDE_ENTRIES) {
      expect(container.querySelector(`#${entry.id}`), `missing anchor #${entry.id}`).not.toBeNull()
    }
    // Named explicitly in the acceptance criteria.
    expect(container.querySelector('#lateral-g')).not.toBeNull()
  })
})

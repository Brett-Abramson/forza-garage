import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RacesView from '@/components/RacesView'
import { RACE_TYPES, getRaceFilterUrl } from '@/lib/races'

// Pick a consistent race for drawer tests
const ROAD = RACE_TYPES.find((r) => r.id === 'road')!

async function openDrawer(user: ReturnType<typeof userEvent.setup>, raceName: string) {
  // Cards are buttons whose text content includes the race name
  const cards = screen.getAllByRole('button').filter((b) =>
    b.textContent?.includes(raceName)
  )
  await user.click(cards[0])
}

// ─── Card grid ────────────────────────────────────────────────────────────────

describe('RacesView — card grid', () => {
  it('renders one card button per race type', () => {
    render(<RacesView />)
    for (const race of RACE_TYPES) {
      const cards = screen.getAllByRole('button').filter((b) =>
        b.textContent?.includes(race.name)
      )
      expect(cards.length).toBeGreaterThan(0)
    }
  })

  it('each card shows the race surface', () => {
    render(<RacesView />)
    for (const race of RACE_TYPES) {
      // surface text appears somewhere on the page
      expect(screen.getAllByText(race.surface).length).toBeGreaterThan(0)
    }
  })

  it('each card shows the race name (SVG icons replace emoji — check name instead)', () => {
    render(<RacesView />)
    for (const race of RACE_TYPES) {
      expect(screen.getAllByText(race.name).length).toBeGreaterThan(0)
    }
  })
})

// ─── Drawer state ─────────────────────────────────────────────────────────────

describe('RacesView — drawer visibility', () => {
  it('drawer starts off-screen (translate-x-full)', () => {
    const { container } = render(<RacesView />)
    expect(container.querySelector('.translate-x-full')).toBeTruthy()
    expect(container.querySelector('.translate-x-0')).toBeFalsy()
  })

  it('clicking a card slides the drawer in (translate-x-0)', async () => {
    const user = userEvent.setup()
    const { container } = render(<RacesView />)
    await openDrawer(user, ROAD.name)
    expect(container.querySelector('.translate-x-0')).toBeTruthy()
  })
})

// ─── Drawer content ───────────────────────────────────────────────────────────

describe('RacesView — drawer content', () => {
  it('shows the race name and icon in the drawer header', async () => {
    const user = userEvent.setup()
    render(<RacesView />)
    await openDrawer(user, ROAD.name)
    // Name appears at least twice — once in the card, once in the open drawer
    // Icon is now an SVG (aria-hidden), not a text node — not queryable by text
    expect(screen.getAllByText(ROAD.name).length).toBeGreaterThanOrEqual(2)
  })

  it('shows all demands as list items', async () => {
    const user = userEvent.setup()
    render(<RacesView />)
    await openDrawer(user, ROAD.name)
    for (const demand of ROAD.demands) {
      expect(screen.getByText(demand)).toBeInTheDocument()
    }
  })

  it('shows all avoid items', async () => {
    const user = userEvent.setup()
    render(<RacesView />)
    await openDrawer(user, ROAD.name)
    for (const item of ROAD.avoid) {
      expect(screen.getByText(item)).toBeInTheDocument()
    }
  })

  it('shows the PI sweet spot', async () => {
    const user = userEvent.setup()
    render(<RacesView />)
    await openDrawer(user, ROAD.name)
    expect(screen.getByText(ROAD.piSweetSpot)).toBeInTheDocument()
  })

  it('shows the drivetrain note', async () => {
    const user = userEvent.setup()
    render(<RacesView />)
    await openDrawer(user, ROAD.name)
    expect(screen.getByText(ROAD.drivetrainNote)).toBeInTheDocument()
  })

  it('shows all recommended tags as pills', async () => {
    const user = userEvent.setup()
    render(<RacesView />)
    await openDrawer(user, ROAD.name)
    for (const tag of ROAD.recommendedTags) {
      // tags appear in both the pill row and possibly elsewhere; at least once
      expect(screen.getAllByText(tag).length).toBeGreaterThan(0)
    }
  })

  it('"Find in My Garage" link points to the correct garage filter URL', async () => {
    const user = userEvent.setup()
    render(<RacesView />)
    await openDrawer(user, ROAD.name)
    const link = screen.getByRole('link', { name: /find in my garage/i })
    expect(link).toHaveAttribute('href', getRaceFilterUrl(ROAD.id))
  })
})

// ─── Drawer close ─────────────────────────────────────────────────────────────

describe('RacesView — drawer close', () => {
  it('close button slides the drawer out', async () => {
    const user = userEvent.setup()
    const { container } = render(<RacesView />)
    await openDrawer(user, ROAD.name)
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(container.querySelector('.translate-x-full')).toBeTruthy()
  })

  it('overlay click closes the drawer', async () => {
    const user = userEvent.setup()
    const { container } = render(<RacesView />)
    await openDrawer(user, ROAD.name)
    const overlay = container.querySelector('.fixed.inset-0') as HTMLElement
    await user.click(overlay)
    expect(container.querySelector('.translate-x-full')).toBeTruthy()
  })

  it('Escape key closes the drawer', async () => {
    const user = userEvent.setup()
    const { container } = render(<RacesView />)
    await openDrawer(user, ROAD.name)
    await user.keyboard('{Escape}')
    expect(container.querySelector('.translate-x-full')).toBeTruthy()
  })

  it('opening a second card replaces the first in the drawer', async () => {
    const user = userEvent.setup()
    render(<RacesView />)
    const DRIFT = RACE_TYPES.find((r) => r.id === 'drift')!
    await openDrawer(user, ROAD.name)
    await openDrawer(user, DRIFT.name)
    expect(screen.getByText(DRIFT.drivetrainNote)).toBeInTheDocument()
    expect(screen.queryByText(ROAD.drivetrainNote)).not.toBeInTheDocument()
  })
})

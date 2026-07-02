import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import StatBars from '@/components/car/StatBars'
import type { Car } from '@/types/car'

// Base car with all stat and spec fields null
const nullStatCar: Car = {
  id: 1,
  make: 'Porsche',
  model: '911',
  year: 2020,
  division: 'Modern Sports Cars',
  piClass: 'S1',
  piRating: 826,
  drivetrain: null,
  engineType: null,
  engineCC: null,
  cylinders: null,
  country: 'Germany',
  bodyStyle: null,
  statSpeed: null,
  statHandling: null,
  statAcceleration: null,
  statLaunch: null,
  statBraking: null,
  statOffroad: null,
  powerHp: null,
  torqueFtLb: null,
  weightLb: null,
  frontWeight: null,
  displacementL: null,
  simZeroToSixty: null, simZeroToHundred: null, simBraking60: null, simBraking100: null, simLateralG60: null, simLateralG120: null, simTopSpeed: null, simAeroEfficiency: null, simMechBalance: null, simAeroBalance: null,
  value: null,
  rarity: null,
  source: 'Autoshow',
  sourceInfo: null,
  owned: false,
}

// Car with all six bar stats set, no spec fields
const barStatCar: Car = {
  ...nullStatCar,
  statSpeed: 7.5,
  statHandling: 6.2,
  statAcceleration: 8.0,
  statLaunch: 5.5,
  statBraking: 6.8,
  statOffroad: 3.1,
}

// ─── Empty state ──────────────────────────────────────────────────────────────

describe('StatBars — empty state', () => {
  it('shows the "no stats" prompt when all bar stats are null', () => {
    render(<StatBars car={nullStatCar} />)
    expect(screen.getByText(/no stats yet/i)).toBeInTheDocument()
  })

  it('does not render bar labels when all bar stats are null', () => {
    render(<StatBars car={nullStatCar} />)
    expect(screen.queryByText('Speed')).not.toBeInTheDocument()
    expect(screen.queryByText('Handling')).not.toBeInTheDocument()
  })

  it('renders the prompt even when spec fields are set', () => {
    // Spec fields alone don't count — bars need at least one stat
    render(<StatBars car={{ ...nullStatCar, powerHp: 500 }} />)
    expect(screen.getByText(/no stats yet/i)).toBeInTheDocument()
  })
})

// ─── Bar labels and values ────────────────────────────────────────────────────

describe('StatBars — bar display', () => {
  it('renders all six bar labels when any bar stat is present', () => {
    render(<StatBars car={barStatCar} />)
    expect(screen.getByText('Speed')).toBeInTheDocument()
    expect(screen.getByText('Handling')).toBeInTheDocument()
    expect(screen.getByText('Accel')).toBeInTheDocument()
    expect(screen.getByText('Launch')).toBeInTheDocument()
    expect(screen.getByText('Braking')).toBeInTheDocument()
    expect(screen.getByText('Offroad')).toBeInTheDocument()
  })

  it('does not show the empty state prompt when any bar stat is set', () => {
    render(<StatBars car={{ ...nullStatCar, statSpeed: 8.0 }} />)
    expect(screen.queryByText(/no stats yet/i)).not.toBeInTheDocument()
  })

  it('displays stat values formatted to one decimal place', () => {
    render(<StatBars car={barStatCar} />)
    expect(screen.getByText('7.5')).toBeInTheDocument()
    expect(screen.getByText('6.2')).toBeInTheDocument()
    expect(screen.getByText('8.0')).toBeInTheDocument()
  })

  it('shows "—" for a null stat when other stats are present', () => {
    render(<StatBars car={{ ...barStatCar, statHandling: null }} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('still renders all six bar labels when only one stat is present', () => {
    render(<StatBars car={{ ...nullStatCar, statBraking: 5.0 }} />)
    expect(screen.getByText('Speed')).toBeInTheDocument()
    expect(screen.getByText('Braking')).toBeInTheDocument()
  })
})

// ─── Specs row ────────────────────────────────────────────────────────────────

describe('StatBars — specs row', () => {
  it('is not rendered when no spec fields are set', () => {
    render(<StatBars car={barStatCar} />)
    expect(screen.queryByText('HP')).not.toBeInTheDocument()
    expect(screen.queryByText('Torque')).not.toBeInTheDocument()
  })

  it('shows HP and its value when powerHp is set', () => {
    render(<StatBars car={{ ...barStatCar, powerHp: 510 }} />)
    expect(screen.getByText('HP')).toBeInTheDocument()
    expect(screen.getByText('510')).toBeInTheDocument()
  })

  it('shows Torque with ft-lb suffix', () => {
    render(<StatBars car={{ ...barStatCar, torqueFtLb: 390 }} />)
    expect(screen.getByText('Torque')).toBeInTheDocument()
    expect(screen.getByText('390 ft-lb')).toBeInTheDocument()
  })

  it('shows Weight with lb suffix', () => {
    render(<StatBars car={{ ...barStatCar, weightLb: 3200 }} />)
    expect(screen.getByText('Weight')).toBeInTheDocument()
    expect(screen.getByText('3200 lb')).toBeInTheDocument()
  })

  it('shows front weight with % suffix', () => {
    render(<StatBars car={{ ...barStatCar, frontWeight: 45 }} />)
    expect(screen.getByText('F.Wt')).toBeInTheDocument()
    expect(screen.getByText('45%')).toBeInTheDocument()
  })

  it('shows displacement with L suffix', () => {
    render(<StatBars car={{ ...barStatCar, displacementL: 3.8 }} />)
    expect(screen.getByText('Disp')).toBeInTheDocument()
    expect(screen.getByText('3.8L')).toBeInTheDocument()
  })

  it('shows rarity when set', () => {
    render(<StatBars car={{ ...barStatCar, rarity: 'Legendary' }} />)
    expect(screen.getByText('Rarity')).toBeInTheDocument()
    expect(screen.getByText('Legendary')).toBeInTheDocument()
  })

  it('omits spec labels whose values are null', () => {
    render(<StatBars car={{ ...barStatCar, powerHp: 400, torqueFtLb: null }} />)
    expect(screen.getByText('HP')).toBeInTheDocument()
    expect(screen.queryByText('Torque')).not.toBeInTheDocument()
  })

  it('renders specs row even when bar stats are null (edge: all specs but no bars)', () => {
    // hasAnyBarStat is false → shows empty prompt, specs row is never reached
    // This confirms the prompt takes priority over specs
    render(<StatBars car={{ ...nullStatCar, powerHp: 500 }} />)
    expect(screen.queryByText('HP')).not.toBeInTheDocument()
    expect(screen.getByText(/no stats yet/i)).toBeInTheDocument()
  })
})

// ─── variant + showSpecs props ──────────────────────────────────────────────

// ─── Badge pip accents ────────────────────────────────────────────────────────

describe('StatBars — badge pip accents', () => {
  const speedBadge = {
    kind: 'percentile' as const,
    tier: 'top-soft' as const,
    label: 'top 10% speed · S1 (stock)',
    rank: 1,
    n: 10,
  }

  it('qualifying row carries the badge label as its title', () => {
    render(<StatBars car={barStatCar} badges={{ statSpeed: speedBadge }} />)
    expect(screen.getByTitle('top 10% speed · S1 (stock)')).toBeInTheDocument()
  })

  it('qualifying row contains an aria-hidden pip span', () => {
    render(<StatBars car={barStatCar} badges={{ statSpeed: speedBadge }} />)
    const row = screen.getByTitle('top 10% speed · S1 (stock)')
    const pip = row.querySelector('[aria-hidden="true"]')
    expect(pip).not.toBeNull()
  })

  it('qualifying row value text is bold', () => {
    render(<StatBars car={barStatCar} badges={{ statSpeed: speedBadge }} />)
    const row = screen.getByTitle('top 10% speed · S1 (stock)')
    const boldEl = row.querySelector('.font-bold')
    expect(boldEl).not.toBeNull()
    expect(boldEl?.textContent).toBe('7.5')
  })

  it('non-qualifying bar rows have no title', () => {
    render(<StatBars car={barStatCar} badges={{ statSpeed: speedBadge }} />)
    // Only statSpeed is badged; all other rows must have no title
    const titledEls = document.querySelectorAll('[title]')
    expect(titledEls).toHaveLength(1)
  })

  it('no badges prop renders no titled elements and no pip', () => {
    render(<StatBars car={barStatCar} />)
    expect(document.querySelectorAll('[title]')).toHaveLength(0)
    expect(document.querySelectorAll('[aria-hidden="true"]')).toHaveLength(0)
  })
})

// ─── Hover tooltip ────────────────────────────────────────────────────────────
// Regression coverage for a bug where the tooltip, positioned absolute inside
// the row, got clipped by an overflow-y-auto ancestor (the garage drawer's
// scrollable body) and appeared to render behind the drawer's tab bar. The fix
// portals the tooltip to document.body instead.

describe('StatBars — hover tooltip', () => {
  it('portals the tooltip to document.body rather than nesting it inside the row', () => {
    vi.useFakeTimers()
    render(<StatBars car={barStatCar} />)
    const row = screen.getByText('Speed').parentElement!
    fireEvent.mouseEnter(row)
    act(() => { vi.advanceTimersByTime(200) })

    const tooltip = screen.getByText(/top speed on long straights/i)
    expect(row.contains(tooltip)).toBe(false)
    expect(document.body.contains(tooltip)).toBe(true)

    vi.useRealTimers()
  })

  it('shows the class-average comparison line once the hover delay elapses', () => {
    vi.useFakeTimers()
    render(<StatBars car={barStatCar} />)
    const row = screen.getByText('Speed').parentElement!
    fireEvent.mouseEnter(row)
    act(() => { vi.advanceTimersByTime(200) })

    expect(screen.getByText(/7\.5 vs class avg/i)).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('does not show the tooltip before the hover delay elapses', () => {
    vi.useFakeTimers()
    render(<StatBars car={barStatCar} />)
    const row = screen.getByText('Speed').parentElement!
    fireEvent.mouseEnter(row)
    act(() => { vi.advanceTimersByTime(100) })

    expect(screen.queryByText(/top speed on long straights/i)).not.toBeInTheDocument()

    vi.useRealTimers()
  })

  it('hides the tooltip on mouseleave', () => {
    vi.useFakeTimers()
    render(<StatBars car={barStatCar} />)
    const row = screen.getByText('Speed').parentElement!
    fireEvent.mouseEnter(row)
    act(() => { vi.advanceTimersByTime(200) })
    expect(screen.getByText(/top speed on long straights/i)).toBeInTheDocument()

    fireEvent.mouseLeave(row)
    expect(screen.queryByText(/top speed on long straights/i)).not.toBeInTheDocument()

    vi.useRealTimers()
  })
})

describe('StatBars — variant + showSpecs props', () => {
  it('renders all six bars in the large variant', () => {
    render(<StatBars car={barStatCar} variant="large" />)
    expect(screen.getByText('Speed')).toBeInTheDocument()
    expect(screen.getByText('Offroad')).toBeInTheDocument()
  })

  it('omits the specs row when showSpecs is false', () => {
    render(<StatBars car={{ ...barStatCar, powerHp: 510 }} showSpecs={false} />)
    expect(screen.queryByText('HP')).not.toBeInTheDocument()
  })

  it('renders the specs row by default (showSpecs defaults to true)', () => {
    render(<StatBars car={{ ...barStatCar, powerHp: 510 }} />)
    expect(screen.getByText('HP')).toBeInTheDocument()
  })
})

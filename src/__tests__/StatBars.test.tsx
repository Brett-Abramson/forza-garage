import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatBars from '@/components/StatBars'
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

import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CarRow from '@/components/CarRow'
import type { Car } from '@/types/car'

const baseCar: Car = {
  id: 1,
  make: 'Porsche',
  model: '911 GT3 RS',
  year: 2019,
  division: 'Modern Sports Cars',
  piClass: 'S1',
  piRating: 826,
  drivetrain: null,
  engineType: null,
  engineCC: null,
  cylinders: null,
  country: 'Germany',
  bodyStyle: null,
  statSpeed: null, statHandling: null, statAcceleration: null, statLaunch: null,
  statBraking: null, statOffroad: null, powerHp: null, torqueFtLb: null,
  weightLb: null, frontWeight: null, displacementL: null, value: null, rarity: null,
  simZeroToSixty: null, simZeroToHundred: null, simBraking60: null, simBraking100: null, simLateralG60: null, simLateralG120: null, simTopSpeed: null, simAeroEfficiency: null, simMechBalance: null, simAeroBalance: null,
  source: 'Autoshow',
  sourceInfo: null,
  owned: false,
}

function renderRow(
  car: Car,
  extra: { onToggleOwned?: () => void; isPending?: boolean; onCardClick?: (car: Car) => void; isExpanded?: boolean; showAddedAt?: boolean; showAddedAtColumn?: boolean } = {}
) {
  const onToggleOwned = extra.onToggleOwned ?? vi.fn()
  return render(
    <table>
      <tbody>
        <CarRow
          car={car}
          onToggleOwned={onToggleOwned}
          isPending={extra.isPending}
          onCardClick={extra.onCardClick}
          isExpanded={extra.isExpanded}
          showAddedAt={extra.showAddedAt}
          showAddedAtColumn={extra.showAddedAtColumn}
        />
      </tbody>
    </table>
  )
}

describe('CarRow', () => {
  it('renders make, model, and year', () => {
    renderRow(baseCar)
    const row = screen.getByRole('row')
    expect(within(row).getByText('Porsche')).toBeInTheDocument()
    expect(within(row).getByText('911 GT3 RS')).toBeInTheDocument()
    expect(within(row).getByText('2019')).toBeInTheDocument()
  })

  it('renders the PI class badge', () => {
    renderRow(baseCar)
    expect(screen.getByText('S1')).toBeInTheDocument()
  })

  it('shows "+ Add" button when car is not owned', () => {
    renderRow({ ...baseCar, owned: false })
    expect(screen.getByRole('button', { name: '+ Add' })).toBeInTheDocument()
  })

  it('shows "Owned" button when car is owned', () => {
    renderRow({ ...baseCar, owned: true })
    expect(screen.getByRole('button', { name: 'Owned' })).toBeInTheDocument()
  })

  it('calls onToggleOwned with (id, true) when clicking + Add', async () => {
    const onToggleOwned = vi.fn()
    renderRow({ ...baseCar, owned: false }, { onToggleOwned })
    await userEvent.click(screen.getByRole('button', { name: '+ Add' }))
    expect(onToggleOwned).toHaveBeenCalledOnce()
    expect(onToggleOwned).toHaveBeenCalledWith(baseCar.id, true)
  })

  it('requires confirmation before calling onToggleOwned with (id, false)', async () => {
    const onToggleOwned = vi.fn()
    renderRow({ ...baseCar, owned: true }, { onToggleOwned })
    await userEvent.click(screen.getByRole('button', { name: 'Owned' }))
    expect(onToggleOwned).not.toHaveBeenCalled()
    expect(screen.getByText('Remove?')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(onToggleOwned).toHaveBeenCalledWith(baseCar.id, false)
  })

  it('applies opacity and pointer-events-none when isPending', () => {
    renderRow(baseCar, { isPending: true })
    const row = screen.getByRole('row')
    expect(row.className).toContain('opacity-60')
    expect(row.className).toContain('pointer-events-none')
  })

  it('does not apply pending styles when isPending is false', () => {
    renderRow(baseCar, { isPending: false })
    const row = screen.getByRole('row')
    expect(row.className).not.toContain('opacity-60')
  })

  it('shows a spinner SVG in the button when isPending', () => {
    renderRow(baseCar, { isPending: true })
    const btn = screen.getByRole('button')
    expect(btn.querySelector('svg')).toBeTruthy()
    expect(btn).not.toHaveTextContent('+ Add')
    expect(btn).not.toHaveTextContent('Owned')
  })

  it('button is disabled when isPending', () => {
    renderRow(baseCar, { isPending: true })
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('does not call onToggleOwned when the button is clicked while isPending', async () => {
    const onToggleOwned = vi.fn()
    renderRow(baseCar, { isPending: true, onToggleOwned })
    // Disabled buttons don't fire click events in userEvent
    await userEvent.click(screen.getByRole('button'))
    expect(onToggleOwned).not.toHaveBeenCalled()
  })
})

// ─── isExpanded ──────────────────────────────────────────────────────────────

describe('CarRow — isExpanded', () => {
  it('applies expanded bg when isExpanded is true', () => {
    renderRow(baseCar, { isExpanded: true })
    const classes = screen.getByRole('row').className.split(/\s+/)
    expect(classes).toContain('bg-fh-panel-2')
  })

  it('does not apply the bare expanded bg class when isExpanded is false', () => {
    renderRow(baseCar, { isExpanded: false })
    const classes = screen.getByRole('row').className.split(/\s+/)
    expect(classes).not.toContain('bg-fh-panel-2')
  })
})

// ─── onCardClick ─────────────────────────────────────────────────────────────

describe('CarRow — onCardClick', () => {
  it('calls onCardClick with the car when the row is clicked', async () => {
    const onCardClick = vi.fn()
    renderRow(baseCar, { onCardClick })
    await userEvent.click(screen.getByRole('row'))
    expect(onCardClick).toHaveBeenCalledOnce()
    expect(onCardClick).toHaveBeenCalledWith(baseCar)
  })

  it('does not call onCardClick when the owned button is clicked', async () => {
    const onCardClick = vi.fn()
    renderRow({ ...baseCar, owned: false }, { onCardClick })
    await userEvent.click(screen.getByRole('button', { name: '+ Add' }))
    expect(onCardClick).not.toHaveBeenCalled()
  })

  it('adds cursor-pointer class to the row when onCardClick is provided', () => {
    const onCardClick = vi.fn()
    renderRow(baseCar, { onCardClick })
    expect(screen.getByRole('row').className).toContain('cursor-pointer')
  })

  it('does not add cursor-pointer when onCardClick is absent', () => {
    renderRow(baseCar)
    expect(screen.getByRole('row').className).not.toContain('cursor-pointer')
  })
})

// ─── showAddedAt ──────────────────────────────────────────────────────────────

describe('CarRow — showAddedAt', () => {
  const carWithDate: Car = { ...baseCar, addedAt: '2026-06-01T12:00:00.000Z' }

  it('shows "Added" label when showAddedAtColumn + showAddedAt=true and addedAt is set', () => {
    renderRow(carWithDate, { showAddedAtColumn: true, showAddedAt: true })
    expect(screen.getByText(/Added/)).toBeInTheDocument()
  })

  it('does not show "Added" label when showAddedAt is false', () => {
    renderRow(carWithDate, { showAddedAtColumn: true, showAddedAt: false })
    expect(screen.queryByText(/Added/)).not.toBeInTheDocument()
  })

  it('does not show "Added" label when addedAt is null even if showAddedAt=true', () => {
    renderRow({ ...baseCar, addedAt: null }, { showAddedAtColumn: true, showAddedAt: true })
    expect(screen.queryByText(/Added/)).not.toBeInTheDocument()
  })

  it('does not render the addedAt cell when showAddedAtColumn is false', () => {
    renderRow(carWithDate, { showAddedAtColumn: false, showAddedAt: true })
    expect(screen.queryByText(/Added/)).not.toBeInTheDocument()
  })
})

// ─── Sim mode (registry-driven metric columns) ───────────────────────────────

describe('CarRow — sim mode', () => {
  const simCar: Car = {
    ...baseCar,
    simZeroToSixty: 3.2,           // 1 dp
    simTopSpeed: 217,              // 0 dp
    simBraking60: null,            // failed scrape → em dash
    powerHp: 500, weightLb: 2500,  // power-to-weight = 0.200 (3 dp)
  }

  const renderSim = (car: Car) =>
    render(<table><tbody><CarRow car={car} onToggleOwned={vi.fn()} simMode /></tbody></table>)

  it('renders metric values rounded per the registry', () => {
    renderSim(simCar)
    expect(screen.getByText('3.2')).toBeInTheDocument()
    expect(screen.getByText('217')).toBeInTheDocument()
    expect(screen.getByText('0.200')).toBeInTheDocument()
  })

  it('renders the em dash for a null metric', () => {
    renderSim(simCar)
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('keeps the identity columns (make, model)', () => {
    renderSim(simCar)
    const row = screen.getByRole('row')
    expect(within(row).getByText('Porsche')).toBeInTheDocument()
    expect(within(row).getByText('911 GT3 RS')).toBeInTheDocument()
  })
})

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
  weightLb: null, frontWeight: null, displacementL: null, rarity: null,
  source: 'Autoshow',
  sourceInfo: null,
  owned: false,
}

function renderRow(
  car: Car,
  extra: { onToggleOwned?: () => void; isPending?: boolean; onCardClick?: (car: Car) => void; isExpanded?: boolean } = {}
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

  it('calls onToggleOwned with (id, false) when clicking Owned', async () => {
    const onToggleOwned = vi.fn()
    renderRow({ ...baseCar, owned: true }, { onToggleOwned })
    await userEvent.click(screen.getByRole('button', { name: 'Owned' }))
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
})

// ─── isExpanded ──────────────────────────────────────────────────────────────

describe('CarRow — isExpanded', () => {
  it('applies expanded bg when isExpanded is true', () => {
    renderRow(baseCar, { isExpanded: true })
    expect(screen.getByRole('row').className).toContain('bg-[#1c2330]')
  })

  it('does not apply expanded bg when isExpanded is false', () => {
    renderRow(baseCar, { isExpanded: false })
    expect(screen.getByRole('row').className).not.toContain('bg-[#1c2330]')
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

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CarCard from '@/components/CarCard'
import type { Car } from '@/types/car'

const baseCar: Car = {
  id: 1,
  make: 'Toyota',
  model: 'GR86',
  year: 2022,
  division: 'Modern Sports Cars',
  piClass: 'B',
  piRating: 556,
  drivetrain: 'RWD',
  engineType: null,
  engineCC: null,
  cylinders: null,
  country: 'Japan',
  bodyStyle: null,
  statSpeed: null, statHandling: null, statAcceleration: null, statLaunch: null,
  statBraking: null, statOffroad: null, powerHp: null, torqueFtLb: null,
  weightLb: null, frontWeight: null, displacementL: null, rarity: null,
  source: 'Autoshow',
  sourceInfo: null,
  owned: false,
  tags: [],
  tagDetails: [],
}

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('CarCard — rendering', () => {
  it('renders the car model name', () => {
    render(<CarCard car={baseCar} onToggleOwned={vi.fn()} />)
    expect(screen.getByText('GR86')).toBeInTheDocument()
  })

  it('renders make and year in the subtitle', () => {
    render(<CarCard car={baseCar} onToggleOwned={vi.fn()} />)
    expect(screen.getByText(/Toyota/)).toBeInTheDocument()
    expect(screen.getByText(/2022/)).toBeInTheDocument()
  })

  it('renders the PI class badge', () => {
    render(<CarCard car={baseCar} onToggleOwned={vi.fn()} />)
    expect(screen.getByText('B')).toBeInTheDocument()
  })

  it('renders the PI rating', () => {
    render(<CarCard car={baseCar} onToggleOwned={vi.fn()} />)
    expect(screen.getByText('556')).toBeInTheDocument()
  })

  it('renders the division', () => {
    render(<CarCard car={baseCar} onToggleOwned={vi.fn()} />)
    expect(screen.getByText('Modern Sports Cars')).toBeInTheDocument()
  })

  it('renders the drivetrain when present', () => {
    render(<CarCard car={baseCar} onToggleOwned={vi.fn()} />)
    expect(screen.getByText('RWD')).toBeInTheDocument()
  })
})

// ─── Owned state ──────────────────────────────────────────────────────────────

describe('CarCard — owned state', () => {
  it('shows "Add to garage" button when not owned', () => {
    render(<CarCard car={baseCar} onToggleOwned={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Add to garage' })).toBeInTheDocument()
  })

  it('shows "Remove from garage" button when owned', () => {
    render(<CarCard car={{ ...baseCar, owned: true }} onToggleOwned={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Remove from garage' })).toBeInTheDocument()
  })

  it('shows "Owned" badge in the header when owned', () => {
    render(<CarCard car={{ ...baseCar, owned: true }} onToggleOwned={vi.fn()} />)
    expect(screen.getByText('Owned')).toBeInTheDocument()
  })

  it('does not show "Owned" badge when not owned', () => {
    render(<CarCard car={baseCar} onToggleOwned={vi.fn()} />)
    expect(screen.queryByText('Owned')).not.toBeInTheDocument()
  })
})

// ─── Toggle callbacks ─────────────────────────────────────────────────────────

describe('CarCard — onToggleOwned', () => {
  it('calls onToggleOwned with (id, true) when adding to garage', async () => {
    const onToggleOwned = vi.fn()
    render(<CarCard car={baseCar} onToggleOwned={onToggleOwned} />)
    await userEvent.click(screen.getByRole('button', { name: 'Add to garage' }))
    expect(onToggleOwned).toHaveBeenCalledWith(baseCar.id, true)
  })

  it('calls onToggleOwned with (id, false) when removing from garage', async () => {
    const onToggleOwned = vi.fn()
    render(<CarCard car={{ ...baseCar, owned: true }} onToggleOwned={onToggleOwned} />)
    await userEvent.click(screen.getByRole('button', { name: 'Remove from garage' }))
    expect(onToggleOwned).toHaveBeenCalledWith(baseCar.id, false)
  })
})

// ─── onCardClick ──────────────────────────────────────────────────────────────

describe('CarCard — onCardClick', () => {
  it('calls onCardClick with the car when the card body is clicked', async () => {
    const onCardClick = vi.fn()
    render(<CarCard car={baseCar} onToggleOwned={vi.fn()} onCardClick={onCardClick} />)
    await userEvent.click(screen.getByText('GR86'))
    expect(onCardClick).toHaveBeenCalledWith(baseCar)
  })

  it('does not call onCardClick when the owned button is clicked', async () => {
    const onCardClick = vi.fn()
    render(<CarCard car={baseCar} onToggleOwned={vi.fn()} onCardClick={onCardClick} />)
    await userEvent.click(screen.getByRole('button', { name: 'Add to garage' }))
    expect(onCardClick).not.toHaveBeenCalled()
  })
})

// ─── isPending ────────────────────────────────────────────────────────────────

describe('CarCard — isPending', () => {
  it('shows a spinner SVG in the button when isPending', () => {
    render(<CarCard car={baseCar} onToggleOwned={vi.fn()} isPending />)
    const btn = screen.getByRole('button')
    expect(btn.querySelector('svg')).toBeTruthy()
    expect(btn).not.toHaveTextContent('Add to garage')
  })

  it('button is disabled when isPending', () => {
    render(<CarCard car={baseCar} onToggleOwned={vi.fn()} isPending />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('does not call onToggleOwned when clicked while isPending', async () => {
    const onToggleOwned = vi.fn()
    render(<CarCard car={baseCar} onToggleOwned={onToggleOwned} isPending />)
    await userEvent.click(screen.getByRole('button'))
    expect(onToggleOwned).not.toHaveBeenCalled()
  })
})

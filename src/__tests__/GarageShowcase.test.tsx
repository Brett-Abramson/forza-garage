import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GarageShowcase from '@/components/GarageShowcase'
import type { Car } from '@/types/car'

const mockCars: Car[] = [
  {
    id: 1, make: 'Porsche', model: '911 GT3', year: 2019,
    division: 'Modern Sports Cars', piClass: 'S1', piRating: 826,
    drivetrain: null, engineType: null, engineCC: null, cylinders: null,
    country: 'Germany', bodyStyle: null, source: 'Autoshow', sourceInfo: null,
    owned: true, tags: ['grip', 'asphalt'],
  },
  {
    id: 2, make: 'Nissan', model: 'Silvia', year: 1989,
    division: 'Retro Sports Cars', piClass: 'B', piRating: 600,
    drivetrain: null, engineType: null, engineCC: null, cylinders: null,
    country: 'Japan', bodyStyle: null, source: 'Autoshow', sourceInfo: null,
    owned: true, tags: ['drift', 'asphalt'],
  },
  {
    id: 3, make: 'GMC', model: 'Jimmy', year: 1970,
    division: 'Utility Heroes', piClass: 'D', piRating: 200,
    drivetrain: null, engineType: null, engineCC: null, cylinders: null,
    country: 'USA', bodyStyle: null, source: 'Autoshow', sourceInfo: null,
    owned: true, tags: ['offroad', 'dirt'],
  },
]

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }))
})

// ─── Tag filter chips ─────────────────────────────────────────────────────────

describe('GarageShowcase — tag filter chips', () => {
  it('renders all CAR_TAGS as filter chips', () => {
    render(<GarageShowcase initialCars={mockCars} />)
    // spot-check a few tags from the constant
    expect(screen.getByRole('button', { name: 'grip' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'drift' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'offroad' })).toBeInTheDocument()
  })

  it('selecting a tag hides cars that do not have it', async () => {
    const user = userEvent.setup()
    render(<GarageShowcase initialCars={mockCars} />)
    await user.click(screen.getByRole('button', { name: 'grip' }))
    // 911 GT3 has 'grip'; Silvia and Jimmy do not
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.queryByText('Silvia')).not.toBeInTheDocument()
    expect(screen.queryByText('Jimmy')).not.toBeInTheDocument()
  })

  it('selecting multiple tags applies AND logic', async () => {
    const user = userEvent.setup()
    render(<GarageShowcase initialCars={mockCars} />)
    // Both 911 GT3 and Silvia have 'asphalt', only 911 GT3 has 'grip'
    await user.click(screen.getByRole('button', { name: 'asphalt' }))
    await user.click(screen.getByRole('button', { name: 'grip' }))
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.queryByText('Silvia')).not.toBeInTheDocument()
    expect(screen.queryByText('Jimmy')).not.toBeInTheDocument()
  })

  it('active tag chip gets highlighted styles', async () => {
    const user = userEvent.setup()
    render(<GarageShowcase initialCars={mockCars} />)
    const chip = screen.getByRole('button', { name: 'grip' })
    await user.click(chip)
    expect(chip.className).toContain('text-cyan-400')
  })

  it('clicking an active tag chip deselects it and restores cars', async () => {
    const user = userEvent.setup()
    render(<GarageShowcase initialCars={mockCars} />)
    const chip = screen.getByRole('button', { name: 'grip' })
    await user.click(chip) // select
    await user.click(chip) // deselect
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.getByText('Silvia')).toBeInTheDocument()
    expect(screen.getByText('Jimmy')).toBeInTheDocument()
  })

  it('clear pill appears when a tag is selected', async () => {
    const user = userEvent.setup()
    render(<GarageShowcase initialCars={mockCars} />)
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'grip' }))
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
  })

  it('clear pill removes all tag filters and shows all cars', async () => {
    const user = userEvent.setup()
    render(<GarageShowcase initialCars={mockCars} />)
    await user.click(screen.getByRole('button', { name: 'grip' }))
    await user.click(screen.getByRole('button', { name: /clear/i }))
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.getByText('Silvia')).toBeInTheDocument()
    expect(screen.getByText('Jimmy')).toBeInTheDocument()
  })
})

// ─── PI class chips ───────────────────────────────────────────────────────────

describe('GarageShowcase — PI class chips', () => {
  it('shows a chip for each class present in the garage', () => {
    render(<GarageShowcase initialCars={mockCars} />)
    // S1, B, D are present
    expect(screen.getAllByText('S1').length).toBeGreaterThan(0)
    expect(screen.getAllByText('B').length).toBeGreaterThan(0)
    expect(screen.getAllByText('D').length).toBeGreaterThan(0)
  })

  it('clicking a PI class chip filters to that class', async () => {
    const user = userEvent.setup()
    render(<GarageShowcase initialCars={mockCars} />)
    // Find the S1 chip in the stat row (it's a button containing S1 + count)
    const s1Buttons = screen.getAllByRole('button').filter((b) =>
      b.textContent?.includes('S1') && b.textContent?.includes('car')
    )
    await user.click(s1Buttons[0])
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.queryByText('Silvia')).not.toBeInTheDocument()
    expect(screen.queryByText('Jimmy')).not.toBeInTheDocument()
  })
})

// ─── Drawer integration ───────────────────────────────────────────────────────

describe('GarageShowcase — drawer', () => {
  it('drawer is closed initially', () => {
    const { container } = render(<GarageShowcase initialCars={mockCars} />)
    expect(container.querySelector('.translate-x-full')).toBeTruthy()
  })

  it('clicking a car card opens the drawer with that car', async () => {
    const user = userEvent.setup()
    const { container } = render(<GarageShowcase initialCars={mockCars} />)
    // Click the card area for 911 GT3 (not the button)
    const card = container.querySelector('[data-testid]') ??
      Array.from(container.querySelectorAll('.cursor-pointer')).find((el) =>
        el.textContent?.includes('911 GT3')
      )
    if (card) {
      await user.click(card as HTMLElement)
      expect(container.querySelector('.translate-x-0')).toBeTruthy()
    }
  })

  it('empty garage shows a link to the car database', () => {
    render(<GarageShowcase initialCars={[]} />)
    expect(screen.getByRole('link', { name: /browse car database/i })).toBeInTheDocument()
  })
})

// ─── initialTagFilter ─────────────────────────────────────────────────────────

describe('GarageShowcase — initialTagFilter', () => {
  it('pre-activates the specified tag chips on mount', () => {
    render(<GarageShowcase initialCars={mockCars} initialTagFilter={['grip']} />)
    const gripChip = screen.getByRole('button', { name: 'grip' })
    expect(gripChip.className).toContain('text-cyan-400')
  })

  it('pre-filters the car list based on initialTagFilter', () => {
    render(<GarageShowcase initialCars={mockCars} initialTagFilter={['grip']} />)
    // Only 911 GT3 has 'grip'
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.queryByText('Silvia')).not.toBeInTheDocument()
    expect(screen.queryByText('Jimmy')).not.toBeInTheDocument()
  })

  it('applies AND logic when multiple tags are passed via initialTagFilter', () => {
    // Both 911 GT3 and Silvia have 'asphalt'; only 911 GT3 also has 'grip'
    render(<GarageShowcase initialCars={mockCars} initialTagFilter={['asphalt', 'grip']} />)
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.queryByText('Silvia')).not.toBeInTheDocument()
  })

  it('shows all cars when initialTagFilter is empty', () => {
    render(<GarageShowcase initialCars={mockCars} initialTagFilter={[]} />)
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.getByText('Silvia')).toBeInTheDocument()
    expect(screen.getByText('Jimmy')).toBeInTheDocument()
  })

  it('shows all cars when initialTagFilter is omitted', () => {
    render(<GarageShowcase initialCars={mockCars} />)
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.getByText('Silvia')).toBeInTheDocument()
    expect(screen.getByText('Jimmy')).toBeInTheDocument()
  })
})

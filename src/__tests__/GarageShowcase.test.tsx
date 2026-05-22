import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GarageShowcase from '@/components/GarageShowcase'
import { RACE_TYPES } from '@/lib/races'
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
    expect(screen.getByRole('button', { name: 'grip' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'drift' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'offroad' })).toBeInTheDocument()
  })

  it('selecting a tag hides cars that do not have it', async () => {
    const user = userEvent.setup()
    render(<GarageShowcase initialCars={mockCars} />)
    await user.click(screen.getByRole('button', { name: 'grip' }))
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.queryByText('Silvia')).not.toBeInTheDocument()
    expect(screen.queryByText('Jimmy')).not.toBeInTheDocument()
  })

  it('selecting multiple tags applies AND logic', async () => {
    const user = userEvent.setup()
    render(<GarageShowcase initialCars={mockCars} />)
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
    await user.click(chip)
    await user.click(chip)
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
    expect(screen.getAllByText('S1').length).toBeGreaterThan(0)
    expect(screen.getAllByText('B').length).toBeGreaterThan(0)
    expect(screen.getAllByText('D').length).toBeGreaterThan(0)
  })

  it('clicking a PI class chip filters to that class', async () => {
    const user = userEvent.setup()
    render(<GarageShowcase initialCars={mockCars} />)
    const s1Buttons = screen.getAllByRole('button').filter((b) =>
      b.textContent?.includes('S1') && b.textContent?.includes('car')
    )
    await user.click(s1Buttons[0])
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.queryByText('Silvia')).not.toBeInTheDocument()
    expect(screen.queryByText('Jimmy')).not.toBeInTheDocument()
  })
})

// ─── Filter mode toggle ───────────────────────────────────────────────────────

describe('GarageShowcase — filter mode toggle', () => {
  it('defaults to tags mode — tag chips are visible', () => {
    render(<GarageShowcase initialCars={mockCars} />)
    expect(screen.getByRole('button', { name: 'grip' })).toBeInTheDocument()
  })

  it('switching to Race type mode shows race pills', async () => {
    const user = userEvent.setup()
    render(<GarageShowcase initialCars={mockCars} />)
    await user.click(screen.getByRole('button', { name: 'Race type' }))
    for (const race of RACE_TYPES) {
      expect(screen.getByRole('button', { name: new RegExp(race.name, 'i') })).toBeInTheDocument()
    }
  })

  it('switching to Race type mode hides tag chips', async () => {
    const user = userEvent.setup()
    render(<GarageShowcase initialCars={mockCars} />)
    await user.click(screen.getByRole('button', { name: 'Race type' }))
    expect(screen.queryByRole('button', { name: 'grip' })).not.toBeInTheDocument()
  })

  it('switching back to Tags mode shows tag chips again', async () => {
    const user = userEvent.setup()
    render(<GarageShowcase initialCars={mockCars} />)
    await user.click(screen.getByRole('button', { name: 'Race type' }))
    await user.click(screen.getByRole('button', { name: 'Tags' }))
    expect(screen.getByRole('button', { name: 'grip' })).toBeInTheDocument()
  })

  it('switching to Tags mode clears the active race', async () => {
    const user = userEvent.setup()
    render(<GarageShowcase initialCars={mockCars} />)
    await user.click(screen.getByRole('button', { name: 'Race type' }))
    await user.click(screen.getByRole('button', { name: /Road Racing/i }))
    await user.click(screen.getByRole('button', { name: 'Tags' }))
    // All cars visible again — race filter cleared
    expect(screen.getByText('Jimmy')).toBeInTheDocument()
  })
})

// ─── Race filter ──────────────────────────────────────────────────────────────

describe('GarageShowcase — race filter', () => {
  it('selecting a race pill activates it with amber styles', async () => {
    const user = userEvent.setup()
    render(<GarageShowcase initialCars={mockCars} />)
    await user.click(screen.getByRole('button', { name: 'Race type' }))
    const roadBtn = screen.getByRole('button', { name: /Road Racing/i })
    await user.click(roadBtn)
    expect(roadBtn.className).toContain('text-amber-400')
  })

  it('race filter uses OR logic — shows cars matching any recommended tag', async () => {
    const user = userEvent.setup()
    render(<GarageShowcase initialCars={mockCars} />)
    await user.click(screen.getByRole('button', { name: 'Race type' }))
    // Road Racing recommendedTags include 'asphalt' and 'grip'
    // 911 GT3 has ['grip', 'asphalt'] — matches
    // Silvia has ['drift', 'asphalt'] — matches via 'asphalt'
    // Jimmy has ['offroad', 'dirt'] — no road tags, should be hidden
    await user.click(screen.getByRole('button', { name: /Road Racing/i }))
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.getByText('Silvia')).toBeInTheDocument()
    expect(screen.queryByText('Jimmy')).not.toBeInTheDocument()
  })

  it('deselecting a race pill restores all cars', async () => {
    const user = userEvent.setup()
    render(<GarageShowcase initialCars={mockCars} />)
    await user.click(screen.getByRole('button', { name: 'Race type' }))
    const roadBtn = screen.getByRole('button', { name: /Road Racing/i })
    await user.click(roadBtn)
    await user.click(roadBtn)
    expect(screen.getByText('Jimmy')).toBeInTheDocument()
  })

  it('race tray slides in when a race pill is selected', async () => {
    const user = userEvent.setup()
    const { container } = render(<GarageShowcase initialCars={mockCars} />)
    await user.click(screen.getByRole('button', { name: 'Race type' }))
    await user.click(screen.getByRole('button', { name: /Road Racing/i }))
    expect(container.querySelector('.grid-rows-\\[1fr\\]')).toBeTruthy()
  })
})

// ─── Car count ────────────────────────────────────────────────────────────────

describe('GarageShowcase — car count', () => {
  it('shows total count when no filters are active', () => {
    render(<GarageShowcase initialCars={mockCars} />)
    expect(screen.getByText(/showing 3 cars/i)).toBeInTheDocument()
  })

  it('count updates when a tag filter is applied', async () => {
    const user = userEvent.setup()
    render(<GarageShowcase initialCars={mockCars} />)
    await user.click(screen.getByRole('button', { name: 'grip' }))
    expect(screen.getByText(/showing 1 car/i)).toBeInTheDocument()
  })

  it('shows singular "car" when exactly one result', async () => {
    const user = userEvent.setup()
    render(<GarageShowcase initialCars={mockCars} />)
    await user.click(screen.getByRole('button', { name: 'grip' }))
    expect(screen.getByText(/showing 1 car\b/i)).toBeInTheDocument()
  })
})

// ─── Drawer (grid view only) ──────────────────────────────────────────────────

describe('GarageShowcase — drawer', () => {
  it('drawer is closed initially', () => {
    const { container } = render(<GarageShowcase initialCars={mockCars} />)
    expect(container.querySelector('.translate-x-full')).toBeTruthy()
  })

  it('clicking a car card opens the drawer in grid view', async () => {
    const user = userEvent.setup()
    const { container } = render(<GarageShowcase initialCars={mockCars} />)
    await user.click(screen.getByTitle('Grid view'))
    const card = Array.from(container.querySelectorAll('.cursor-pointer')).find((el) =>
      el.textContent?.includes('911 GT3')
    )
    expect(card).toBeTruthy()
    await user.click(card as HTMLElement)
    expect(container.querySelector('.translate-x-0')).toBeTruthy()
  })

  it('clicking a row in table view does not open the drawer', async () => {
    const user = userEvent.setup()
    const { container } = render(<GarageShowcase initialCars={mockCars} />)
    const row = screen.getByText('911 GT3').closest('tr')!
    await user.click(row)
    expect(container.querySelector('.translate-x-0')).toBeFalsy()
  })

  it('empty garage shows a link to the car database', () => {
    render(<GarageShowcase initialCars={[]} />)
    expect(screen.getByRole('link', { name: /browse car database/i })).toBeInTheDocument()
  })
})

// ─── List view row expansion ──────────────────────────────────────────────────

describe('GarageShowcase — list view expansion', () => {
  it('default view is table', () => {
    const { container } = render(<GarageShowcase initialCars={mockCars} />)
    expect(container.querySelector('table')).toBeInTheDocument()
  })

  it('clicking a row expands it to show tags and notes', async () => {
    const user = userEvent.setup()
    render(<GarageShowcase initialCars={mockCars} />)
    await user.click(screen.getByText('911 GT3').closest('tr')!)
    expect(screen.getByPlaceholderText('Notes...')).toBeInTheDocument()
  })

  it('expanded row shows the car\'s current tags as removable pills', async () => {
    const user = userEvent.setup()
    render(<GarageShowcase initialCars={mockCars} />)
    await user.click(screen.getByText('911 GT3').closest('tr')!)
    // 911 GT3 has tags ['grip', 'asphalt'] — both should appear in the expansion
    const buttons = screen.getAllByRole('button')
    const gripPill = buttons.find((b) => b.textContent?.includes('grip') && b.className.includes('cyan'))
    expect(gripPill).toBeTruthy()
  })

  it('expanded row shows available tags as add buttons', async () => {
    const user = userEvent.setup()
    render(<GarageShowcase initialCars={mockCars} />)
    await user.click(screen.getByText('911 GT3').closest('tr')!)
    // 'drift' is not on the 911 GT3, so it should appear as an add button
    expect(screen.getByRole('button', { name: '+ drift' })).toBeInTheDocument()
  })

  it('clicking the same row again collapses it', async () => {
    const user = userEvent.setup()
    render(<GarageShowcase initialCars={mockCars} />)
    const row = screen.getByText('911 GT3').closest('tr')!
    await user.click(row)
    await user.click(row)
    expect(screen.queryByPlaceholderText('Notes...')).not.toBeInTheDocument()
  })

  it('only one row is expanded at a time', async () => {
    const user = userEvent.setup()
    render(<GarageShowcase initialCars={mockCars} />)
    await user.click(screen.getByText('911 GT3').closest('tr')!)
    await user.click(screen.getByText('Silvia').closest('tr')!)
    expect(screen.getAllByPlaceholderText('Notes...').length).toBe(1)
  })

  it('adding a tag calls the garage API', async () => {
    const user = userEvent.setup()
    render(<GarageShowcase initialCars={mockCars} />)
    await user.click(screen.getByText('911 GT3').closest('tr')!)
    await user.click(screen.getByRole('button', { name: '+ drift' }))
    expect(fetch).toHaveBeenCalledWith(
      '/api/garage/1',
      expect.objectContaining({ method: 'PATCH' })
    )
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
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.queryByText('Silvia')).not.toBeInTheDocument()
    expect(screen.queryByText('Jimmy')).not.toBeInTheDocument()
  })

  it('applies AND logic when multiple tags are passed via initialTagFilter', () => {
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

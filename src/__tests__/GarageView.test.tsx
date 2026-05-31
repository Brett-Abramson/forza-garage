import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GarageView from '@/components/GarageView'
import type { Car } from '@/types/car'

// Three cars with distinct make/PI rating/class for sort verification
const mockCars: Car[] = [
  {
    id: 1, make: 'Porsche', model: '911 GT3', year: 2019, division: 'Modern Sports Cars',
    piClass: 'S1', piRating: 826, drivetrain: null, engineType: null,
    engineCC: null, cylinders: null, country: 'Germany', bodyStyle: null,
    statSpeed: null, statHandling: null, statAcceleration: null, statLaunch: null,
    statBraking: null, statOffroad: null, powerHp: null, torqueFtLb: null,
    weightLb: null, frontWeight: null, displacementL: null, value: null, rarity: null,
    source: 'Autoshow', sourceInfo: null, owned: false,
  },
  {
    id: 2, make: 'Ford', model: 'Mustang GT500', year: 2020, division: 'Modern Muscle',
    piClass: 'A', piRating: 800, drivetrain: null, engineType: null,
    engineCC: null, cylinders: null, country: 'USA', bodyStyle: null,
    statSpeed: null, statHandling: null, statAcceleration: null, statLaunch: null,
    statBraking: null, statOffroad: null, powerHp: null, torqueFtLb: null,
    weightLb: null, frontWeight: null, displacementL: null, value: null, rarity: null,
    source: 'Autoshow', sourceInfo: null, owned: false,
  },
  {
    id: 3, make: 'Bugatti', model: 'Chiron', year: 2018, division: 'Hypercars',
    piClass: 'R', piRating: 999, drivetrain: null, engineType: null,
    engineCC: null, cylinders: null, country: 'France', bodyStyle: null,
    statSpeed: null, statHandling: null, statAcceleration: null, statLaunch: null,
    statBraking: null, statOffroad: null, powerHp: null, torqueFtLb: null,
    weightLb: null, frontWeight: null, displacementL: null, value: null, rarity: null,
    source: 'Autoshow', sourceInfo: null, owned: false,
  },
]

// Column indices in the table (0-based)
const COL = { piClass: 0, piRating: 1, year: 2, make: 3, model: 4 }

function getColumnValues(colIndex: number) {
  const rows = screen.getAllByRole('row').slice(1) // skip header
  return rows.map((row) => within(row).getAllByRole('cell')[colIndex].textContent?.trim() ?? '')
}

async function switchToTable(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByTitle('Table view'))
}

function getHeader(name: RegExp) {
  return screen.getAllByRole('columnheader').find((th) => name.test(th.textContent ?? ''))!
}

beforeEach(() => {
  // Prevent real fetch calls from toggle-owned during tests
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => mockCars[0] }))
})

describe('GarageView — view toggle', () => {
  it('starts in grid view (no table rendered)', () => {
    render(<GarageView initialCars={mockCars} />)
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('shows table after clicking the table-view button', async () => {
    const user = userEvent.setup()
    render(<GarageView initialCars={mockCars} />)
    await switchToTable(user)
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('shows all cars in the table', async () => {
    const user = userEvent.setup()
    render(<GarageView initialCars={mockCars} />)
    await switchToTable(user)
    const rows = screen.getAllByRole('row').slice(1)
    expect(rows).toHaveLength(mockCars.length)
  })
})

describe('GarageView — default sort', () => {
  it('sorts by highest PI class then rating when no column is selected', async () => {
    const user = userEvent.setup()
    render(<GarageView initialCars={mockCars} />)
    await switchToTable(user)
    // default: R (999) → S1 (826) → A (800)
    expect(getColumnValues(COL.make)).toEqual(['Bugatti', 'Porsche', 'Ford'])
  })

  it('no column header has aria-sort set initially', async () => {
    const user = userEvent.setup()
    render(<GarageView initialCars={mockCars} />)
    await switchToTable(user)
    const headers = screen.getAllByRole('columnheader')
    const sorted = headers.filter((th) => th.hasAttribute('aria-sort'))
    expect(sorted).toHaveLength(0)
  })
})

describe('GarageView — column sort', () => {
  it('clicking Make sorts alphabetically ascending', async () => {
    const user = userEvent.setup()
    render(<GarageView initialCars={mockCars} />)
    await switchToTable(user)
    await user.click(getHeader(/^make/i))
    expect(getColumnValues(COL.make)).toEqual(['Bugatti', 'Ford', 'Porsche'])
  })

  it('clicking Make twice reverses to descending', async () => {
    const user = userEvent.setup()
    render(<GarageView initialCars={mockCars} />)
    await switchToTable(user)
    await user.click(getHeader(/^make/i))
    await user.click(getHeader(/^make/i))
    expect(getColumnValues(COL.make)).toEqual(['Porsche', 'Ford', 'Bugatti'])
  })

  it('clicking PI sorts by rating ascending', async () => {
    const user = userEvent.setup()
    render(<GarageView initialCars={mockCars} />)
    await switchToTable(user)
    await user.click(getHeader(/^pi/i))
    expect(getColumnValues(COL.piRating)).toEqual(['800', '826', '999'])
  })

  it('clicking PI twice sorts by rating descending', async () => {
    const user = userEvent.setup()
    render(<GarageView initialCars={mockCars} />)
    await switchToTable(user)
    await user.click(getHeader(/^pi/i))
    await user.click(getHeader(/^pi/i))
    expect(getColumnValues(COL.piRating)).toEqual(['999', '826', '800'])
  })

  it('clicking Class sorts by game order ascending (D→X)', async () => {
    const user = userEvent.setup()
    render(<GarageView initialCars={mockCars} />)
    await switchToTable(user)
    await user.click(getHeader(/^class/i))
    // A < S1 < R
    expect(getColumnValues(COL.piClass)).toEqual(['A', 'S1', 'R'])
  })

  it('clicking Year sorts chronologically ascending', async () => {
    const user = userEvent.setup()
    render(<GarageView initialCars={mockCars} />)
    await switchToTable(user)
    await user.click(getHeader(/^year/i))
    expect(getColumnValues(COL.year)).toEqual(['2018', '2019', '2020'])
  })

  it('switching from one column to another resets to ascending', async () => {
    const user = userEvent.setup()
    render(<GarageView initialCars={mockCars} />)
    await switchToTable(user)
    // click Make twice → descending
    await user.click(getHeader(/^make/i))
    await user.click(getHeader(/^make/i))
    // now click PI → should be ascending (lowest first)
    await user.click(getHeader(/^pi/i))
    expect(getColumnValues(COL.piRating)).toEqual(['800', '826', '999'])
  })
})

describe('GarageView — aria-sort', () => {
  it('sets aria-sort="ascending" on the active column after first click', async () => {
    const user = userEvent.setup()
    render(<GarageView initialCars={mockCars} />)
    await switchToTable(user)
    await user.click(getHeader(/^make/i))
    expect(getHeader(/^make/i)).toHaveAttribute('aria-sort', 'ascending')
  })

  it('sets aria-sort="descending" after second click on same column', async () => {
    const user = userEvent.setup()
    render(<GarageView initialCars={mockCars} />)
    await switchToTable(user)
    await user.click(getHeader(/^make/i))
    await user.click(getHeader(/^make/i))
    expect(getHeader(/^make/i)).toHaveAttribute('aria-sort', 'descending')
  })

  it('removes aria-sort from previous column when switching', async () => {
    const user = userEvent.setup()
    render(<GarageView initialCars={mockCars} />)
    await switchToTable(user)
    await user.click(getHeader(/^make/i))
    await user.click(getHeader(/^pi/i))
    expect(getHeader(/^make/i)).not.toHaveAttribute('aria-sort')
    expect(getHeader(/^pi/i)).toHaveAttribute('aria-sort', 'ascending')
  })
})

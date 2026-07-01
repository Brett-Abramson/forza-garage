import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from './test-utils'
import userEvent from '@testing-library/user-event'
import GarageShowcase from '@/components/GarageShowcase'
import { NavControlsProvider, useNavControls } from '@/context/NavControls'
import { GridIcon, TableIcon } from '@/components/table-ui'
import { RACE_TYPES } from '@/lib/races'
import type { Car } from '@/types/car'
import { useSearchParams } from 'next/navigation'

// Mutations go through Server Actions, not fetch — mock the action module.
vi.mock('@/server/actions/garage', () => ({
  setOwned:    vi.fn().mockResolvedValue({ ok: true, car: { id: 1, owned: false } }),
  setTags:     vi.fn().mockResolvedValue({ ok: true }),
  setNotes:    vi.fn().mockResolvedValue({ ok: true }),
  tuneCar:     vi.fn().mockResolvedValue({ ok: true }),
  resetTuning: vi.fn().mockResolvedValue({ ok: true, car: null }),
  setPinned:   vi.fn().mockResolvedValue({ ok: true }),
}))

function NavToggle() {
  const { controls } = useNavControls()
  if (!controls) return null
  return (
    <div>
      <button title="Grid view" onClick={() => controls.setView('grid')}><GridIcon /></button>
      <button title="Table view" onClick={() => controls.setView('table')}><TableIcon /></button>
    </div>
  )
}

function renderShowcase(cars: Car[]) {
  return render(
    <NavControlsProvider>
      <NavToggle />
      <GarageShowcase initialCars={cars} />
    </NavControlsProvider>
  )
}

const mockCars: Car[] = [
  {
    id: 1, make: 'Porsche', model: '911 GT3', year: 2019,
    division: 'Modern Sports Cars', piClass: 'S1', piRating: 826,
    drivetrain: null, engineType: null, engineCC: null, cylinders: null,
    country: 'Germany', bodyStyle: null, source: 'Autoshow', sourceInfo: null,
    statSpeed: null, statHandling: null, statAcceleration: null, statLaunch: null,
    statBraking: null, statOffroad: null, powerHp: null, torqueFtLb: null,
    weightLb: null, frontWeight: null, displacementL: null, value: null, rarity: null,
    simZeroToSixty: null, simZeroToHundred: null, simBraking60: null, simBraking100: null, simLateralG60: null, simLateralG120: null, simTopSpeed: null, simAeroEfficiency: null, simMechBalance: null, simAeroBalance: null,
    owned: true,
    // Modern Sports Cars v2 auto-tags: asphalt + street racing.
    // User adds long straights + technical so Road Racing wins the tie-break
    // (road and street both score 3; road appears first in RACE_TYPES stable sort).
    tags: ['asphalt', 'street racing', 'long straights', 'technical'],
    tagDetails: [
      { tag: 'asphalt',        source: 'auto' },
      { tag: 'street racing',  source: 'auto' },
      { tag: 'long straights', source: 'user' },
      { tag: 'technical',      source: 'user' },
    ],
  },
  {
    id: 2, make: 'Nissan', model: 'Silvia', year: 1989,
    division: 'Retro Sports Cars', piClass: 'B', piRating: 600,
    drivetrain: null, engineType: null, engineCC: null, cylinders: null,
    country: 'Japan', bodyStyle: null, source: 'Autoshow', sourceInfo: null,
    statSpeed: null, statHandling: null, statAcceleration: null, statLaunch: null,
    statBraking: null, statOffroad: null, powerHp: null, torqueFtLb: null,
    weightLb: null, frontWeight: null, displacementL: null, value: null, rarity: null,
    simZeroToSixty: null, simZeroToHundred: null, simBraking60: null, simBraking100: null, simLateralG60: null, simLateralG120: null, simTopSpeed: null, simAeroEfficiency: null, simMechBalance: null, simAeroBalance: null,
    owned: true,
    tags: ['drift', 'asphalt'],
    tagDetails: [{ tag: 'drift', source: 'user' }, { tag: 'asphalt', source: 'auto' }],
  },
  {
    id: 3, make: 'GMC', model: 'Jimmy', year: 1970,
    division: 'Utility Heroes', piClass: 'D', piRating: 200,
    drivetrain: null, engineType: null, engineCC: null, cylinders: null,
    country: 'USA', bodyStyle: null, source: 'Autoshow', sourceInfo: null,
    statSpeed: null, statHandling: null, statAcceleration: null, statLaunch: null,
    statBraking: null, statOffroad: null, powerHp: null, torqueFtLb: null,
    weightLb: null, frontWeight: null, displacementL: null, value: null, rarity: null,
    simZeroToSixty: null, simZeroToHundred: null, simBraking60: null, simBraking100: null, simLateralG60: null, simLateralG120: null, simTopSpeed: null, simAeroEfficiency: null, simMechBalance: null, simAeroBalance: null,
    owned: true,
    tags: ['offroad', 'dirt'],
    tagDetails: [{ tag: 'offroad', source: 'auto' }, { tag: 'dirt', source: 'auto' }],
  },
]

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }))
})

// ─── Tag filter chips ─────────────────────────────────────────────────────────
// Tags are in the "More filters" disclosure section of the sidebar.
// The section auto-opens when tags are already active; otherwise click to expand.

describe('GarageShowcase — tag filter chips', () => {
  async function openMoreFilters(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('button', { name: /more filters/i }))
  }

  it('renders all CAR_TAGS as filter chips in the More filters section', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
    await openMoreFilters(user)
    expect(screen.getByRole('button', { name: 'grip' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'drift' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'offroad' })).toBeInTheDocument()
  })

  it('selecting a tag hides cars that do not have it', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
    await openMoreFilters(user)
    // 'technical' is only on 911 GT3 (Modern Sports Cars); Silvia and Jimmy don't have it
    await user.click(screen.getByRole('button', { name: 'technical' }))
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.queryByText('Silvia')).not.toBeInTheDocument()
    expect(screen.queryByText('Jimmy')).not.toBeInTheDocument()
  })

  it('selecting multiple tags applies AND logic', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
    await openMoreFilters(user)
    // asphalt: 911 GT3 + Silvia. Adding 'technical' narrows to 911 GT3 only.
    await user.click(screen.getByRole('button', { name: 'asphalt' }))
    await user.click(screen.getByRole('button', { name: 'technical' }))
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.queryByText('Silvia')).not.toBeInTheDocument()
    expect(screen.queryByText('Jimmy')).not.toBeInTheDocument()
  })

  it('active tag chip gets highlighted styles', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
    await openMoreFilters(user)
    const chip = screen.getByRole('button', { name: 'technical' })
    await user.click(chip)
    expect(chip.className).toContain('text-fh-red')
  })

  it('clicking an active tag chip deselects it and restores cars', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
    await openMoreFilters(user)
    const chip = screen.getByRole('button', { name: 'technical' })
    await user.click(chip)
    await user.click(chip)
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.getByText('Silvia')).toBeInTheDocument()
    expect(screen.getByText('Jimmy')).toBeInTheDocument()
  })

  it('sidebar header shows "Clear all" when a tag is selected', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
    await openMoreFilters(user)
    await user.click(screen.getByRole('button', { name: 'technical' }))
    expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument()
  })

  it('"Clear all" removes all tag filters and restores all cars', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
    await openMoreFilters(user)
    await user.click(screen.getByRole('button', { name: 'technical' }))
    await user.click(screen.getByRole('button', { name: /clear all/i }))
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.getByText('Silvia')).toBeInTheDocument()
    expect(screen.getByText('Jimmy')).toBeInTheDocument()
  })
})

// ─── PI class chips ───────────────────────────────────────────────────────────

describe('GarageShowcase — PI class chips', () => {
  it('shows a chip for each class present in the garage', () => {
    renderShowcase(mockCars)
    expect(screen.getAllByText('S1').length).toBeGreaterThan(0)
    expect(screen.getAllByText('B').length).toBeGreaterThan(0)
    expect(screen.getAllByText('D').length).toBeGreaterThan(0)
  })

  it('clicking a PI class chip in the sidebar filters to that class', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
    // The sidebar always shows class filter buttons (D, C, B, A, S1, S2, R)
    await user.click(screen.getByRole('button', { name: 'S1' }))
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.queryByText('Silvia')).not.toBeInTheDocument()
    expect(screen.queryByText('Jimmy')).not.toBeInTheDocument()
  })
})

// ─── Sidebar filter sections ──────────────────────────────────────────────────
// The sidebar replaces the old filter mode toggle (Tags / Race type).
// Race type chips are always visible; tags are behind "More filters".

describe('GarageShowcase — sidebar filter sections', () => {
  it('race type chips are always visible in the sidebar', () => {
    renderShowcase(mockCars)
    for (const race of RACE_TYPES) {
      expect(screen.getByRole('button', { name: new RegExp(race.name, 'i') })).toBeInTheDocument()
    }
  })

  it('tag chips are hidden until More filters is expanded', () => {
    renderShowcase(mockCars)
    expect(screen.queryByRole('button', { name: 'grip' })).not.toBeInTheDocument()
  })

  it('expanding More filters reveals tag chips', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
    await user.click(screen.getByRole('button', { name: /more filters/i }))
    expect(screen.getByRole('button', { name: 'grip' })).toBeInTheDocument()
  })

  it('collapsing More filters hides tag chips again', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
    await user.click(screen.getByRole('button', { name: /more filters/i }))
    await user.click(screen.getByRole('button', { name: /more filters/i }))
    expect(screen.queryByRole('button', { name: 'grip' })).not.toBeInTheDocument()
  })

  it('clearing all filters removes the active race and restores all cars', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
    await user.click(screen.getByRole('button', { name: /Road Racing/i }))
    // GMC Jimmy has offroad/dirt tags — no road race overlap, should be hidden
    expect(screen.queryByText('Jimmy')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /clear all/i }))
    expect(screen.getByText('Jimmy')).toBeInTheDocument()
  })
})

// ─── Race filter ──────────────────────────────────────────────────────────────
// Race type buttons are always visible in the sidebar — no mode toggle required.

describe('GarageShowcase — race filter', () => {
  it('selecting a race pill activates it with amber styles', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
    const roadBtn = screen.getByRole('button', { name: /Road Racing/i })
    await user.click(roadBtn)
    expect(roadBtn.className).toContain('text-amber-400')
  })

  it('race filter uses OR logic — shows cars matching any recommended tag', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
    // Road Racing recommendedTags include 'asphalt' and 'technical' (among others)
    // 911 GT3 has ['asphalt', 'street racing', 'long straights', 'technical'] — matches
    // Silvia has ['drift', 'asphalt'] — matches via 'asphalt'
    // Jimmy has ['offroad', 'dirt'] — no road tags, should be hidden
    await user.click(screen.getByRole('button', { name: /Road Racing/i }))
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.getByText('Silvia')).toBeInTheDocument()
    expect(screen.queryByText('Jimmy')).not.toBeInTheDocument()
  })

  it('deselecting a race pill restores all cars', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
    const roadBtn = screen.getByRole('button', { name: /Road Racing/i })
    await user.click(roadBtn)
    await user.click(roadBtn)
    expect(screen.getByText('Jimmy')).toBeInTheDocument()
  })

  it('inline description appears when a race pill is selected', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
    await user.click(screen.getByRole('button', { name: /Road Racing/i }))
    // The description panel renders the surface label in the sidebar
    expect(screen.getAllByText(/Asphalt/i).length).toBeGreaterThan(0)
  })
})

// ─── Filtered results visibility ─────────────────────────────────────────────

describe('GarageShowcase — filtered results visibility', () => {
  it('all cars are shown when no filters are active', () => {
    renderShowcase(mockCars)
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.getByText('Silvia')).toBeInTheDocument()
    expect(screen.getByText('Jimmy')).toBeInTheDocument()
  })

  it('applying a tag filter reduces visible car rows', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
    await user.click(screen.getByRole('button', { name: /more filters/i }))
    // 'technical' is only on 911 GT3
    await user.click(screen.getByRole('button', { name: 'technical' }))
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.queryByText('Silvia')).not.toBeInTheDocument()
  })

  it('shows "No cars match" when all cars are filtered out', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
    // Class R — none of the mock cars are R class
    await user.click(screen.getByRole('button', { name: 'R' }))
    expect(screen.getByText(/no cars match/i)).toBeInTheDocument()
  })
})

// ─── Drawer (grid view only) ──────────────────────────────────────────────────

describe('GarageShowcase — drawer', () => {
  it('drawer is closed initially', () => {
    const { container } = renderShowcase(mockCars)
    expect(container.querySelector('.translate-x-full')).toBeTruthy()
  })

  it('clicking a car card opens the drawer in grid view', async () => {
    const user = userEvent.setup()
    const { container } = renderShowcase(mockCars)
    await user.click(screen.getByTitle('Grid view'))
    const card = Array.from(container.querySelectorAll('.cursor-pointer')).find((el) =>
      el.textContent?.includes('911 GT3')
    )
    expect(card).toBeTruthy()
    await user.click(card as HTMLElement)
    expect(container.querySelector('.translate-x-0')).toBeTruthy()
  })

  it('clicking a row in table view opens the drawer', async () => {
    const user = userEvent.setup()
    const { container } = renderShowcase(mockCars)
    const row = screen.getByText('911 GT3').closest('tr')!
    await user.click(row)
    expect(container.querySelector('.translate-x-0')).toBeTruthy()
  })

  it('empty garage shows a link to the car database', () => {
    render(<GarageShowcase initialCars={[]} />)
    expect(screen.getByRole('link', { name: /browse car database/i })).toBeInTheDocument()
  })
})

// ─── Table view ───────────────────────────────────────────────────────────────

describe('GarageShowcase — table view', () => {
  it('default view is table', () => {
    const { container } = renderShowcase(mockCars)
    expect(container.querySelector('table')).toBeInTheDocument()
  })
})

// ─── URL param tag init ────────────────────────────────────────────────────────

describe('GarageShowcase — URL param tag init', () => {
  it('pre-activates tag chips from ?tags= URL param (More filters auto-opens)', () => {
    // When selectedTags is non-empty on mount, moreCount > 0 → More filters auto-opens
    vi.mocked(useSearchParams).mockReturnValueOnce(new URLSearchParams('tags=technical') as ReturnType<typeof useSearchParams>)
    renderShowcase(mockCars)
    // More filters auto-opened; tag chip is visible and highlighted
    const chip = screen.getByRole('button', { name: 'technical' })
    expect(chip.className).toContain('text-fh-red')
  })

  it('pre-filters the car list from ?tags= URL param', () => {
    // 'technical' only on 911 GT3 in the mock set
    vi.mocked(useSearchParams).mockReturnValueOnce(new URLSearchParams('tags=technical') as ReturnType<typeof useSearchParams>)
    renderShowcase(mockCars)
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.queryByText('Silvia')).not.toBeInTheDocument()
    expect(screen.queryByText('Jimmy')).not.toBeInTheDocument()
  })

  it('applies AND logic for comma-separated URL param tags', () => {
    // asphalt + technical → 911 GT3 only (Silvia has asphalt but not technical)
    vi.mocked(useSearchParams).mockReturnValueOnce(new URLSearchParams('tags=asphalt%2Ctechnical') as ReturnType<typeof useSearchParams>)
    renderShowcase(mockCars)
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.queryByText('Silvia')).not.toBeInTheDocument()
  })

  it('shows all cars when no tag URL params', () => {
    renderShowcase(mockCars)
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.getByText('Silvia')).toBeInTheDocument()
    expect(screen.getByText('Jimmy')).toBeInTheDocument()
  })

  it('ignores unknown tags in URL params', () => {
    vi.mocked(useSearchParams).mockReturnValueOnce(new URLSearchParams('tags=notarealtag') as ReturnType<typeof useSearchParams>)
    renderShowcase(mockCars)
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.getByText('Silvia')).toBeInTheDocument()
    expect(screen.getByText('Jimmy')).toBeInTheDocument()
  })
})

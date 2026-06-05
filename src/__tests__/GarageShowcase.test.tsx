import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GarageShowcase from '@/components/GarageShowcase'
import { NavControlsProvider, useNavControls } from '@/context/NavControls'
import { GridIcon, TableIcon } from '@/components/table-ui'
import { RACE_TYPES } from '@/lib/races'
import type { Car } from '@/types/car'
import { useSearchParams } from 'next/navigation'

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
    owned: true,
    tags: ['offroad', 'dirt'],
    tagDetails: [{ tag: 'offroad', source: 'auto' }, { tag: 'dirt', source: 'auto' }],
  },
]

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }))
})

// ─── Tag filter chips ─────────────────────────────────────────────────────────

describe('GarageShowcase — tag filter chips', () => {
  it('renders all CAR_TAGS as filter chips', () => {
    renderShowcase(mockCars)
    expect(screen.getByRole('button', { name: 'grip' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'drift' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'offroad' })).toBeInTheDocument()
  })

  it('selecting a tag hides cars that do not have it', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
    // 'technical' is only on 911 GT3 (Modern Sports Cars); Silvia and Jimmy don't have it
    await user.click(screen.getByRole('button', { name: 'technical' }))
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.queryByText('Silvia')).not.toBeInTheDocument()
    expect(screen.queryByText('Jimmy')).not.toBeInTheDocument()
  })

  it('selecting multiple tags applies AND logic', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
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
    const chip = screen.getByRole('button', { name: 'technical' })
    await user.click(chip)
    expect(chip.className).toContain('text-fh-red')
  })

  it('clicking an active tag chip deselects it and restores cars', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
    const chip = screen.getByRole('button', { name: 'technical' })
    await user.click(chip)
    await user.click(chip)
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.getByText('Silvia')).toBeInTheDocument()
    expect(screen.getByText('Jimmy')).toBeInTheDocument()
  })

  it('clear pill appears when a tag is selected', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'technical' }))
    // Tag-chip "✕ clear" appears; the inline "Clear all" link also appears
    expect(screen.getByRole('button', { name: /✕ clear/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument()
  })

  it('clear pill removes all tag filters and shows all cars', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
    await user.click(screen.getByRole('button', { name: 'technical' }))
    await user.click(screen.getByRole('button', { name: /✕ clear/i }))
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

  it('clicking a PI class chip filters to that class', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
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
    renderShowcase(mockCars)
    expect(screen.getByRole('button', { name: 'grip' })).toBeInTheDocument()
  })

  it('switching to Race type mode shows race pills', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
    await user.click(screen.getByRole('button', { name: 'Race type' }))
    for (const race of RACE_TYPES) {
      expect(screen.getByRole('button', { name: new RegExp(race.name, 'i') })).toBeInTheDocument()
    }
  })

  it('switching to Race type mode hides tag chips', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
    await user.click(screen.getByRole('button', { name: 'Race type' }))
    expect(screen.queryByRole('button', { name: 'grip' })).not.toBeInTheDocument()
  })

  it('switching back to Tags mode shows tag chips again', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
    await user.click(screen.getByRole('button', { name: 'Race type' }))
    await user.click(screen.getByRole('button', { name: 'Tags' }))
    expect(screen.getByRole('button', { name: 'grip' })).toBeInTheDocument()
  })

  it('switching to Tags mode clears the active race', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
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
    renderShowcase(mockCars)
    await user.click(screen.getByRole('button', { name: 'Race type' }))
    const roadBtn = screen.getByRole('button', { name: /Road Racing/i })
    await user.click(roadBtn)
    expect(roadBtn.className).toContain('text-amber-400')
  })

  it('race filter uses OR logic — shows cars matching any recommended tag', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
    await user.click(screen.getByRole('button', { name: 'Race type' }))
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
    await user.click(screen.getByRole('button', { name: 'Race type' }))
    const roadBtn = screen.getByRole('button', { name: /Road Racing/i })
    await user.click(roadBtn)
    await user.click(roadBtn)
    expect(screen.getByText('Jimmy')).toBeInTheDocument()
  })

  it('inline description appears when a race pill is selected', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
    await user.click(screen.getByRole('button', { name: 'Race type' }))
    await user.click(screen.getByRole('button', { name: /Road Racing/i }))
    // The description panel renders the surface label (both desktop and mobile
    // variants are in the DOM — at least one must exist).
    expect(screen.getAllByText(/Asphalt/i).length).toBeGreaterThan(0)
  })
})

// ─── Car count ────────────────────────────────────────────────────────────────
// The count is rendered in FilterBar as: "Showing <span>N</span> [of T] cars"
// Text is split across elements, so use a custom matcher on the container's textContent.

const byCount = (pattern: RegExp) =>
  (_: string, el: Element | null) =>
    !!el && el.tagName !== 'BODY' && pattern.test(el.textContent ?? '')

describe('GarageShowcase — car count', () => {
  it('shows total count when no filters are active', () => {
    renderShowcase(mockCars)
    expect(screen.getAllByText(byCount(/showing 3 cars/i))[0]).toBeInTheDocument()
  })

  it('count updates when a tag filter is applied', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
    await user.click(screen.getByRole('button', { name: 'technical' }))
    expect(screen.getAllByText(byCount(/showing 1/i))[0]).toBeInTheDocument()
  })

  it('shows singular "car" when exactly one result', async () => {
    const user = userEvent.setup()
    renderShowcase(mockCars)
    await user.click(screen.getByRole('button', { name: 'technical' }))
    // "Showing 1 of 3 cars" — check the count is 1 and "cars" (plural) is not shown alone
    const countEl = screen.getAllByText(byCount(/showing 1/i))[0]
    expect(countEl.textContent).not.toMatch(/showing 1 cars/i)
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

  it('clicking a row in table view does not open the drawer', async () => {
    const user = userEvent.setup()
    const { container } = renderShowcase(mockCars)
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
// NOTE: In jsdom, Tailwind breakpoint classes (hidden sm:table-row, sm:hidden)
// don't apply CSS — both the desktop <tr> and the mobile bottom sheet render
// their content into the DOM simultaneously. Tests use within(tbody) to target
// the desktop inline row exclusively and avoid "multiple elements" errors.

describe('GarageShowcase — list view expansion', () => {
  it('default view is table', () => {
    const { container } = renderShowcase(mockCars)
    expect(container.querySelector('table')).toBeInTheDocument()
  })

  it('clicking a row expands it to show tags and notes', async () => {
    const user = userEvent.setup()
    const { container } = renderShowcase(mockCars)
    await user.click(screen.getByText('911 GT3').closest('tr')!)
    const tbody = container.querySelector('tbody')!
    expect(within(tbody).getByPlaceholderText('Notes...')).toBeInTheDocument()
  })

  it('expanded row shows the car\'s current tags as removable pills', async () => {
    const user = userEvent.setup()
    const { container } = renderShowcase(mockCars)
    await user.click(screen.getByText('911 GT3').closest('tr')!)
    // 911 GT3 now has auto: asphalt, street racing; user: long straights, technical
    const tbody = container.querySelector('tbody')!
    expect(within(tbody).getByRole('button', { name: 'Remove asphalt' })).toBeInTheDocument()
    expect(within(tbody).getByRole('button', { name: 'Remove technical' })).toBeInTheDocument()
  })

  it('expanded row shows available tags as add buttons', async () => {
    const user = userEvent.setup()
    const { container } = renderShowcase(mockCars)
    await user.click(screen.getByText('911 GT3').closest('tr')!)
    // 'drift' is not on the 911 GT3, so it should appear as an add button
    const tbody = container.querySelector('tbody')!
    expect(within(tbody).getByRole('button', { name: '+ drift' })).toBeInTheDocument()
  })

  it('clicking the same row again collapses it', async () => {
    const user = userEvent.setup()
    const { container } = renderShowcase(mockCars)
    const row = screen.getByText('911 GT3').closest('tr')!
    await user.click(row)
    await user.click(row)
    const tbody = container.querySelector('tbody')!
    expect(within(tbody).queryByPlaceholderText('Notes...')).not.toBeInTheDocument()
  })

  it('only one row is expanded at a time', async () => {
    const user = userEvent.setup()
    const { container } = renderShowcase(mockCars)
    await user.click(screen.getByText('911 GT3').closest('tr')!)
    await user.click(screen.getByText('Silvia').closest('tr')!)
    // One ExpandedRow <tr> in the tbody (desktop); Silvia's, not 911 GT3's
    const tbody = container.querySelector('tbody')!
    expect(within(tbody).getAllByPlaceholderText('Notes...').length).toBe(1)
  })

  it('adding a tag calls the garage API', async () => {
    const user = userEvent.setup()
    const { container } = renderShowcase(mockCars)
    await user.click(screen.getByText('911 GT3').closest('tr')!)
    const tbody = container.querySelector('tbody')!
    await user.click(within(tbody).getByRole('button', { name: '+ drift' }))
    expect(fetch).toHaveBeenCalledWith(
      '/api/garage/1',
      expect.objectContaining({ method: 'PATCH' })
    )
  })
})

// ─── Expanded row — tuning content ───────────────────────────────────────────

describe('GarageShowcase — expanded row tuning content', () => {
  it('shows a "Best for" race type line when the car has matching tags', async () => {
    const user = userEvent.setup()
    const { container } = renderShowcase(mockCars)
    await user.click(screen.getByText('911 GT3').closest('tr')!)
    // Modern Sports Cars + asphalt + street racing + long straights + technical → Road Racing (tie-break)
    const tbody = container.querySelector('tbody')!
    expect(within(tbody).getByText(/Best for:/i)).toBeInTheDocument()
    expect(within(tbody).getByRole('link', { name: /Road Racing/i })).toBeInTheDocument()
  })

  it('shows the tuning guide philosophy in the expanded row', async () => {
    const user = userEvent.setup()
    const { container } = renderShowcase(mockCars)
    await user.click(screen.getByText('911 GT3').closest('tr')!)
    const tbody = container.querySelector('tbody')!
    expect(within(tbody).getByText(/most varied division for road racing/i)).toBeInTheDocument()
  })

  it('shows the spectrum note in the expanded row', async () => {
    const user = userEvent.setup()
    const { container } = renderShowcase(mockCars)
    await user.click(screen.getByText('911 GT3').closest('tr')!)
    const tbody = container.querySelector('tbody')!
    expect(within(tbody).getByText(/lightweight naturally-aspirated RWD coupes/i)).toBeInTheDocument()
  })

  it('shows the Watch out callout in the expanded row', async () => {
    const user = userEvent.setup()
    const { container } = renderShowcase(mockCars)
    await user.click(screen.getByText('911 GT3').closest('tr')!)
    const tbody = container.querySelector('tbody')!
    expect(within(tbody).getByText(/AWD conversion without checking PI cost/i)).toBeInTheDocument()
  })

  it('shows division fallback guide when no race-type-specific guide exists', async () => {
    const user = userEvent.setup()
    const { container } = renderShowcase(mockCars)
    // Silvia: Retro Sports Cars + drift/asphalt → best match is Drift Zones
    // No tuning guide exists for Drift Zones + Retro Sports Cars,
    // but the division fallback (Sports Cars) should appear instead
    await user.click(screen.getByText('Silvia').closest('tr')!)
    const tbody = container.querySelector('tbody')!
    expect(within(tbody).queryByText(/coming soon/i)).not.toBeInTheDocument()
    expect(within(tbody).getByText(/sports cars are the most versatile/i)).toBeInTheDocument()
  })
})

// ─── URL param tag init ────────────────────────────────────────────────────────

describe('GarageShowcase — URL param tag init', () => {
  it('pre-activates tag chips from ?tags= URL param', () => {
    vi.mocked(useSearchParams).mockReturnValueOnce(new URLSearchParams('tags=technical') as ReturnType<typeof useSearchParams>)
    renderShowcase(mockCars)
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

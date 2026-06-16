import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GarageDrawer from '@/components/GarageDrawer'
import type { Car } from '@/types/car'
import { CAR_TAGS } from '@/lib/tags'

// baseCar: Modern Sports Cars, auto-tags asphalt + street racing (v2 mapping),
// plus user tags long straights + technical so Road Racing wins by stable-sort
// tie-break (road scores 3, street also scores 3, road appears first in RACE_TYPES).
const baseCar: Car = {
  id: 42,
  make: 'Porsche',
  model: '911 GT3',
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
  source: 'Autoshow',
  sourceInfo: null,
  owned: true,
  tags: ['asphalt', 'street racing', 'long straights', 'technical'],
  tagDetails: [
    { tag: 'asphalt',       source: 'auto' },
    { tag: 'street racing', source: 'auto' },
    { tag: 'long straights', source: 'user' },
    { tag: 'technical',     source: 'user' },
  ],
  notes: null,
}

function renderDrawer(
  car: Car | null = baseCar,
  extra: { onClose?: () => void; onTagDetailsChange?: (id: number, tags: { tag: string; source: string }[]) => void } = {}
) {
  const onClose = extra.onClose ?? vi.fn()
  const onTagDetailsChange = extra.onTagDetailsChange ?? vi.fn()
  return { onClose, onTagDetailsChange, ...render(
    <GarageDrawer car={car} onClose={onClose} onTagDetailsChange={onTagDetailsChange} />
  )}
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) }))
})

// ─── Visibility ───────────────────────────────────────────────────────────────

describe('GarageDrawer — visibility', () => {
  it('is off-screen (translate-x-full) when car is null', () => {
    const { container } = renderDrawer(null)
    expect(container.querySelector('.translate-x-full')).toBeTruthy()
    expect(container.querySelector('.translate-x-0')).toBeFalsy()
  })

  it('is on-screen (translate-x-0) when a car is provided', () => {
    const { container } = renderDrawer(baseCar)
    expect(container.querySelector('.translate-x-0')).toBeTruthy()
    expect(container.querySelector('.translate-x-full')).toBeFalsy()
  })
})

// ─── Car info ─────────────────────────────────────────────────────────────────

describe('GarageDrawer — car info', () => {
  it('shows make, model, and year', () => {
    renderDrawer()
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.getByText(/Porsche/)).toBeInTheDocument()
    expect(screen.getByText(/2019/)).toBeInTheDocument()
  })

  it('shows division and country', () => {
    renderDrawer()
    expect(screen.getByText('Modern Sports Cars')).toBeInTheDocument()
    expect(screen.getByText('Germany')).toBeInTheDocument()
  })

  it('shows source', () => {
    renderDrawer()
    expect(screen.getByText('Autoshow')).toBeInTheDocument()
  })

  it('shows PI class and rating', () => {
    renderDrawer()
    expect(screen.getByText('S1')).toBeInTheDocument()
    expect(screen.getByText('826')).toBeInTheDocument()
  })
})

// ─── Close behaviour ──────────────────────────────────────────────────────────

describe('GarageDrawer — close', () => {
  it('calls onClose when the X button is clicked', async () => {
    const user = userEvent.setup()
    const { onClose } = renderDrawer()
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when the overlay is clicked', async () => {
    const user = userEvent.setup()
    const { onClose, container } = renderDrawer()
    const overlay = container.querySelector('.fixed.inset-0') as HTMLElement
    await user.click(overlay)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when Escape is pressed', async () => {
    const user = userEvent.setup()
    const { onClose } = renderDrawer()
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })
})

// ─── Tag display ──────────────────────────────────────────────────────────────

describe('GarageDrawer — tag display', () => {
  it('shows both auto and user tags', () => {
    renderDrawer()
    expect(screen.getByText('asphalt')).toBeInTheDocument()       // auto
    expect(screen.getByText('street racing')).toBeInTheDocument() // auto
    expect(screen.getByText('long straights')).toBeInTheDocument() // user
    expect(screen.getByText('technical')).toBeInTheDocument()     // user
  })

  it('both user and auto tags have remove buttons', () => {
    renderDrawer()
    expect(screen.getByRole('button', { name: 'Remove long straights' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove asphalt' })).toBeInTheDocument()
  })

  it('auto tag remove button has a descriptive title', () => {
    renderDrawer()
    const autoTagBtn = screen.getByRole('button', { name: 'Remove asphalt' })
    expect(autoTagBtn.closest('[title]')).toBeTruthy()
  })

  it('shows "No tags yet" when tagDetails is empty', () => {
    renderDrawer({ ...baseCar, tags: [], tagDetails: [] })
    expect(screen.getByText(/No tags yet/i)).toBeInTheDocument()
  })

  it('removing a user tag notifies parent with updated TagDetail[]', async () => {
    const user = userEvent.setup()
    const onTagDetailsChange = vi.fn()
    renderDrawer(baseCar, { onTagDetailsChange })
    await user.click(screen.getByRole('button', { name: 'Remove long straights' }))
    expect(onTagDetailsChange).toHaveBeenCalledWith(
      baseCar.id,
      expect.arrayContaining([
        { tag: 'asphalt', source: 'auto' },
        { tag: 'street racing', source: 'auto' },
        { tag: 'technical', source: 'user' },
      ])
    )
    expect(fetch).toHaveBeenCalledWith(
      `/api/garage/${baseCar.id}`,
      expect.objectContaining({ method: 'PATCH' })
    )
  })
})

// ─── Add tags ─────────────────────────────────────────────────────────────────

describe('GarageDrawer — add tags', () => {
  it('shows tags not yet applied as addable', () => {
    renderDrawer()
    // 'dirt' is in neither auto nor user tags
    expect(screen.getByRole('button', { name: '+ dirt' })).toBeInTheDocument()
  })

  it('does not offer already-applied tags (auto or user) as addable', () => {
    renderDrawer()
    expect(screen.queryByRole('button', { name: '+ asphalt' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '+ street racing' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '+ long straights' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '+ technical' })).not.toBeInTheDocument()
  })

  it('hides the add section when all tags are applied', () => {
    const allTagDetails = CAR_TAGS.map((tag) => ({ tag, source: 'user' }))
    renderDrawer({ ...baseCar, tags: [...CAR_TAGS], tagDetails: allTagDetails })
    expect(screen.queryByText('Add tags')).not.toBeInTheDocument()
  })

  it('adding a tag notifies parent with updated TagDetail[]', async () => {
    const user = userEvent.setup()
    const onTagDetailsChange = vi.fn()
    renderDrawer(baseCar, { onTagDetailsChange })
    await user.click(screen.getByRole('button', { name: '+ dirt' }))
    expect(onTagDetailsChange).toHaveBeenCalledWith(
      baseCar.id,
      expect.arrayContaining([
        { tag: 'asphalt',        source: 'auto' },
        { tag: 'street racing',  source: 'auto' },
        { tag: 'long straights', source: 'user' },
        { tag: 'technical',      source: 'user' },
        { tag: 'dirt',           source: 'user' },
      ])
    )
    expect(fetch).toHaveBeenCalledWith(
      `/api/garage/${baseCar.id}`,
      expect.objectContaining({ method: 'PATCH' })
    )
  })
})

// ─── Race types ───────────────────────────────────────────────────────────────

describe('GarageDrawer — race types', () => {
  it('shows the Race types section when the car has matching tags', () => {
    renderDrawer()
    expect(screen.getByText('Race types')).toBeInTheDocument()
  })

  it('shows "Best for" with the top-scoring race type linked to its page', () => {
    renderDrawer()
    // Modern Sports Cars + asphalt + grip → Road Racing scores highest
    const link = screen.getByRole('link', { name: /Road Racing/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/races/road')
  })

  it('shows "Also suits" rows for secondary race types', () => {
    renderDrawer()
    // Street Racing also scores 2 for this car
    expect(screen.getAllByText(/Also suits/i).length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: /Street Racing/i })).toBeInTheDocument()
  })

  it('shows Race types even for an unknown division (asphalt fallback applies)', () => {
    // v2: unknown divisions fall back to ["asphalt"], so any car gets at
    // least one race type recommendation (Road Racing scores 1 via asphalt).
    // The old behaviour (empty tags → no section) is no longer reachable.
    const unknownDivCar = { ...baseCar, tags: [], tagDetails: [], division: 'Unknown Division' }
    renderDrawer(unknownDivCar)
    expect(screen.getByText('Race types')).toBeInTheDocument()
  })
})

// ─── Tuning guide ─────────────────────────────────────────────────────────────

describe('GarageDrawer — tuning guide', () => {
  it('shows the Tuning guide section when a race type matches', () => {
    renderDrawer()
    expect(screen.getByText('Tuning guide')).toBeInTheDocument()
  })

  it('shows the philosophy paragraph for a matched guide', () => {
    renderDrawer()
    expect(screen.getByText(/most varied division for road racing/i)).toBeInTheDocument()
  })

  it('shows the spectrum note', () => {
    renderDrawer()
    expect(screen.getByText(/lightweight naturally-aspirated RWD coupes/i)).toBeInTheDocument()
  })

  it('shows numbered priorities', () => {
    renderDrawer()
    expect(screen.getByText(/Diagnose first/i)).toBeInTheDocument()
  })

  it('shows the Watch out callout with its text', () => {
    renderDrawer()
    expect(screen.getByText(/Watch out/i)).toBeInTheDocument()
    expect(screen.getByText(/AWD conversion without checking PI cost/i)).toBeInTheDocument()
  })

  it('shows division fallback guide when no race-type-specific guide exists', () => {
    // Modern Muscle has no tuning guide for Road Racing but has a division fallback
    const noGuideCar = { ...baseCar, division: 'Modern Muscle' }
    renderDrawer(noGuideCar)
    // Division fallback content should appear instead of "coming soon"
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument()
    expect(screen.getByText(/muscle cars are built around torque/i)).toBeInTheDocument()
  })
})

// ─── Notes ────────────────────────────────────────────────────────────────────

describe('GarageDrawer — notes', () => {
  it('renders a notes textarea', () => {
    renderDrawer()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('pre-fills textarea with existing notes', () => {
    renderDrawer({ ...baseCar, notes: 'Best grip car' })
    expect(screen.getByRole('textbox')).toHaveValue('Best grip car')
  })

  it('saves notes on blur after typing', async () => {
    const user = userEvent.setup()
    renderDrawer()
    const textarea = screen.getByRole('textbox')
    await user.click(textarea)
    await user.type(textarea, 'lap time notes')
    await user.tab()
    expect(fetch).toHaveBeenCalledWith(
      `/api/garage/${baseCar.id}`,
      expect.objectContaining({
        method: 'PATCH',
        body: expect.stringContaining('notes'),
      })
    )
  })

  it('does not call fetch on blur when notes have not changed', async () => {
    const user = userEvent.setup()
    renderDrawer({ ...baseCar, notes: 'unchanged' })
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/cars/42'))
    vi.clearAllMocks()
    const textarea = screen.getByRole('textbox')
    await user.click(textarea)
    await user.tab()
    expect(fetch).not.toHaveBeenCalled()
  })
})

// ─── Stat overrides ───────────────────────────────────────────────────────────

describe('GarageDrawer — stat overrides', () => {
  // Car where the user has set a speed override (as garage/page.tsx would resolve it:
  // statSpeed already reflects the effective value, override field records the source).
  const carWithOverride: Car = {
    ...baseCar,
    statSpeed: 9.5,
    statSpeedOverride: 9.5,
  }

  // Simulates what /api/cars/:id returns — raw Car row with canonical value, no overrides.
  const canonicalCar = { ...baseCar, statSpeed: 7.5 }

  function fetchImpl(url: string, opts?: RequestInit) {
    if (opts?.method === 'PATCH') {
      return Promise.resolve({ ok: true, json: async () => ({ ok: true }) })
    }
    // GET /api/cars/:id — return canonical (no override) car data
    return Promise.resolve({ ok: true, json: async () => canonicalCar })
  }

  // ── Context gate ──────────────────────────────────────────────────────────

  it('shows "Edit manually" button for an owned car in My Garage context', () => {
    renderDrawer(baseCar)
    expect(screen.getByRole('button', { name: /Edit manually/i })).toBeInTheDocument()
  })

  it('does not show "Edit manually" in Car Database context (no onTagDetailsChange)', () => {
    render(<GarageDrawer car={baseCar} onClose={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /Edit manually/i })).not.toBeInTheDocument()
  })

  it('does not show "Edit manually" for a non-owned car even in My Garage context', () => {
    renderDrawer({ ...baseCar, owned: false })
    expect(screen.queryByRole('button', { name: /Edit manually/i })).not.toBeInTheDocument()
  })

  // ── "edited" badge ────────────────────────────────────────────────────────

  it('shows "edited" badge when a stat override is active', () => {
    renderDrawer(carWithOverride)
    expect(screen.getByText('edited')).toBeInTheDocument()
  })

  it('does not show "edited" badge when no overrides are set', () => {
    renderDrawer(baseCar)
    expect(screen.queryByText('edited')).not.toBeInTheDocument()
  })

  it('"edited" badge is absent in Car Database context even when overrides exist', () => {
    render(<GarageDrawer car={carWithOverride} onClose={vi.fn()} />)
    // The stat editor section (which contains the badge) is gated on onTagDetailsChange
    expect(screen.queryByText('edited')).not.toBeInTheDocument()
  })

  // ── "Reset to stock" visibility ───────────────────────────────────────────

  it('shows "Reset to stock" button when overrides are active (editor collapsed)', () => {
    renderDrawer(carWithOverride)
    expect(screen.getByRole('button', { name: /Reset to stock/i })).toBeInTheDocument()
  })

  it('does not show "Reset to stock" when no overrides are active', () => {
    renderDrawer(baseCar)
    expect(screen.queryByRole('button', { name: /Reset to stock/i })).not.toBeInTheDocument()
  })

  // ── Stat editor expansion ─────────────────────────────────────────────────

  it('stat inputs are hidden until "Edit manually" is clicked', () => {
    renderDrawer(baseCar)
    expect(screen.queryByRole('spinbutton', { name: /Speed/i })).not.toBeInTheDocument()
  })

  it('clicking "Edit manually" reveals stat inputs', async () => {
    const user = userEvent.setup()
    renderDrawer(baseCar)
    await user.click(screen.getByRole('button', { name: /Edit manually/i }))
    expect(screen.getByRole('spinbutton', { name: /Speed/i })).toBeInTheDocument()
  })

  it('stat inputs are pre-filled with effective values (override takes priority)', async () => {
    const user = userEvent.setup()
    renderDrawer(carWithOverride)
    await user.click(screen.getByRole('button', { name: /Edit manually/i }))
    const speedInput = screen.getByRole('spinbutton', { name: /Speed/i })
    expect(speedInput).toHaveValue(9.5)
  })

  // ── Reset to stock ────────────────────────────────────────────────────────

  it('clicking "Reset to stock" sends PATCH with all stat fields as null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(fetchImpl))
    const user = userEvent.setup()
    renderDrawer(carWithOverride)

    // Wait for the drawer's lazy-fetch to complete before interacting
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(`/api/cars/${carWithOverride.id}`))
    vi.mocked(fetch).mockClear()

    await user.click(screen.getByRole('button', { name: /Reset to stock/i }))

    await waitFor(() => {
      const patchCall = vi.mocked(fetch).mock.calls.find(
        ([, opts]) => (opts as RequestInit)?.method === 'PATCH'
      )
      expect(patchCall).toBeDefined()
      const body = JSON.parse((patchCall![1] as RequestInit).body as string)
      expect(body.statSpeed).toBeNull()
      expect(body.statHandling).toBeNull()
      expect(body.powerHp).toBeNull()
      expect(body.rarity).toBeNull()
    })
  })

  it('clicking "Reset to stock" re-fetches canonical Car values from the API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(fetchImpl))
    const user = userEvent.setup()
    renderDrawer(carWithOverride)

    await waitFor(() => expect(fetch).toHaveBeenCalledWith(`/api/cars/${carWithOverride.id}`))
    vi.mocked(fetch).mockClear()

    await user.click(screen.getByRole('button', { name: /Reset to stock/i }))

    await waitFor(() => {
      const getCalls = vi.mocked(fetch).mock.calls.filter(
        ([, opts]) => !opts || (opts as RequestInit).method !== 'PATCH'
      )
      expect(getCalls.length).toBeGreaterThanOrEqual(1)
      expect(getCalls[0][0]).toBe(`/api/cars/${carWithOverride.id}`)
    })
  })

  it('stat inputs revert to canonical values after reset', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(fetchImpl))
    const user = userEvent.setup()
    renderDrawer(carWithOverride)

    await waitFor(() => expect(fetch).toHaveBeenCalledWith(`/api/cars/${carWithOverride.id}`))

    // Expand editor — speed should show the override value (9.5)
    await user.click(screen.getByRole('button', { name: /Edit manually/i }))
    expect(screen.getByRole('spinbutton', { name: /Speed/i })).toHaveValue(9.5)

    vi.mocked(fetch).mockClear()

    // Reset to stock — "Reset to stock" button is now at bottom of expanded editor
    const resetBtn = screen.getAllByRole('button', { name: /Reset to stock/i })[0]
    await user.click(resetBtn)

    // After reset, speed input should reflect canonical value from the mocked GET (7.5)
    await waitFor(() => {
      expect(screen.getByRole('spinbutton', { name: /Speed/i })).toHaveValue(7.5)
    })
  })
})

// ─── Non-owned car ────────────────────────────────────────────────────────────

// ─── Tag editing context gate ─────────────────────────────────────────────────

describe('GarageDrawer — tag editing context gate', () => {
  it('shows Tags and Add tags when onTagDetailsChange is provided (My Garage context)', () => {
    // renderDrawer always provides onTagDetailsChange — simulates My Garage
    renderDrawer()
    expect(screen.getByText('Tags')).toBeInTheDocument()
    expect(screen.getByText('Add tags')).toBeInTheDocument()
  })

  it('hides Tags, Add tags, and Reset when onTagDetailsChange is absent (Car Database context)', () => {
    render(<GarageDrawer car={baseCar} onClose={vi.fn()} />)
    expect(screen.queryByText('Tags')).not.toBeInTheDocument()
    expect(screen.queryByText('Add tags')).not.toBeInTheDocument()
    expect(screen.queryByText(/Reset tags to defaults/i)).not.toBeInTheDocument()
  })

  it('hides tag editing for an owned car opened from Car Database', () => {
    // Even though the car is owned, no onTagDetailsChange → no tag UI
    const ownedCar: Car = { ...baseCar, owned: true }
    render(<GarageDrawer car={ownedCar} onClose={vi.fn()} />)
    expect(screen.queryByText('Tags')).not.toBeInTheDocument()
    expect(screen.queryByText('Add tags')).not.toBeInTheDocument()
  })

  it('still shows read-only content (race types, tuning guide) in Car Database context', () => {
    render(<GarageDrawer car={baseCar} onClose={vi.fn()} />)
    expect(screen.getByText('Race types')).toBeInTheDocument()
    expect(screen.getByText('Tuning guide')).toBeInTheDocument()
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
  })
})

// ─── Non-owned car ────────────────────────────────────────────────────────────

describe('GarageDrawer — non-owned car', () => {
  const unownedCar: Car = { ...baseCar, owned: false }

  it('does not render the Tags section for a non-owned car', () => {
    renderDrawer(unownedCar)
    expect(screen.queryByText('Tags')).not.toBeInTheDocument()
  })

  it('does not render the Add tags section for a non-owned car', () => {
    renderDrawer(unownedCar)
    expect(screen.queryByText('Add tags')).not.toBeInTheDocument()
  })

  it('does not render the Notes textarea for a non-owned car', () => {
    renderDrawer(unownedCar)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('still renders car info for a non-owned car', () => {
    renderDrawer(unownedCar)
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.getByText('S1')).toBeInTheDocument()
  })
})

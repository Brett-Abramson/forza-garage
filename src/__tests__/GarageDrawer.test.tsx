import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GarageDrawer from '@/components/GarageDrawer'
import type { Car, CarBadge } from "@/types/car"
import { CAR_TAGS } from '@/lib/tags'
import { setTags, setNotes, resetTuning } from '@/server/actions/garage'

// Mutations go through Server Actions, not fetch. Mock the action module so we
// can assert calls without a server. The drawer still uses fetch for the
// read-only spec GET (/api/cars/:id) on open — that stays real (stubbed below).
vi.mock('@/server/actions/garage', () => ({
  setTags:     vi.fn().mockResolvedValue({ ok: true }),
  setNotes:    vi.fn().mockResolvedValue({ ok: true }),
  tuneCar:     vi.fn().mockResolvedValue({ ok: true }),
  resetTuning: vi.fn().mockResolvedValue({ ok: true, car: null }),
  setOwned:    vi.fn().mockResolvedValue({ ok: true }),
  setPinned:   vi.fn().mockResolvedValue({ ok: true }),
}))

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
  simZeroToSixty: null, simZeroToHundred: null, simBraking60: null, simBraking100: null, simLateralG60: null, simLateralG120: null, simTopSpeed: null, simAeroEfficiency: null, simMechBalance: null, simAeroBalance: null,
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

// The body is tabbed (Overview / Guide / Tags & Notes). Content other than the
// header, division strip, and Overview lives behind a tab, so tests open the
// relevant tab before asserting on its content.
type U = ReturnType<typeof userEvent.setup>
const openTab = (user: U, name: 'Overview' | 'Guide' | 'Tags & Notes') =>
  user.click(screen.getByRole('button', { name }))

beforeEach(() => {
  vi.clearAllMocks()
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
// All of this lives in the always-visible header + division strip.

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

  it('calls onClose on a rightward swipe past the threshold', () => {
    const { onClose, container } = renderDrawer()
    const panel = container.querySelector('.fixed.top-0.right-0') as HTMLElement
    fireEvent.touchStart(panel, { touches: [{ clientX: 20, clientY: 100 }] })
    fireEvent.touchMove(panel, { touches: [{ clientX: 160, clientY: 105 }] }) // dx=140 (> 90), horizontal
    fireEvent.touchEnd(panel)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not close on a small rightward swipe under the threshold', () => {
    const { onClose, container } = renderDrawer()
    const panel = container.querySelector('.fixed.top-0.right-0') as HTMLElement
    fireEvent.touchStart(panel, { touches: [{ clientX: 20, clientY: 100 }] })
    fireEvent.touchMove(panel, { touches: [{ clientX: 60, clientY: 105 }] }) // dx=40 (< 90)
    fireEvent.touchEnd(panel)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('ignores a vertical scroll gesture (does not close)', () => {
    const { onClose, container } = renderDrawer()
    const panel = container.querySelector('.fixed.top-0.right-0') as HTMLElement
    fireEvent.touchStart(panel, { touches: [{ clientX: 20, clientY: 100 }] })
    fireEvent.touchMove(panel, { touches: [{ clientX: 25, clientY: 300 }] }) // vertical dominates → bail
    fireEvent.touchMove(panel, { touches: [{ clientX: 200, clientY: 320 }] }) // later horizontal ignored
    fireEvent.touchEnd(panel)
    expect(onClose).not.toHaveBeenCalled()
  })
})

// ─── Tag display (Tags & Notes tab) ────────────────────────────────────────────

describe('GarageDrawer — tag display', () => {
  it('shows both auto and user tags', async () => {
    const user = userEvent.setup()
    renderDrawer()
    await openTab(user, 'Tags & Notes')
    expect(screen.getByText('asphalt')).toBeInTheDocument()       // auto
    expect(screen.getByText('street racing')).toBeInTheDocument() // auto
    expect(screen.getByText('long straights')).toBeInTheDocument() // user
    expect(screen.getByText('technical')).toBeInTheDocument()     // user
  })

  it('both user and auto tags have remove buttons', async () => {
    const user = userEvent.setup()
    renderDrawer()
    await openTab(user, 'Tags & Notes')
    expect(screen.getByRole('button', { name: 'Remove long straights' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove asphalt' })).toBeInTheDocument()
  })

  it('auto tag remove button has a descriptive title', async () => {
    const user = userEvent.setup()
    renderDrawer()
    await openTab(user, 'Tags & Notes')
    const autoTagBtn = screen.getByRole('button', { name: 'Remove asphalt' })
    expect(autoTagBtn.closest('[title]')).toBeTruthy()
  })

  it('shows "No tags yet" when tagDetails is empty', async () => {
    const user = userEvent.setup()
    renderDrawer({ ...baseCar, tags: [], tagDetails: [] })
    await openTab(user, 'Tags & Notes')
    expect(screen.getByText(/No tags yet/i)).toBeInTheDocument()
  })

  it('removing a user tag notifies parent with updated TagDetail[]', async () => {
    const user = userEvent.setup()
    const onTagDetailsChange = vi.fn()
    renderDrawer(baseCar, { onTagDetailsChange })
    await openTab(user, 'Tags & Notes')
    await user.click(screen.getByRole('button', { name: 'Remove long straights' }))
    expect(onTagDetailsChange).toHaveBeenCalledWith(
      baseCar.id,
      expect.arrayContaining([
        { tag: 'asphalt', source: 'auto' },
        { tag: 'street racing', source: 'auto' },
        { tag: 'technical', source: 'user' },
      ])
    )
    expect(setTags).toHaveBeenCalledWith(baseCar.id, {
      auto: ['asphalt', 'street racing'],
      user: ['technical'],
    })
  })
})

// ─── Add tags (Tags & Notes tab) ───────────────────────────────────────────────

describe('GarageDrawer — add tags', () => {
  it('shows tags not yet applied as addable', async () => {
    const user = userEvent.setup()
    renderDrawer()
    await openTab(user, 'Tags & Notes')
    // 'dirt' is in neither auto nor user tags
    expect(screen.getByRole('button', { name: '+ dirt' })).toBeInTheDocument()
  })

  it('does not offer already-applied tags (auto or user) as addable', async () => {
    const user = userEvent.setup()
    renderDrawer()
    await openTab(user, 'Tags & Notes')
    expect(screen.queryByRole('button', { name: '+ asphalt' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '+ street racing' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '+ long straights' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '+ technical' })).not.toBeInTheDocument()
  })

  it('hides the add section when all tags are applied', async () => {
    const user = userEvent.setup()
    const allTagDetails = CAR_TAGS.map((tag) => ({ tag, source: 'user' }))
    renderDrawer({ ...baseCar, tags: [...CAR_TAGS], tagDetails: allTagDetails })
    await openTab(user, 'Tags & Notes')
    expect(screen.queryByText('Add tags')).not.toBeInTheDocument()
  })

  it('adding a tag notifies parent with updated TagDetail[]', async () => {
    const user = userEvent.setup()
    const onTagDetailsChange = vi.fn()
    renderDrawer(baseCar, { onTagDetailsChange })
    await openTab(user, 'Tags & Notes')
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
    expect(setTags).toHaveBeenCalledWith(baseCar.id, {
      auto: ['asphalt', 'street racing'],
      user: ['long straights', 'technical', 'dirt'],
    })
  })
})

// ─── Race types (Overview tab — default) ────────────────────────────────────────

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

// ─── Tuning guide (Guide tab) ───────────────────────────────────────────────────

describe('GarageDrawer — tuning guide', () => {
  it('shows the Tuning guide section when a race type matches', async () => {
    const user = userEvent.setup()
    renderDrawer()
    await openTab(user, 'Guide')
    expect(screen.getByText('Tuning guide')).toBeInTheDocument()
  })

  it('shows the philosophy paragraph for a matched guide', async () => {
    const user = userEvent.setup()
    renderDrawer()
    await openTab(user, 'Guide')
    expect(screen.getByText(/most varied division for road racing/i)).toBeInTheDocument()
  })

  it('shows the spectrum note', async () => {
    const user = userEvent.setup()
    renderDrawer()
    await openTab(user, 'Guide')
    expect(screen.getByText(/lightweight naturally-aspirated RWD coupes/i)).toBeInTheDocument()
  })

  it('shows numbered priorities', async () => {
    const user = userEvent.setup()
    renderDrawer()
    await openTab(user, 'Guide')
    expect(screen.getByText(/Diagnose first/i)).toBeInTheDocument()
  })

  it('shows the Watch out callout with its text', async () => {
    const user = userEvent.setup()
    renderDrawer()
    await openTab(user, 'Guide')
    expect(screen.getByText(/Watch out/i)).toBeInTheDocument()
    expect(screen.getByText(/AWD conversion without checking PI cost/i)).toBeInTheDocument()
  })

  it('shows division fallback guide when no race-type-specific guide exists', async () => {
    const user = userEvent.setup()
    // Modern Muscle has no tuning guide for Road Racing but has a division fallback
    const noGuideCar = { ...baseCar, division: 'Modern Muscle' }
    renderDrawer(noGuideCar)
    await openTab(user, 'Guide')
    // Division fallback content should appear instead of "coming soon"
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument()
    expect(screen.getByText(/muscle cars are built around torque/i)).toBeInTheDocument()
  })
})

// ─── Notes (Tags & Notes tab) ───────────────────────────────────────────────────

describe('GarageDrawer — notes', () => {
  it('renders a notes textarea', async () => {
    const user = userEvent.setup()
    renderDrawer()
    await openTab(user, 'Tags & Notes')
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('pre-fills textarea with existing notes', async () => {
    const user = userEvent.setup()
    renderDrawer({ ...baseCar, notes: 'Best grip car' })
    await openTab(user, 'Tags & Notes')
    expect(screen.getByRole('textbox')).toHaveValue('Best grip car')
  })

  it('saves notes on blur after typing', async () => {
    const user = userEvent.setup()
    renderDrawer()
    await openTab(user, 'Tags & Notes')
    const textarea = screen.getByRole('textbox')
    await user.click(textarea)
    await user.type(textarea, 'lap time notes')
    await user.tab()
    expect(setNotes).toHaveBeenCalledWith(baseCar.id, 'lap time notes')
  })

  it('does not call fetch on blur when notes have not changed', async () => {
    const user = userEvent.setup()
    renderDrawer({ ...baseCar, notes: 'unchanged' })
    await openTab(user, 'Tags & Notes')
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/cars/42'))
    vi.clearAllMocks()
    const textarea = screen.getByRole('textbox')
    await user.click(textarea)
    await user.tab()
    expect(fetch).not.toHaveBeenCalled()
  })
})

// ─── Stat overrides (Overview tab — default) ────────────────────────────────────

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

  it('clicking "Reset to stock" calls the resetTuning action for the car', async () => {
    vi.mocked(resetTuning).mockResolvedValue({ ok: true, car: canonicalCar as Car })
    vi.stubGlobal('fetch', vi.fn().mockImplementation(fetchImpl))
    const user = userEvent.setup()
    renderDrawer(carWithOverride)

    // Wait for the drawer's lazy spec-fetch to complete before interacting
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(`/api/cars/${carWithOverride.id}`))

    await user.click(screen.getByRole('button', { name: /Reset to stock/i }))

    await waitFor(() => {
      expect(resetTuning).toHaveBeenCalledWith(carWithOverride.id)
    })
  })

  it('clicking "Reset to stock" does not issue a second canonical GET (action returns the car)', async () => {
    vi.mocked(resetTuning).mockResolvedValue({ ok: true, car: canonicalCar as Car })
    vi.stubGlobal('fetch', vi.fn().mockImplementation(fetchImpl))
    const user = userEvent.setup()
    renderDrawer(carWithOverride)

    await waitFor(() => expect(fetch).toHaveBeenCalledWith(`/api/cars/${carWithOverride.id}`))
    vi.mocked(fetch).mockClear()

    await user.click(screen.getByRole('button', { name: /Reset to stock/i }))

    await waitFor(() => expect(resetTuning).toHaveBeenCalledWith(carWithOverride.id))
    // Canonical values come straight from the action result — no follow-up fetch.
    expect(fetch).not.toHaveBeenCalled()
  })

  it('stat inputs revert to canonical values after reset', async () => {
    vi.mocked(resetTuning).mockResolvedValue({ ok: true, car: canonicalCar as Car })
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

// ─── Tag editing context gate ─────────────────────────────────────────────────

describe('GarageDrawer — tag editing context gate', () => {
  it('shows Tags and Add tags when onTagDetailsChange is provided (My Garage context)', async () => {
    const user = userEvent.setup()
    // renderDrawer always provides onTagDetailsChange — simulates My Garage
    renderDrawer()
    await openTab(user, 'Tags & Notes')
    expect(screen.getByText('Tags')).toBeInTheDocument()
    expect(screen.getByText('Add tags')).toBeInTheDocument()
  })

  it('hides Tags, Add tags, and Reset when onTagDetailsChange is absent (Car Database context)', async () => {
    const user = userEvent.setup()
    // Owned car (so the Tags & Notes tab still exists for notes), but no tag callbacks
    render(<GarageDrawer car={baseCar} onClose={vi.fn()} />)
    await openTab(user, 'Tags & Notes')
    expect(screen.queryByText('Tags')).not.toBeInTheDocument()
    expect(screen.queryByText('Add tags')).not.toBeInTheDocument()
    expect(screen.queryByText(/Reset tags to defaults/i)).not.toBeInTheDocument()
  })

  it('hides tag editing for an owned car opened from Car Database', async () => {
    const user = userEvent.setup()
    // Even though the car is owned, no onTagDetailsChange → no tag UI
    const ownedCar: Car = { ...baseCar, owned: true }
    render(<GarageDrawer car={ownedCar} onClose={vi.fn()} />)
    await openTab(user, 'Tags & Notes')
    expect(screen.queryByText('Tags')).not.toBeInTheDocument()
    expect(screen.queryByText('Add tags')).not.toBeInTheDocument()
  })

  it('still shows read-only content (race types, tuning guide) in Car Database context', async () => {
    const user = userEvent.setup()
    render(<GarageDrawer car={baseCar} onClose={vi.fn()} />)
    // Race types live on the Overview tab (default)
    expect(screen.getByText('Race types')).toBeInTheDocument()
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    // Tuning guide lives on the Guide tab
    await openTab(user, 'Guide')
    expect(screen.getByText('Tuning guide')).toBeInTheDocument()
  })
})

// ─── Non-owned car ────────────────────────────────────────────────────────────

describe('GarageDrawer — non-owned car', () => {
  const unownedCar: Car = { ...baseCar, owned: false }

  it('does not show a Tags & Notes tab for a non-owned car', () => {
    renderDrawer(unownedCar)
    expect(screen.queryByRole('button', { name: 'Tags & Notes' })).not.toBeInTheDocument()
  })

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

// ─── Simulation section (Overview tab — default) ────────────────────────────────

describe('GarageDrawer — simulation section', () => {
  const simCar: Car = {
    ...baseCar,
    simZeroToSixty: 3.4, simZeroToHundred: 7.1, simTopSpeed: 205,
    simBraking60: 109, simBraking100: 305,
    simLateralG60: 1.05, simLateralG120: 1.12,
    simAeroEfficiency: 0.83, simMechBalance: 0.48, simAeroBalance: 0.41,
  }

  it('renders the Simulation section with the (stock spec) caption when sim data exists', () => {
    renderDrawer(simCar)
    expect(screen.getByText('Simulation')).toBeInTheDocument()
    expect(screen.getByText('(stock spec)')).toBeInTheDocument()
  })

  it('shows headline figures rounded per the registry, with combined lateral G', () => {
    renderDrawer(simCar)
    expect(screen.getByText('3.4')).toBeInTheDocument()          // 0–60
    expect(screen.getByText('205')).toBeInTheDocument()          // top speed
    expect(screen.getByText('1.05 / 1.12')).toBeInTheDocument()  // lateral G (60 / 120)
    expect(screen.getByText('0.83')).toBeInTheDocument()         // aero efficiency ratio
  })

  it('hides the section entirely when all 10 sim fields are null', () => {
    renderDrawer(baseCar) // every sim field null
    expect(screen.queryByText('Simulation')).not.toBeInTheDocument()
  })

  it('still shows the section with per-cell em dashes for partial sim data', () => {
    renderDrawer({ ...baseCar, simTopSpeed: 200 })
    expect(screen.getByText('Simulation')).toBeInTheDocument()
    expect(screen.getByText('200')).toBeInTheDocument()
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('shows the stock-spec note when the garage car has a power/weight override', () => {
    renderDrawer({ ...simCar, powerHpOverride: 650 })
    expect(screen.getByText(/power\/weight tune/i)).toBeInTheDocument()
  })

  it('does not show the stock-spec note without power/weight overrides', () => {
    renderDrawer(simCar)
    expect(screen.queryByText(/power\/weight tune/i)).not.toBeInTheDocument()
  })
})

// ─── Stat-badge left-border accents in drawer sections ──────────────────────

describe('GarageDrawer — badge border accents in Overview', () => {
  const mkBadge = (label: string, tier: CarBadge['tier'] = 'top-soft') => ({
    kind: 'percentile' as const,
    tier,
    label,
    rank: 1,
    n: 10,
  })

  const badgedCar: Car = {
    ...baseCar,
    statSpeed: 9.5,
    powerHp: 450,
    frontWeight: 42,
    displacementL: 3.0,
    simZeroToSixty: 3.4,
    simZeroToHundred: 7.1,
    simTopSpeed: 205,
    simBraking60: 109,
    simBraking100: 305,
    simLateralG60: 1.05,
    simLateralG120: 1.12,
    simAeroEfficiency: 0.83,
    simMechBalance: 0.48,
    simAeroBalance: 0.41,
    badges: {
      statSpeed:      mkBadge('top 10% speed · S1 (stock)'),
      powerHp:        mkBadge('top 10% HP · S1 (stock)', 'top-strong'),
      simZeroToSixty: mkBadge('top 5% 0–60 · S1 (stock)', 'top-strong'),
      simLateralG60:  mkBadge('top 5% lateral G · S1 (stock)', 'top-strong'),
    },
  }

  // ── Performance bars ────────────────────────────────────────────────────────

  it('qualifying bar row carries the badge label as its title', () => {
    renderDrawer(badgedCar)
    expect(screen.getByTitle('top 10% speed · S1 (stock)')).toBeInTheDocument()
  })

  it('qualifying bar row contains the badge pip (aria-hidden span)', () => {
    renderDrawer(badgedCar)
    const row = screen.getByTitle('top 10% speed · S1 (stock)')
    const pip = row.querySelector('[aria-hidden="true"]')
    expect(pip).not.toBeNull()
  })

  it('qualifying bar row value text is bold', () => {
    renderDrawer(badgedCar)
    const row = screen.getByTitle('top 10% speed · S1 (stock)')
    // The value div is inside the row and has font-bold class
    const boldEl = row.querySelector('.font-bold')
    expect(boldEl).not.toBeNull()
  })

  it('non-qualifying bar rows have no title', () => {
    renderDrawer(badgedCar)
    // statHandling is not in badges; it should have no title on its row
    // The bar label "Handling" is inside the row; find it and check the parent row
    const handlingLabel = screen.getByText('Handling')
    const row = handlingLabel.closest('.relative')
    expect(row?.getAttribute('title')).toBeFalsy()
  })

  // ── Spec tiles ──────────────────────────────────────────────────────────────

  it('qualifying spec card has a background highlight in its inline style', () => {
    renderDrawer(badgedCar)
    const card = screen.getByTitle('top 10% HP · S1 (stock)')
    expect(card.style.background).toContain('var(--fh-badge-top-strong)')
  })

  it('qualifying spec card title is on the card element', () => {
    renderDrawer(badgedCar)
    expect(screen.getByTitle('top 10% HP · S1 (stock)')).toBeInTheDocument()
  })

  it('qualifying spec card value is bold', () => {
    renderDrawer(badgedCar)
    const card = screen.getByTitle('top 10% HP · S1 (stock)')
    const valueEl = card.querySelector('.font-bold')
    expect(valueEl).not.toBeNull()
  })

  it('front-weight card has no background highlight (ineligible)', () => {
    renderDrawer(badgedCar)
    const el = screen.getByText('42%')
    const card = el.closest('[class*="bg-fh-panel"]') as HTMLElement | null
    expect(card?.style.background).toBeFalsy()
    expect(card?.getAttribute('title')).toBeFalsy()
  })

  it('displacement card has no background highlight (ineligible)', () => {
    renderDrawer(badgedCar)
    const el = screen.getByText('3 L')
    const card = el.closest('[class*="bg-fh-panel"]') as HTMLElement | null
    expect(card?.style.background).toBeFalsy()
  })

  // ── Sim cards ───────────────────────────────────────────────────────────────

  it('qualifying sim card has a background highlight in its inline style', () => {
    renderDrawer(badgedCar)
    const card = screen.getByTitle('top 5% 0–60 · S1 (stock)')
    expect(card.style.background).toContain('var(--fh-badge-top-strong)')
  })

  it('Lateral G card gets highlight when simLateralG60 qualifies; both G values still render', () => {
    renderDrawer(badgedCar)
    const card = screen.getByTitle('top 5% lateral G · S1 (stock)')
    expect(card.style.background).toContain('var(--fh-badge-top-strong)')
    // Both G60 and G120 remain visible in the same card
    expect(card.textContent).toContain('1.05')
    expect(card.textContent).toContain('1.12')
  })

  it('100–0 brake card has no background highlight (ineligible)', () => {
    renderDrawer(badgedCar)
    const el = screen.getByText('305')
    const card = el.closest('[class*="bg-fh-panel"]') as HTMLElement | null
    expect(card?.style.background).toBeFalsy()
    expect(card?.getAttribute('title')).toBeFalsy()
  })

  it('balance ratio values have no badge highlight (ineligible)', () => {
    renderDrawer(badgedCar)
    const el = screen.getByText('0.83')
    expect(el.closest('[title]')).toBeNull()
    expect((el as HTMLElement).style?.background).toBeFalsy()
  })

  it('no badge label text appears as visible text in the header pill row', () => {
    renderDrawer(badgedCar)
    expect(screen.queryByText('top 10% speed · S1 (stock)')).not.toBeInTheDocument()
  })
})

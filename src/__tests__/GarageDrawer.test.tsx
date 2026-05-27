import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GarageDrawer from '@/components/GarageDrawer'
import type { Car } from '@/types/car'
import { CAR_TAGS } from '@/lib/tags'

// baseCar has 'asphalt' as an auto tag and 'grip' as a user tag
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
  weightLb: null, frontWeight: null, displacementL: null, rarity: null,
  source: 'Autoshow',
  sourceInfo: null,
  owned: true,
  tags: ['asphalt', 'grip'],
  tagDetails: [
    { tag: 'asphalt', source: 'auto' },
    { tag: 'grip',    source: 'user' },
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
    expect(screen.getByText('asphalt')).toBeInTheDocument() // auto
    expect(screen.getByText('grip')).toBeInTheDocument()    // user
  })

  it('both user and auto tags have remove buttons', () => {
    renderDrawer()
    expect(screen.getByRole('button', { name: 'Remove grip' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove asphalt' })).toBeInTheDocument()
  })

  it('auto tag remove button has a descriptive title', () => {
    renderDrawer()
    // auto-tag wrapper element carries a tooltip explaining it is removable
    const autoTagBtn = screen.getByRole('button', { name: 'Remove asphalt' })
    // the outer span/button group for auto tags has the title
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
    await user.click(screen.getByRole('button', { name: 'Remove grip' }))
    expect(onTagDetailsChange).toHaveBeenCalledWith(
      baseCar.id,
      [{ tag: 'asphalt', source: 'auto' }]
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
    expect(screen.queryByRole('button', { name: '+ grip' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '+ asphalt' })).not.toBeInTheDocument()
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
      [
        { tag: 'asphalt', source: 'auto' },
        { tag: 'grip',    source: 'user' },
        { tag: 'dirt',    source: 'user' },
      ]
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

  it('does not show Race types when the car has no tag matches', () => {
    // A division not in DIVISION_TAGS returns no auto tags; with no user
    // tags either, every race type scores 0 and the section is hidden
    const emptyTagsCar = { ...baseCar, tags: [], tagDetails: [], division: 'Unknown Division' }
    renderDrawer(emptyTagsCar)
    expect(screen.queryByText('Race types')).not.toBeInTheDocument()
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

  it('shows "coming soon" when race matches but no guide exists for the division', () => {
    // Modern Muscle has no tuning guide for Road Racing
    const noGuideCar = { ...baseCar, division: 'Modern Muscle' }
    renderDrawer(noGuideCar)
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument()
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
    const textarea = screen.getByRole('textbox')
    await user.click(textarea)
    await user.tab()
    expect(fetch).not.toHaveBeenCalled()
  })
})

// ─── Stat entry ───────────────────────────────────────────────────────────────

describe('GarageDrawer — stat entry', () => {
  it('renders the stat entry toggle button', () => {
    renderDrawer()
    expect(screen.getByText(/enter stats manually/i)).toBeInTheDocument()
  })

  it('renders performance sub-heading', () => {
    renderDrawer()
    expect(screen.getByText(/Performance · 0–10/i)).toBeInTheDocument()
  })

  it('renders Specs sub-heading', () => {
    renderDrawer()
    expect(screen.getByText('Specs')).toBeInTheDocument()
  })

  it('renders labelled inputs for all six performance stats', () => {
    renderDrawer()
    for (const label of ['Speed', 'Handling', 'Acceleration', 'Launch', 'Braking', 'Offroad']) {
      expect(screen.getByRole('spinbutton', { name: label })).toBeInTheDocument()
    }
  })

  it('renders labelled inputs for spec fields', () => {
    renderDrawer()
    for (const label of ['Power (hp)', 'Torque (ft-lb)', 'Weight (lb)', 'Front weight (%)']) {
      expect(screen.getByRole('spinbutton', { name: label })).toBeInTheDocument()
    }
  })

  it('pre-fills stat inputs from existing car data', () => {
    renderDrawer({ ...baseCar, statSpeed: 7.5, powerHp: 450 })
    expect(screen.getByRole('spinbutton', { name: 'Speed' })).toHaveValue(7.5)
    expect(screen.getByRole('spinbutton', { name: 'Power (hp)' })).toHaveValue(450)
  })

  it('leaves inputs empty when car has no stats', () => {
    renderDrawer()
    // An empty number input has a null value in testing-library
    expect(screen.getByRole('spinbutton', { name: 'Speed' })).toHaveValue(null)
  })

  it('saves stats via PATCH to /api/cars/:id on blur after editing', async () => {
    const user = userEvent.setup()
    renderDrawer()
    const speedInput = screen.getByRole('spinbutton', { name: 'Speed' })
    await user.type(speedInput, '8.5')
    await user.tab()
    expect(fetch).toHaveBeenCalledWith(
      `/api/cars/${baseCar.id}`,
      expect.objectContaining({ method: 'PATCH' })
    )
  })

  it('does not call /api/cars when no stat has been edited', async () => {
    const user = userEvent.setup()
    renderDrawer()
    // Click and immediately blur without changing the value
    await user.click(screen.getByRole('spinbutton', { name: 'Speed' }))
    await user.tab()
    const carApiCalls = (fetch as ReturnType<typeof vi.fn>).mock.calls.filter(
      ([url]) => (url as string).includes('/api/cars/')
    )
    expect(carApiCalls).toHaveLength(0)
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

  it('still renders the stat entry toggle for a non-owned car', () => {
    renderDrawer(unownedCar)
    expect(screen.getByText(/enter stats manually/i)).toBeInTheDocument()
  })

  it('still renders car info for a non-owned car', () => {
    renderDrawer(unownedCar)
    expect(screen.getByText('911 GT3')).toBeInTheDocument()
    expect(screen.getByText('S1')).toBeInTheDocument()
  })
})

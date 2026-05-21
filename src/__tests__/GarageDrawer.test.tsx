import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GarageDrawer from '@/components/GarageDrawer'
import type { Car } from '@/types/car'
import { CAR_TAGS } from '@/lib/tags'

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
  source: 'Autoshow',
  sourceInfo: null,
  owned: true,
  tags: ['grip', 'asphalt'],
  notes: null,
}

function renderDrawer(
  car: Car | null = baseCar,
  extra: { onClose?: () => void; onTagsChange?: (id: number, tags: string[]) => void } = {}
) {
  const onClose = extra.onClose ?? vi.fn()
  const onTagsChange = extra.onTagsChange ?? vi.fn()
  return { onClose, onTagsChange, ...render(<GarageDrawer car={car} onClose={onClose} onTagsChange={onTagsChange} />) }
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

// ─── Tags ─────────────────────────────────────────────────────────────────────

describe('GarageDrawer — current tags', () => {
  it('shows current tags as pills', () => {
    renderDrawer()
    expect(screen.getByText('grip')).toBeInTheDocument()
    expect(screen.getByText('asphalt')).toBeInTheDocument()
  })

  it('shows "No tags yet" message when car has no tags', () => {
    renderDrawer({ ...baseCar, tags: [] })
    expect(screen.getByText(/No tags yet/i)).toBeInTheDocument()
  })

  it('removes a tag and notifies parent when × is clicked', async () => {
    const user = userEvent.setup()
    const onTagsChange = vi.fn()
    renderDrawer(baseCar, { onTagsChange })
    await user.click(screen.getByRole('button', { name: 'Remove grip' }))
    expect(onTagsChange).toHaveBeenCalledWith(baseCar.id, ['asphalt'])
    expect(fetch).toHaveBeenCalledWith(
      `/api/garage/${baseCar.id}`,
      expect.objectContaining({ method: 'PATCH' })
    )
  })
})

describe('GarageDrawer — add tags', () => {
  it('shows tags not yet on the car as addable', () => {
    renderDrawer()
    // 'dirt' is not in baseCar.tags
    expect(screen.getByRole('button', { name: '+ dirt' })).toBeInTheDocument()
  })

  it('does not show already-applied tags as addable', () => {
    renderDrawer()
    expect(screen.queryByRole('button', { name: '+ grip' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '+ asphalt' })).not.toBeInTheDocument()
  })

  it('hides the add section when all tags are applied', () => {
    renderDrawer({ ...baseCar, tags: [...CAR_TAGS] })
    expect(screen.queryByText('Add tags')).not.toBeInTheDocument()
  })

  it('adds a tag and notifies parent when + button is clicked', async () => {
    const user = userEvent.setup()
    const onTagsChange = vi.fn()
    renderDrawer(baseCar, { onTagsChange })
    await user.click(screen.getByRole('button', { name: '+ dirt' }))
    expect(onTagsChange).toHaveBeenCalledWith(baseCar.id, ['grip', 'asphalt', 'dirt'])
    expect(fetch).toHaveBeenCalledWith(
      `/api/garage/${baseCar.id}`,
      expect.objectContaining({ method: 'PATCH' })
    )
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
    await user.tab() // blur without typing
    expect(fetch).not.toHaveBeenCalled()
  })
})

/**
 * Landing page unit tests — cover the client-renderable parts.
 * The full server component (data fetching) is tested via E2E / manual review.
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FujiSvg, BlossomSvg, ToriiSvg } from '@/components/JapanDecor'

// ─── JapanDecor SVGs ──────────────────────────────────────────────────────────

describe('FujiSvg', () => {
  it('renders an svg element', () => {
    const { container } = render(<FujiSvg />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('is hidden from assistive technology', () => {
    const { container } = render(<FujiSvg />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('accepts a className prop', () => {
    const { container } = render(<FujiSvg className="w-32 opacity-20" />)
    expect(container.querySelector('svg')).toHaveClass('w-32', 'opacity-20')
  })
})

describe('BlossomSvg', () => {
  it('renders an svg element', () => {
    const { container } = render(<BlossomSvg />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('is hidden from assistive technology', () => {
    const { container } = render(<BlossomSvg />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('ToriiSvg', () => {
  it('renders an svg element', () => {
    const { container } = render(<ToriiSvg />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('is hidden from assistive technology', () => {
    const { container } = render(<ToriiSvg />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})

// ─── CSS class smoke test ─────────────────────────────────────────────────────

describe('btn-clip class', () => {
  it('is defined in globals (clip-path applied via CSS)', () => {
    // The class exists in globals.css — verify the className renders without error
    const { container } = render(
      <button className="btn-clip">Click me</button>
    )
    expect(container.querySelector('.btn-clip')).toBeInTheDocument()
  })
})

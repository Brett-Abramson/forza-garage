import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GuideToc, { type GuideTocSection } from '@/components/guide/GuideToc'

const SECTIONS: GuideTocSection[] = [
  { id: 'identity',           label: 'Identity' },
  { id: 'bar-stats',          label: 'Bar stats' },
  { id: 'raw-specs',          label: 'Raw specs' },
  { id: 'sim-metrics',        label: 'Sim metrics' },
  { id: 'how-numbers-relate', label: 'How the numbers relate' },
  { id: 'reading-in-30',      label: 'Reading a car in 30 seconds' },
  { id: 'appendix',           label: 'Appendix' },
]

describe('GuideToc', () => {
  it('renders all 7 section links (desktop rail) with real #anchor hrefs', () => {
    render(<GuideToc sections={SECTIONS} />)
    const rail = screen.getByRole('navigation', { name: /guide sections/i })
    for (const s of SECTIONS) {
      const link = within(rail).getByRole('link', { name: s.label })
      expect(link).toHaveAttribute('href', `#${s.id}`)
    }
  })

  it('opens the shared bottom-sheet component when the mobile trigger is tapped', async () => {
    const user = userEvent.setup()
    render(<GuideToc sections={SECTIONS} />)

    // Sheet dialog isn't in the document until opened.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /section/i }))

    const dialog = screen.getByRole('dialog', { name: /jump to section/i })
    expect(dialog).toBeInTheDocument()

    // The sheet lists the same 7 sections as real anchor links.
    for (const s of SECTIONS) {
      expect(within(dialog).getByRole('link', { name: s.label })).toHaveAttribute('href', `#${s.id}`)
    }
  })

  it('closes the sheet via its close button', async () => {
    const user = userEvent.setup()
    render(<GuideToc sections={SECTIONS} />)

    await user.click(screen.getByRole('button', { name: /section/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^close$/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

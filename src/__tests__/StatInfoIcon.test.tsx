import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StatInfoIcon from '@/components/car/StatInfoIcon'
import { getStatGuideEntry } from '@/lib/statsGuideContent'

describe('StatInfoIcon', () => {
  it('opens a bottom sheet with the entry short text and a /guide deep link', async () => {
    const user = userEvent.setup()
    const entry = getStatGuideEntry('lateral-g')!
    render(<StatInfoIcon id="lateral-g" />)

    // Closed initially — the gloss is not in the document yet.
    expect(screen.queryByText(entry.short)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /about lateral g/i }))

    // Sheet shows the SAME `short` copy the /guide page reads from statsGuideContent.
    expect(screen.getByText(entry.short)).toBeInTheDocument()

    // "Learn more" deep-links into the matching page anchor.
    expect(screen.getByRole('link', { name: /learn more/i })).toHaveAttribute('href', '/guide#lateral-g')
  })

  it('dismisses the sheet via the close button', async () => {
    const user = userEvent.setup()
    const entry = getStatGuideEntry('front-weight')!
    render(<StatInfoIcon id="front-weight" />)

    await user.click(screen.getByRole('button', { name: /about front weight/i }))
    expect(screen.getByText(entry.short)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^close$/i }))
    expect(screen.queryByText(entry.short)).not.toBeInTheDocument()
  })

  it('renders nothing for an unknown id', () => {
    const { container } = render(<StatInfoIcon id="not-a-real-stat" />)
    expect(container).toBeEmptyDOMElement()
  })
})

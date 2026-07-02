import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from './test-utils'
import userEvent from '@testing-library/user-event'
import { useUser } from '@clerk/nextjs'
import Nav from '@/components/layout/Nav'

// Signed-out state (default mock from setup.ts)
function renderNav() {
  return render(<Nav />)
}

function mockSignedIn(overrides: {
  firstName?: string | null
  lastName?: string | null
  email?: string
} = {}) {
  vi.mocked(useUser).mockReturnValue({
    isSignedIn: true,
    isLoaded: true,
    user: {
      firstName: overrides.firstName ?? 'Brett',
      lastName: overrides.lastName ?? 'Hooper',
      emailAddresses: [{ emailAddress: overrides.email ?? 'brett@example.com' }],
    },
  } as ReturnType<typeof useUser>)
}

beforeEach(() => {
  vi.mocked(useUser).mockReturnValue({
    isSignedIn: false,
    user: null,
    isLoaded: true,
  } as ReturnType<typeof useUser>)
})

// ─── Signed-out state ─────────────────────────────────────────────────────────

describe('Nav — signed out', () => {
  it('shows a Sign in button', () => {
    renderNav()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('does not show a user avatar', () => {
    renderNav()
    expect(screen.queryByRole('button', { name: /user menu/i })).not.toBeInTheDocument()
  })
})

// ─── Signed-in state ──────────────────────────────────────────────────────────

describe('Nav — signed in', () => {
  it('shows the user avatar with first+last initials', () => {
    mockSignedIn({ firstName: 'Brett', lastName: 'Hooper' })
    renderNav()
    expect(screen.getByRole('button', { name: /user menu/i })).toHaveTextContent('BH')
  })

  it('shows first-letter-only initials when last name is absent', () => {
    mockSignedIn({ firstName: 'Brett', lastName: null })
    renderNav()
    expect(screen.getByRole('button', { name: /user menu/i })).toHaveTextContent('B')
  })

  it('falls back to email initial when both names are absent', () => {
    mockSignedIn({ firstName: null, lastName: null, email: 'brett@example.com' })
    renderNav()
    expect(screen.getByRole('button', { name: /user menu/i })).toHaveTextContent('B')
  })

  it('does not show the Sign in button', () => {
    mockSignedIn()
    renderNav()
    expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument()
  })

  it('opens a dropdown with Sign out when the avatar is clicked', async () => {
    mockSignedIn()
    renderNav()
    await userEvent.click(screen.getByRole('button', { name: /user menu/i }))
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  it('shows the user email in the dropdown', async () => {
    mockSignedIn({ email: 'brett@example.com' })
    renderNav()
    await userEvent.click(screen.getByRole('button', { name: /user menu/i }))
    expect(screen.getByText('brett@example.com')).toBeInTheDocument()
  })
})

// ─── Loading state ────────────────────────────────────────────────────────────

describe('Nav — loading', () => {
  it('renders neither Sign in nor avatar while Clerk is loading', () => {
    vi.mocked(useUser).mockReturnValue({
      isSignedIn: false,
      user: null,
      isLoaded: false,
    } as unknown as ReturnType<typeof useUser>)
    renderNav()
    expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /user menu/i })).not.toBeInTheDocument()
  })
})

// ─── Nav links ────────────────────────────────────────────────────────────────

describe('Nav — links', () => {
  it('renders My Garage link pointing to /garage', () => {
    renderNav()
    expect(screen.getByRole('link', { name: /my garage/i })).toHaveAttribute('href', '/garage')
  })

  it('renders Car Database link', () => {
    renderNav()
    expect(screen.getByRole('link', { name: /car database/i })).toBeInTheDocument()
  })

  it('renders Races link', () => {
    renderNav()
    expect(screen.getByRole('link', { name: /races/i })).toBeInTheDocument()
  })
})

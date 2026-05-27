/**
 * Tests for src/app/sign-in/[[...rest]]/page.tsx
 *
 * The catch-all route [[...rest]] is required by Clerk v7 so the <SignIn />
 * component can handle its own sub-paths (factor verification, SSO callbacks,
 * etc.). These tests verify the page mounts and delegates to Clerk correctly.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SignInPage from '@/app/sign-in/[[...rest]]/page'

// Override the global SignIn mock (setup.ts returns null) with one that renders
// a recognisable element so we can assert it was mounted.
vi.mock('@clerk/nextjs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@clerk/nextjs')>()
  return {
    ...actual,
    SignIn: () => <div data-testid="clerk-sign-in">Sign In Form</div>,
  }
})

describe('SignInPage', () => {
  it('renders without crashing', () => {
    expect(() => render(<SignInPage />)).not.toThrow()
  })

  it('mounts the Clerk <SignIn /> component', () => {
    render(<SignInPage />)
    expect(screen.getByTestId('clerk-sign-in')).toBeInTheDocument()
  })

  it('centers the sign-in form in a full-height wrapper', () => {
    const { container } = render(<SignInPage />)
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).toContain('min-h-screen')
    expect(wrapper.className).toContain('flex')
    expect(wrapper.className).toContain('items-center')
    expect(wrapper.className).toContain('justify-center')
  })

  it('applies the app background colour to the wrapper', () => {
    const { container } = render(<SignInPage />)
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).toContain('bg-fh-bg')
  })
})

// ─── Route structure guard ────────────────────────────────────────────────────
// Clerk v7 requires SignIn to live in a catch-all route so it can handle
// sub-paths (/sign-in/factor-one, /sign-in/sso-callback, etc.).
// This test imports directly from the [[...rest]] path — if the file moves
// back to a plain /sign-in/page.tsx the import will fail and alert us.

describe('SignInPage — catch-all route guard', () => {
  it('is exported from the [[...rest]] catch-all path', async () => {
    const mod = await import('@/app/sign-in/[[...rest]]/page')
    expect(mod.default).toBeTypeOf('function')
  })
})

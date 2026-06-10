import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock next/navigation — hooks are not available in jsdom.
// useSearchParams is a vi.fn() so individual tests can override the return value.
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useRouter: vi.fn(() => ({ replace: vi.fn(), push: vi.fn() })),
  usePathname: vi.fn(() => '/'),
}))

// Mock Clerk — auth hooks and components are not available in jsdom.
// useUser is a vi.fn() so individual tests can override the return value.
// Wrapper components return children directly (no JSX in .ts files).
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(() => ({ isSignedIn: false, user: null, isLoaded: true })),
  SignInButton: ({ children }: { children: unknown }) => children,
  SignOutButton: ({ children }: { children: unknown }) => children,
  ClerkProvider: ({ children }: { children: unknown }) => children,
  SignIn: () => null,
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: null }),
  clerkMiddleware: vi.fn(),
  createRouteMatcher: vi.fn(() => () => false),
}))

// matchMedia is not implemented in jsdom — mock it so components that call
// window.matchMedia() (e.g. sidebar mobile-detection) don't throw.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,           // default: treat every env as desktop
    media: query,
    onchange: null,
    addListener: vi.fn(),     // deprecated but still called by some libs
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// window.history.replaceState may not be writable in some jsdom versions
if (!window.history.replaceState) {
  Object.defineProperty(window.history, 'replaceState', {
    value: vi.fn(),
    writable: true,
  })
}

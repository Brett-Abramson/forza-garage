import '@testing-library/jest-dom'
import { vi } from 'vitest'

// 'server-only' throws on import outside the React Server Component graph
// (its default export is a hard error). Vitest has no react-server condition,
// so stub it to a no-op for any DAL/action module that imports it.
vi.mock('server-only', () => ({}))

// In real Next.js the 'use server' boundary keeps the Prisma client out of the
// client bundle. Vitest has no such boundary, so client components that import
// server actions would otherwise instantiate a real PrismaClient. Stub the
// singleton so component tests never open a database client. (Tests that
// exercise the actions directly re-mock this module with their own spies.)
vi.mock('@/server/db', () => ({
  prisma: {
    car: { findUnique: vi.fn(), findMany: vi.fn(), count: vi.fn() },
    userGarage: {
      findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn(),
      upsert: vi.fn(), deleteMany: vi.fn(), count: vi.fn(),
    },
    carTag: { deleteMany: vi.fn(), createMany: vi.fn() },
    carMeta: { findMany: vi.fn() },
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
  },
}))

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

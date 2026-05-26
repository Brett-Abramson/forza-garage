import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock next/navigation — hooks are not available in jsdom.
// useSearchParams is a vi.fn() so individual tests can override the return value.
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useRouter: vi.fn(() => ({ replace: vi.fn(), push: vi.fn() })),
  usePathname: vi.fn(() => '/'),
}))

// window.history.replaceState may not be writable in some jsdom versions
if (!window.history.replaceState) {
  Object.defineProperty(window.history, 'replaceState', {
    value: vi.fn(),
    writable: true,
  })
}

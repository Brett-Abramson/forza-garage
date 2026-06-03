import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// We import the module fresh each test via dynamic import so the in-memory Map
// is reset. Alternatively we expose a reset helper — but since checkRateLimit
// is a pure module-level Map, the easiest approach is to fake timers to
// control window expiry without reloading the module.

import { checkRateLimit } from '@/lib/rateLimit'

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows the first request for a new user', () => {
    expect(checkRateLimit('user-a')).toBe(true)
  })

  it('allows requests up to the limit (30 per minute)', () => {
    const userId = 'user-limit'
    for (let i = 0; i < 30; i++) {
      expect(checkRateLimit(userId)).toBe(true)
    }
  })

  it('blocks the 31st request within the same window', () => {
    const userId = 'user-block'
    for (let i = 0; i < 30; i++) checkRateLimit(userId)
    expect(checkRateLimit(userId)).toBe(false)
  })

  it('resets after the 60-second window expires', () => {
    const userId = 'user-reset'
    for (let i = 0; i < 30; i++) checkRateLimit(userId)
    expect(checkRateLimit(userId)).toBe(false)

    // Advance time past the 60-second window
    vi.advanceTimersByTime(61_000)
    expect(checkRateLimit(userId)).toBe(true)
  })

  it('rate limits are per-user — different users have independent buckets', () => {
    const userX = 'user-x'
    const userY = 'user-y'
    for (let i = 0; i < 30; i++) checkRateLimit(userX)
    expect(checkRateLimit(userX)).toBe(false)
    // userY should still be allowed
    expect(checkRateLimit(userY)).toBe(true)
  })
})

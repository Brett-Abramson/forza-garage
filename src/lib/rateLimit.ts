/**
 * Simple in-memory rate limiter — 30 writes per minute per userId.
 * Suitable for single-process (dev / hobby) deployments.
 * Swap for @upstash/ratelimit if a Redis instance is available.
 */

interface BucketEntry {
  count: number
  resetAt: number
}

const buckets = new Map<string, BucketEntry>()

const WINDOW_MS = 60_000 // 1 minute
const MAX_REQUESTS = 30

/** Returns true if the request should be allowed, false if rate-limited. */
export function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const bucket = buckets.get(userId)

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(userId, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }

  if (bucket.count >= MAX_REQUESTS) {
    return false
  }

  bucket.count += 1
  return true
}

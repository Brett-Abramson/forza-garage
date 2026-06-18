import 'server-only'
import { auth } from '@clerk/nextjs/server'

/** Thrown by requireUserId() when no authenticated Clerk session exists. */
export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized')
    this.name = 'UnauthorizedError'
  }
}

/**
 * Resolve the signed-in Clerk user id, or throw UnauthorizedError.
 * Call at the edge of every mutation/action before touching the database.
 * An empty-string userId (malformed/expired token) is treated as unauthenticated.
 */
export async function requireUserId(): Promise<string> {
  const { userId } = await auth()
  if (!userId) throw new UnauthorizedError()
  return userId
}

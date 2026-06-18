'use server'

import { requireUserId, UnauthorizedError } from '@/server/auth'
import { checkRateLimit } from '@/lib/rateLimit'
import { STAT_OVERRIDE_MAP } from '@/lib/statUtils'
import { getCarById } from '@/server/dal/cars'
import * as garage from '@/server/dal/garage'
import type { Car } from '@/types/car'

// ── Result shapes ──────────────────────────────────────────────────────────────
// Actions never throw across the network boundary; they return a discriminated
// result the client can branch on.

type ActionOk = { ok: true }
type ActionErr = { ok: false; error: string }
type ActionResult = ActionOk | ActionErr
type CarResult = { ok: true; car: Car } | ActionErr

// ── Validation limits (mirrors the previous REST route) ─────────────────────────

const NOTES_MAX_LENGTH = 500
const TAG_MAX_LENGTH = 50
const TAG_PATTERN = /^[a-z0-9 -]+$/i

/**
 * Edge guard for every mutation: validate the Clerk session and rate-limit.
 * Returns the authorized userId, or an error result to return verbatim.
 */
async function authorize(): Promise<{ userId: string } | ActionErr> {
  let userId: string
  try {
    userId = await requireUserId()
  } catch (err) {
    if (err instanceof UnauthorizedError) return { ok: false, error: 'Unauthorized' }
    throw err
  }
  if (!checkRateLimit(userId)) return { ok: false, error: 'Too many requests' }
  return { userId }
}

// ── Marking owned ────────────────────────────────────────────────────────────

/** Mark a car owned / unowned. Returns the car with its new `owned` flag. */
export async function setOwned(carId: number, owned: boolean): Promise<CarResult> {
  const auth = await authorize()
  if ('ok' in auth) return auth

  const car = await getCarById(carId)
  if (!car) return { ok: false, error: 'Car not found' }

  if (owned) {
    await garage.markOwned(auth.userId, car)
  } else {
    await garage.unmarkOwned(auth.userId, carId)
  }

  return { ok: true, car: { ...car, owned } as Car }
}

// ── Tagging ──────────────────────────────────────────────────────────────────

/** Replace the full tag set for an owned car. */
export async function setTags(
  carId: number,
  tags: { auto?: string[]; user?: string[] }
): Promise<ActionResult> {
  const auth = await authorize()
  if ('ok' in auth) return auth

  const { auto = [], user = [] } = tags
  for (const tag of [...auto, ...user]) {
    if (typeof tag !== 'string') return { ok: false, error: 'Each tag must be a string' }
    if (tag.length > TAG_MAX_LENGTH) {
      return { ok: false, error: `Tags must be ${TAG_MAX_LENGTH} characters or fewer` }
    }
    if (!TAG_PATTERN.test(tag)) {
      return { ok: false, error: 'Tags may only contain letters, numbers, spaces, and hyphens' }
    }
  }

  const ok = await garage.replaceTags(auth.userId, carId, auto, user)
  return ok ? { ok: true } : { ok: false, error: 'Not in garage' }
}

// ── Tuning (per-user stat/spec overrides) ──────────────────────────────────────

/**
 * Apply per-user stat/spec overrides. `values` is keyed by canonical field name
 * (e.g. statSpeed, powerHp); null clears that override. Keys are mapped to their
 * UserGarage override columns before the write.
 */
export async function tuneCar(
  carId: number,
  values: Record<string, number | string | null>
): Promise<ActionResult> {
  const auth = await authorize()
  if ('ok' in auth) return auth

  const overrides: Record<string, number | string | null> = {}
  for (const [field, column] of Object.entries(STAT_OVERRIDE_MAP)) {
    if (field in values) overrides[column] = values[field] ?? null
  }
  if (Object.keys(overrides).length === 0) {
    return { ok: false, error: 'Nothing to update' }
  }

  const ok = await garage.applyOverrides(auth.userId, carId, overrides)
  return ok ? { ok: true } : { ok: false, error: 'Forbidden' }
}

/** Clear every per-user override and return the car's stock (base) values. */
export async function resetTuning(carId: number): Promise<CarResult> {
  const auth = await authorize()
  if ('ok' in auth) return auth

  const ok = await garage.resetOverrides(auth.userId, carId)
  if (!ok) return { ok: false, error: 'Forbidden' }

  const car = await getCarById(carId)
  if (!car) return { ok: false, error: 'Car not found' }
  // resetTuning only runs for an owned car, so owned is true.
  return { ok: true, car: { ...car, owned: true } as Car }
}

// ── Notes & pinning ─────────────────────────────────────────────────────────

/** Save notes on an owned car. */
export async function setNotes(carId: number, notes: string | null): Promise<ActionResult> {
  const auth = await authorize()
  if ('ok' in auth) return auth

  if (notes != null) {
    if (typeof notes !== 'string') return { ok: false, error: 'notes must be a string' }
    if (notes.length > NOTES_MAX_LENGTH) {
      return { ok: false, error: `notes must be ${NOTES_MAX_LENGTH} characters or fewer` }
    }
  }

  const ok = await garage.updateNotes(auth.userId, carId, notes ?? null)
  return ok ? { ok: true } : { ok: false, error: 'Not in garage' }
}

/** Toggle the pinned/favourite flag on an owned car. */
export async function setPinned(carId: number, pinned: boolean): Promise<ActionResult> {
  const auth = await authorize()
  if ('ok' in auth) return auth

  const ok = await garage.updatePinned(auth.userId, carId, Boolean(pinned))
  return ok ? { ok: true } : { ok: false, error: 'Not in garage' }
}

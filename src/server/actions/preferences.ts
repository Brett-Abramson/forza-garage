/**
 * src/server/actions/preferences.ts
 *
 * Server action: persist unit preferences for signed-in users.
 * Unauthenticated callers get an {ok:false} result; the client falls back to
 * localStorage instead of calling this at all.
 */

'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/server/db'
import type { UnitPreferences } from '@/lib/unitConversions'

const VALID_UNITS:  readonly string[] = ['English', 'Metric']
const VALID_POWER:  readonly string[] = ['hp', 'PS', 'kW']

type Result = { ok: true } | { ok: false; error: string }

export async function saveUnitPreferences(
  patch: Partial<UnitPreferences>,
): Promise<Result> {
  const { userId } = await auth()
  if (!userId) return { ok: false, error: 'Not signed in' }

  if (patch.units      !== undefined && !VALID_UNITS.includes(patch.units))
    return { ok: false, error: 'Invalid units value' }
  if (patch.powerUnits !== undefined && !VALID_POWER.includes(patch.powerUnits))
    return { ok: false, error: 'Invalid powerUnits value' }

  await prisma.userPreferences.upsert({
    where:  { userId },
    update: { ...patch },
    create: { userId, units: 'English', powerUnits: 'hp', ...patch },
  })

  return { ok: true }
}

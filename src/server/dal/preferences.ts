/**
 * src/server/dal/preferences.ts
 *
 * Read-only data access for UserPreferences.
 * Writes go through src/server/actions/preferences.ts (server action).
 */

import { prisma } from '@/server/db'
import { DEFAULT_PREFS, type UnitPreferences } from '@/lib/unitConversions'

/**
 * Returns the stored preferences for a signed-in user, or DEFAULT_PREFS if
 * none have been saved yet.  Call this from server components/page.tsx files
 * to hydrate the UnitPreferencesProvider.
 */
export async function getUserPreferences(userId: string): Promise<UnitPreferences> {
  const row = await prisma.userPreferences.findUnique({ where: { userId } })
  if (!row) return { ...DEFAULT_PREFS }
  return {
    units:      (row.units      as UnitPreferences['units'])      ?? DEFAULT_PREFS.units,
    powerUnits: (row.powerUnits as UnitPreferences['powerUnits']) ?? DEFAULT_PREFS.powerUnits,
  }
}

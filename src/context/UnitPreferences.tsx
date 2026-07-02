/**
 * src/components/UnitPreferencesContext.tsx
 *
 * Provides unit preferences to the whole subtree.
 *
 * Signed-in users:  server-fetched prefs are passed as `serverPrefs` prop;
 *                   changes are saved via the saveUnitPreferences server action
 *                   (optimistic — UI updates immediately, save is fire-and-forget).
 *
 * Guests:           hydrated from / persisted to localStorage under 'fh-unit-prefs'.
 *
 * Usage
 * ─────
 * // In a server component (app/cars/page.tsx, app/garage/page.tsx):
 *
 *   import { auth } from '@clerk/nextjs/server'
 *   import { getUserPreferences } from '@/server/dal/preferences'
 *   import { UnitPreferencesProvider } from '@/context/UnitPreferences'
 *
 *   const { userId } = await auth()
 *   const serverPrefs = userId ? await getUserPreferences(userId) : null
 *
 *   return (
 *     <UnitPreferencesProvider serverPrefs={serverPrefs} isAuthenticated={!!userId}>
 *       <GarageView ... />
 *     </UnitPreferencesProvider>
 *   )
 *
 * // In any client component below:
 *   const { prefs } = useUnitPreferences()
 */

'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { saveUnitPreferences } from '@/server/actions/preferences'
import {
  DEFAULT_PREFS,
  type UnitPreferences,
  type UnitSystem,
  type PowerUnit,
} from '@/lib/unitConversions'

// ─── Types ────────────────────────────────────────────────────────────────────

interface UnitPreferencesContextValue {
  prefs:          UnitPreferences
  setUnits:       (v: UnitSystem)  => void
  setPowerUnits:  (v: PowerUnit)   => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const UnitPreferencesContext = createContext<UnitPreferencesContextValue | null>(null)

const LS_KEY = 'fh-unit-prefs'

// ─── Provider ─────────────────────────────────────────────────────────────────

interface Props {
  children:        ReactNode
  /** Server-fetched prefs for signed-in users; null for guests. */
  serverPrefs:     UnitPreferences | null
  isAuthenticated: boolean
}

export function UnitPreferencesProvider({ children, serverPrefs, isAuthenticated }: Props) {
  const [prefs, setPrefs] = useState<UnitPreferences>(serverPrefs ?? DEFAULT_PREFS)

  // Guests: hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    if (isAuthenticated) return
    try {
      const stored = localStorage.getItem(LS_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<UnitPreferences>
        setPrefs(prev => ({ ...prev, ...parsed }))
      }
    } catch {
      // Ignore corrupt/missing localStorage data
    }
  }, [isAuthenticated])

  const updatePrefs = useCallback(
    (patch: Partial<UnitPreferences>) => {
      // Pure state update — no side effects inside the updater
      setPrefs(prev => ({ ...prev, ...patch }))
      if (isAuthenticated) {
        // Optimistic: state already updated above; persist in background
        void saveUnitPreferences(patch)
      } else {
        try {
          const stored = localStorage.getItem(LS_KEY)
          const current = stored ? (JSON.parse(stored) as Partial<UnitPreferences>) : {}
          localStorage.setItem(LS_KEY, JSON.stringify({ ...current, ...patch }))
        } catch {
          // Ignore write failures (private browsing, storage full, etc.)
        }
      }
    },
    [isAuthenticated],
  )

  return (
    <UnitPreferencesContext.Provider
      value={{
        prefs,
        setUnits:       (v) => updatePrefs({ units: v }),
        setPowerUnits:  (v) => updatePrefs({ powerUnits: v }),
      }}
    >
      {children}
    </UnitPreferencesContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useUnitPreferences(): UnitPreferencesContextValue {
  const ctx = useContext(UnitPreferencesContext)
  if (!ctx) throw new Error('useUnitPreferences must be used within UnitPreferencesProvider')
  return ctx
}

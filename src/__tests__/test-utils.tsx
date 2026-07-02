import { render as rtlRender, type RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'
import { UnitPreferencesProvider } from '@/context/UnitPreferences'

// Wraps every render in UnitPreferencesProvider so components that call
// useUnitPreferences() (Nav, GarageView, GarageShowcase, GarageDrawer, ...)
// don't throw outside their real app-root provider.
export function render(ui: ReactElement, options?: RenderOptions) {
  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <UnitPreferencesProvider serverPrefs={null} isAuthenticated={false}>
        {children}
      </UnitPreferencesProvider>
    ),
    ...options,
  })
}

export * from '@testing-library/react'

'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type ViewMode = 'grid' | 'table'

export interface NavControls {
  search: string
  setSearch: (v: string) => void
  view: ViewMode
  setView: (v: ViewMode) => void
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
  activeFilterCount: number
}

interface NavControlsCtx {
  controls: NavControls | null
  register: (c: NavControls) => void
  unregister: () => void
}

const NavControlsContext = createContext<NavControlsCtx>({
  controls: null,
  register: () => {},
  unregister: () => {},
})

export function NavControlsProvider({ children }: { children: ReactNode }) {
  const [controls, setControls] = useState<NavControls | null>(null)
  const register = useCallback((c: NavControls) => setControls(c), [])
  const unregister = useCallback(() => setControls(null), [])

  return (
    <NavControlsContext.Provider value={{ controls, register, unregister }}>
      {children}
    </NavControlsContext.Provider>
  )
}

export function useNavControls() {
  return useContext(NavControlsContext)
}

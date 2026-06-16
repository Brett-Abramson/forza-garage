'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, SignInButton, SignOutButton } from '@clerk/nextjs'
import { useState } from 'react'
import ThemeToggle from '@/components/ThemeToggle'
import { useNavControls } from '@/context/NavControls'
import { GridIcon, TableIcon } from '@/components/table-ui'

const links = [
  { href: '/garage', label: 'My Garage', icon: GarageIcon, shortcut: 'g' },
  { href: '/cars', label: 'Car Database', icon: DatabaseIcon, shortcut: 'c' },
  { href: '/races', label: 'Races', icon: RacesIcon, shortcut: 'r' },
  { href: '/builds', label: 'Builds', icon: BuildsIcon, shortcut: 'b' },
]

function getInitials(firstName?: string | null, lastName?: string | null, email?: string | null): string {
  const f = firstName?.[0] ?? ''
  const l = lastName?.[0] ?? ''
  if (f || l) return (f + l).toUpperCase()
  return email?.[0]?.toUpperCase() ?? '?'
}

export default function Nav() {
  const pathname = usePathname()
  const { isSignedIn, user, isLoaded } = useUser()
  const [menuOpen, setMenuOpen] = useState(false)
  const { controls } = useNavControls()
  const showControls = (pathname === '/cars' || pathname === '/garage') && controls !== null

  const initials = isSignedIn
    ? getInitials(
        user.firstName,
        user.lastName,
        user.emailAddresses[0]?.emailAddress,
      )
    : ''

  return (
    <nav className="border-b border-fh-border bg-fh-panel backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-screen-2xl mx-auto px-4 flex items-center gap-1 h-12">
        {showControls && (
          <button
            onClick={() => controls!.setSidebarOpen(!controls!.sidebarOpen)}
            title="Toggle filters"
            aria-label="Toggle filters"
            className="relative p-1.5 rounded-md text-fh-muted hover:text-fh-dark-2 hover:bg-fh-panel-2 transition-colors mr-1 shrink-0"
          >
            <PanelLeftIcon />
            {!controls!.sidebarOpen && controls!.activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-fh-red text-white text-[9px] font-bold flex items-center justify-center leading-none">
                {controls!.activeFilterCount}
              </span>
            )}
          </button>
        )}
        <Link href="/" className="text-sm font-bold tracking-tight mr-4 text-fh-dark">
          Forza<span className="text-fh-red">Garage</span>
        </Link>

        {links.map(({ href, label, icon: Icon, shortcut }) => {
          const active = pathname === href || (href === '/garage' && pathname === '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${
                active ? 'fh-nav-link-active' : 'fh-nav-link'
              }`}
            >
              <Icon />
              {label}
              <kbd className="hidden lg:inline-flex items-center px-1 py-0.5 rounded text-[9px] font-mono border border-fh-border text-fh-muted-2 bg-fh-panel-2 leading-none ml-0.5">
                {shortcut}
              </kbd>
            </Link>
          )
        })}

        {showControls && (
          <div className="ml-auto flex items-center gap-2 flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search make, model, division…"
              value={controls!.search}
              onChange={(e) => controls!.setSearch(e.target.value)}
              className="flex-1 min-w-0 bg-fh-panel-2 border border-fh-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-fh-red placeholder:text-fh-muted"
            />
            <div className="flex bg-fh-panel border border-fh-border rounded-lg overflow-hidden shrink-0">
              <button
                onClick={() => controls!.setView('grid')}
                title="Grid view"
                className={`px-2.5 py-1.5 transition-colors ${controls!.view === 'grid' ? 'bg-fh-red-pale text-fh-red' : 'text-fh-muted hover:text-fh-dark-2'}`}
              >
                <GridIcon />
              </button>
              <button
                onClick={() => controls!.setView('table')}
                title="Table view"
                className={`px-2.5 py-1.5 transition-colors ${controls!.view === 'table' ? 'bg-fh-red-pale text-fh-red' : 'text-fh-muted hover:text-fh-dark-2'}`}
              >
                <TableIcon />
              </button>
            </div>
          </div>
        )}

        <div className={`flex items-center gap-2 ${showControls ? '' : 'ml-auto'}`}>
          <ThemeToggle />

          {isLoaded && (
            isSignedIn ? (
              <div className="relative">
                <button
                  aria-label="User menu"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="w-7 h-7 rounded-full bg-fh-red text-white text-xs font-bold flex items-center justify-center transition-opacity hover:opacity-80"
                >
                  {initials}
                </button>

                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-fh-border bg-fh-panel shadow-lg z-20 py-1">
                      <div className="px-3 py-2 text-xs text-fh-muted truncate border-b border-fh-border">
                        {user.emailAddresses[0]?.emailAddress}
                      </div>
                      <SignOutButton>
                        <button
                          className="w-full text-left px-3 py-2 text-sm transition-colors fh-nav-link"
                          onClick={() => setMenuOpen(false)}
                        >
                          Sign out
                        </button>
                      </SignOutButton>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="text-xs px-3 py-1.5 rounded-md border border-fh-border transition-colors fh-nav-link">
                  Sign in
                </button>
              </SignInButton>
            )
          )}
        </div>
      </div>
    </nav>
  )
}

function DatabaseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <ellipse cx="8" cy="4" rx="6" ry="2" />
      <path d="M2 4v3c0 1.1 2.7 2 6 2s6-.9 6-2V4" />
      <path d="M2 7v3c0 1.1 2.7 2 6 2s6-.9 6-2V7" />
      <path d="M2 10v2c0 1.1 2.7 2 6 2s6-.9 6-2v-2" />
    </svg>
  )
}

function RacesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M0 2h16v2H0zM0 7h10v2H0zM0 12h13v2H0z" />
    </svg>
  )
}

function GarageIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M1 6l7-4 7 4v8H1z" />
      <rect x="5" y="9" width="6" height="5" rx="0.5" />
      <rect x="6.5" y="9" width="1" height="5" />
    </svg>
  )
}

function BuildsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 3h5v2H2zM2 7h9v2H2zM2 11h7v2H2z" />
      <circle cx="13" cy="4" r="2" />
    </svg>
  )
}

function PanelLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
      <path d="M6 2.5v11" />
    </svg>
  )
}

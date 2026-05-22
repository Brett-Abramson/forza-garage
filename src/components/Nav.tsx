'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'My Garage', icon: GarageIcon },
  { href: '/races', label: 'Races', icon: RacesIcon },
  { href: '/cars', label: 'Car Database', icon: DatabaseIcon },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-[#21262d] bg-[#0d1117]/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-screen-2xl mx-auto px-4 flex items-center gap-1 h-12">
        <span className="text-sm font-bold tracking-tight text-[#e6edf3] mr-4">
          Forza<span className="text-cyan-500">Garage</span>
        </span>
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${active
                  ? 'bg-cyan-500/15 text-cyan-400'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-[#161b22]'
                }
              `}
            >
              <Icon />
              {label}
            </Link>
          )
        })}
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

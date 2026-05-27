'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Global keyboard shortcuts (fires only when focus is NOT in a form field).
 *
 *  g → /garage
 *  c → /cars
 *  r → /races
 *  h → / (home)
 */
export default function KeyboardNav() {
  const router = useRouter()

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Skip if focus is inside an interactive element or a modifier is held
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable) ||
        e.metaKey || e.ctrlKey || e.altKey
      ) return

      switch (e.key) {
        case 'g': router.push('/garage'); break
        case 'c': router.push('/cars');   break
        case 'r': router.push('/races');  break
        case 'h': router.push('/');       break
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [router])

  return null
}

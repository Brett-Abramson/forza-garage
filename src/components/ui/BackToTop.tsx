'use client'

import { useEffect, useState } from 'react'

interface Props {
  threshold?: number
  minItems?: number
  itemCount?: number
}

export default function BackToTop({ threshold = 400, minItems, itemCount }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      const pastThreshold = window.scrollY > threshold
      const enoughItems = minItems == null || (itemCount ?? 0) >= minItems
      setVisible(pastThreshold && enoughItems)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold, minItems, itemCount])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-fh-red text-white shadow-lg flex items-center justify-center transition-opacity duration-300 hover:opacity-80 ${
        visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 12V2M2 7l5-5 5 5" />
      </svg>
    </button>
  )
}

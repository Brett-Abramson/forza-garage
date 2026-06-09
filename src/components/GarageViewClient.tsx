'use client'

// Thin client wrapper so that next/dynamic with ssr:false can be used
// from a Server Component page. The dynamic import splits GarageView
// out of the initial JS bundle; ssr:false means the Suspense fallback
// (CarsSkeleton) is what the server sends — no hydration mismatch.

import dynamic from 'next/dynamic'
import type { Car } from '@/types/car'

const GarageView = dynamic(() => import('./GarageView'), { ssr: false })

interface Props {
  initialCars: Car[]
  /** Unused at runtime but accepted so the call-site type-checks cleanly. */
  totalCars?: number
}

export default function GarageViewClient({ initialCars }: Props) {
  return <GarageView initialCars={initialCars} />
}

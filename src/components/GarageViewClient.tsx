'use client'

// Thin client wrapper so that next/dynamic with ssr:false can be used
// from a Server Component page. The dynamic import splits GarageView
// out of the initial JS bundle; ssr:false means the Suspense fallback
// (CarsSkeleton) is what the server sends — no hydration mismatch.

import dynamic from 'next/dynamic'
import type { Car } from '@/types/car'

const GarageView = dynamic(() => import('./GarageView'), { ssr: false })

export default function GarageViewClient({ initialCars }: { initialCars: Car[] }) {
  return <GarageView initialCars={initialCars} />
}

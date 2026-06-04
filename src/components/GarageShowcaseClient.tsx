'use client'

// Thin client wrapper so that next/dynamic with ssr:false can be used
// from a Server Component page. The dynamic import splits GarageShowcase
// out of the initial JS bundle; ssr:false means the Suspense fallback
// (GarageSkeleton) is what the server sends — no hydration mismatch.

import dynamic from 'next/dynamic'
import type { Car } from '@/types/car'

const GarageShowcase = dynamic(() => import('./GarageShowcase'), { ssr: false })

export default function GarageShowcaseClient({ initialCars }: { initialCars: Car[] }) {
  return <GarageShowcase initialCars={initialCars} />
}

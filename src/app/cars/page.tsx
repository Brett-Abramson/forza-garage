import { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import { getCarsWithOwnership } from '@/server/dal/cars'
import GarageViewClient from '@/components/cars/GarageViewClient'
import CarsSkeleton from '@/components/cars/CarsSkeleton'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function CarsPage({ searchParams }: PageProps) {
  // auth() and searchParams are independent — resolve together, then the
  // car/garage join (which needs userId) runs in the DAL.
  const [{ userId }, params] = await Promise.all([
    auth(),
    searchParams ?? Promise.resolve({} as Record<string, string | string[] | undefined>),
  ])

  const cars = await getCarsWithOwnership(userId)

  // Respect the user's last-used view preference from the URL so the skeleton
  // matches what they'll see when the component hydrates.
  const view = params?.view === 'grid' ? 'grid' : 'table'

  return (
    // min-h-screen prevents layout shifts above/below the virtual list container
    // from being measured as CLS when the skeleton swaps for the real component.
    <main className="max-w-screen-2xl mx-auto min-h-screen">
      <Suspense fallback={<CarsSkeleton view={view} totalCars={cars.length} />}>
        <GarageViewClient initialCars={cars} totalCars={cars.length} isSignedIn={!!userId} />
      </Suspense>
    </main>
  )
}

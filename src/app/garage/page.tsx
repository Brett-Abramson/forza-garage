import { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { ensureStarterCars, getGarageCars } from '@/server/dal/garage'
import { getCarCount } from '@/server/dal/cars'
import GarageShowcaseClient from '@/components/GarageShowcaseClient'
import GarageSkeleton from '@/components/GarageSkeleton'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function GaragePage({ searchParams }: PageProps) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // No-op after the user's first visit (skips once they own anything), so this
  // is not a write on the hot read path.
  await ensureStarterCars(userId)

  const [params, cars, totalCars] = await Promise.all([
    searchParams ?? Promise.resolve({} as Record<string, string | string[] | undefined>),
    getGarageCars(userId),
    getCarCount(),
  ])

  const view = params?.view === 'grid' ? 'grid' : 'table'

  return (
    // min-h-screen prevents layout shifts above/below the content area
    // from registering as CLS when the skeleton swaps for the real component.
    <main className="max-w-screen-2xl mx-auto min-h-screen">
      <Suspense fallback={<GarageSkeleton view={view} />}>
        <GarageShowcaseClient initialCars={cars} totalCars={totalCars} />
      </Suspense>
    </main>
  )
}

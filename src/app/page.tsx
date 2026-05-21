import { prisma } from '@/lib/prisma'
import GarageShowcase from '@/components/GarageShowcase'
import type { Car } from '@/types/car'

export const dynamic = 'force-dynamic'

export default async function GaragePage() {
  const entries = await prisma.userGarage.findMany({
    include: { car: true, tags: true },
    orderBy: [{ car: { make: 'asc' } }, { car: { model: 'asc' } }],
  })
  const cars: Car[] = entries.map(({ car, tags }) => ({
    ...car,
    owned: true,
    tags: tags.map((t) => t.tag),
  }))

  return (
    <main className="max-w-screen-2xl mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold tracking-tight">My Garage</h1>
          <span className="text-gray-500 text-sm">
            {cars.length} {cars.length === 1 ? 'car' : 'cars'}
          </span>
        </div>
        <p className="text-gray-500 text-sm mt-1">Your personal collection.</p>
      </header>

      <GarageShowcase initialCars={cars} />
    </main>
  )
}

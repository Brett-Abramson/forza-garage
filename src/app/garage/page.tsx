import { prisma } from '@/lib/prisma'
import GarageShowcase from '@/components/GarageShowcase'

export const dynamic = 'force-dynamic'

export default async function GaragePage() {
  const cars = await prisma.car.findMany({
    where: { owned: true },
    orderBy: [{ make: 'asc' }, { model: 'asc' }],
  })

  return (
    <main className="max-w-screen-2xl mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold tracking-tight">My Garage</h1>
          <span className="text-gray-500 text-sm">{cars.length} {cars.length === 1 ? 'car' : 'cars'} owned</span>
        </div>
        <p className="text-gray-500 text-sm mt-1">Your personal collection, grouped by PI class.</p>
      </header>

      <GarageShowcase initialCars={cars} />
    </main>
  )
}

import { prisma } from '@/lib/prisma'
import GarageView from '@/components/GarageView'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const cars = await prisma.car.findMany({
    orderBy: [{ make: 'asc' }, { model: 'asc' }],
  })

  return (
    <main className="max-w-screen-2xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Car Database</h1>
        <p className="text-gray-500 text-sm mt-1">Browse all cars — mark the ones you own to add them to your garage.</p>
      </header>

      <GarageView initialCars={cars} />
    </main>
  )
}

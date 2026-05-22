import { prisma } from '@/lib/prisma'
import GarageShowcase from '@/components/GarageShowcase'
import type { Car } from '@/types/car'
import { CAR_TAGS } from '@/lib/tags'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ tags?: string }>
}

export default async function GaragePage({ searchParams }: Props) {
  const { tags: tagsParam } = await searchParams

  // Validate each tag against CAR_TAGS so arbitrary query params can't pollute state
  const validTags = new Set<string>(CAR_TAGS)
  const initialTagFilter = tagsParam
    ? tagsParam.split(',').map((t) => t.trim()).filter((t) => validTags.has(t))
    : []

  const entries = await prisma.userGarage.findMany({
    include: { car: true, tags: true },
    orderBy: [{ car: { make: 'asc' } }, { car: { model: 'asc' } }],
  })
  const cars: Car[] = entries.map(({ car, tags, notes }) => ({
    ...car,
    owned: true,
    tags: tags.map((t) => t.tag),
    notes,
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

      <GarageShowcase initialCars={cars} initialTagFilter={initialTagFilter} />
    </main>
  )
}

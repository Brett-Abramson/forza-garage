import 'server-only'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/server/db'
import type { MetaCarEntry } from '@/components/MetaCarousel'

/**
 * Active featured-car entries for the landing-page carousel.
 * Cached for 24h — CarMeta changes infrequently. Purge with
 * revalidateTag('featured-cars') after editing CarMeta.
 */
export const getFeaturedCars = unstable_cache(
  async (): Promise<MetaCarEntry[]> => {
    const rows = await prisma.carMeta.findMany({
      where: { active: true },
      orderBy: { recordedAt: 'desc' },
      include: {
        car: { select: { id: true, make: true, model: true, year: true, piClass: true, piRating: true } },
      },
    })
    return rows.map((r) => ({
      id: r.id,
      carId: r.car.id,
      make: r.car.make,
      model: r.car.model,
      year: r.car.year,
      piClass: r.car.piClass,
      piRating: r.car.piRating,
      raceType: r.raceType,
      rank: r.rank,
      label: r.label,
      notes: r.notes,
      source: r.source,
    }))
  },
  ['featured-cars'],
  { tags: ['featured-cars'], revalidate: 86400 },
)

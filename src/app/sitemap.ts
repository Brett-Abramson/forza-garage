import type { MetadataRoute } from 'next'
import { getAllTracks } from '@/server/dal/tracks'
import { slugifyRaceName } from '@/lib/tracks'
import { SITE_URL } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tracks = await getAllTracks()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/cars`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/tracks`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/races`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/builds`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/guide`, changeFrequency: 'monthly', priority: 0.6 },
  ]

  const trackRoutes: MetadataRoute.Sitemap = tracks.map((t) => ({
    url: `${SITE_URL}/tracks/${slugifyRaceName(t.raceName)}`,
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  return [...staticRoutes, ...trackRoutes]
}

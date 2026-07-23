import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /garage is per-user and auth-gated, /sign-in is an auth flow, /design
      // is the internal style guide — none have public search value.
      disallow: ['/api/', '/garage', '/sign-in', '/design'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}

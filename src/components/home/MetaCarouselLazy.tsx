'use client'

import dynamic from 'next/dynamic'
import type { MetaCarEntry } from '@/components/home/MetaCarousel'

const MetaCarousel = dynamic(
  () => import('./MetaCarousel').then((m) => m.MetaCarousel),
  { ssr: false }
)

export function MetaCarouselLazy(props: { entries: MetaCarEntry[] }) {
  return <MetaCarousel {...props} />
}

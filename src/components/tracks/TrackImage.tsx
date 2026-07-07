'use client'

import { useState } from 'react'

/**
 * Track/details art with a graceful fallback — these are remote game/ForzaLabs
 * assets (linked by URL, never re-hosted) and occasionally 404. On error we
 * stop rendering the <img>, revealing the hatched placeholder + filename
 * caption that sits underneath it the whole time.
 */
export function TrackImage({
  src,
  alt,
  filename,
  className = '',
  priority = false,
  fit = 'cover',
}: {
  src: string | null
  alt: string
  filename: string
  className?: string
  priority?: boolean
  /** 'cover' fills+crops (list cards); 'contain' shows the whole image, letterboxed (hero). */
  fit?: 'cover' | 'contain'
}) {
  const [broken, setBroken] = useState(false)

  return (
    <div className={`relative overflow-hidden fh-img-hatch ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center text-center font-mono text-[10px] text-fh-muted px-2 leading-snug">
        <span>
          image unavailable
          <br />
          <span className="opacity-70">{filename}</span>
        </span>
      </div>
      {src && !broken && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          onError={() => setBroken(true)}
          className={`absolute inset-0 w-full h-full z-[1] ${fit === 'contain' ? 'object-contain' : 'object-cover'}`}
        />
      )}
    </div>
  )
}

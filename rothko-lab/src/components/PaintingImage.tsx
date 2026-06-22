import { useState } from 'react'
import type { Painting } from '@/types'
import { RothkoAbstraction } from './RothkoAbstraction'
import { cn } from '@/lib/utils'

/**
 * Shows the real painting when its source image loads; otherwise falls back to
 * the generated palette abstraction. Rothko images are copyrighted and many
 * hosts block hotlinking, so the abstraction guarantees a meaningful visual.
 */
export function PaintingImage({
  painting,
  className,
  ratio = 1.3,
}: {
  painting: Painting
  className?: string
  ratio?: number
}) {
  const [failed, setFailed] = useState(false)
  const src = painting.imageRef?.src

  if (!src || failed) {
    return <RothkoAbstraction palette={painting.palette} className={className} ratio={ratio} />
  }

  return (
    <div className={cn('relative w-full overflow-hidden bg-card', className)} style={{ aspectRatio: String(ratio) }}>
      <img
        src={src}
        alt={painting.title}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
    </div>
  )
}

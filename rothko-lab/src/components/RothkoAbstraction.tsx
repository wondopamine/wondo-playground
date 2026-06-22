import type { Swatch } from '@/types'
import { cn } from '@/lib/utils'

/**
 * A generated, soft-edged stacked-rectangle rendering built from a work's
 * palette — evoking Rothko's feathered fields. Used as the primary visual and
 * as a graceful fallback when the copyrighted source image can't be loaded.
 */
export function RothkoAbstraction({
  palette,
  className,
  ratio = 1.3,
}: {
  palette: Swatch[]
  className?: string
  ratio?: number
}) {
  if (palette.length === 0) return null
  // Largest-area swatch becomes the enveloping ground; the rest float as bands.
  const sorted = [...palette].sort((a, b) => b.proportion - a.proportion)
  const ground = sorted[0]
  const bands = sorted.slice(1)
  const bandTotal = bands.reduce((s, b) => s + b.proportion, 0) || 1

  return (
    <div
      className={cn('relative w-full overflow-hidden', className)}
      style={{ aspectRatio: String(ratio), backgroundColor: ground.hex }}
      aria-hidden
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-[4%] p-[8%]">
        {bands.map((b, i) => (
          <div
            key={i}
            style={{
              backgroundColor: b.hex,
              height: `${(b.proportion / bandTotal) * 78}%`,
              width: '84%',
              filter: 'blur(6px)',
              borderRadius: '4px',
              opacity: 0.95,
            }}
          />
        ))}
      </div>
      {/* subtle vignette to suggest the breathing edge */}
      <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 60px rgba(0,0,0,0.35)' }} />
    </div>
  )
}

import type { Swatch } from '@/types'
import { cn } from '@/lib/utils'

/** Proportional bar of palette swatches; optional per-swatch hex labels. */
export function PaletteBar({
  palette,
  className,
  showHex = false,
  height = 'h-3',
}: {
  palette: Swatch[]
  className?: string
  showHex?: boolean
  height?: string
}) {
  return (
    <div className={cn('w-full', className)}>
      <div className={cn('flex w-full overflow-hidden rounded-md', height)}>
        {palette.map((s, i) => (
          <div key={i} title={s.hex} style={{ backgroundColor: s.hex, width: `${s.proportion * 100}%` }} />
        ))}
      </div>
      {showHex && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
          {palette.map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.hex }} />
              {s.hex} · {(s.proportion * 100).toFixed(0)}%
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

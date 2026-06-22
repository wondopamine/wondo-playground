import { useState } from 'react'
import { cn } from '@/lib/utils'

export interface CircumplexPoint {
  id: string
  valence: number
  arousal: number
  color: string
  label: string
  sublabel?: string
  /** Optional second point (e.g. curated reading) linked to this one. */
  ghost?: { valence: number; arousal: number }
}

const vx = (v: number) => ((v + 1) / 2) * 100
const ay = (a: number) => (1 - (a + 1) / 2) * 100

/**
 * Russell's circumplex: valence on x (unpleasant → pleasant), arousal on y
 * (calm → excited). Quadrant words are computed tendencies, not Rothko's
 * intent — the methodology page spells out the caveats.
 */
export function Circumplex({
  points,
  className,
  onSelect,
  selectedId,
}: {
  points: CircumplexPoint[]
  className?: string
  onSelect?: (id: string) => void
  selectedId?: string
}) {
  const [hover, setHover] = useState<string | null>(null)

  return (
    <div className={cn('relative', className)}>
      <svg viewBox="-8 -8 116 116" className="w-full" role="img" aria-label="Valence-arousal emotion map">
        {/* grid */}
        <rect x={0} y={0} width={100} height={100} fill="none" stroke="var(--color-border)" strokeWidth={0.4} />
        <line x1={50} y1={0} x2={50} y2={100} stroke="var(--color-border)" strokeWidth={0.4} />
        <line x1={0} y1={50} x2={100} y2={50} stroke="var(--color-border)" strokeWidth={0.4} />

        {/* quadrant labels */}
        <text x={73} y={10} fontSize={3.4} fill="var(--color-muted-foreground)">radiant · energized</text>
        <text x={4} y={10} fontSize={3.4} fill="var(--color-muted-foreground)">tense · dramatic</text>
        <text x={4} y={96} fontSize={3.4} fill="var(--color-muted-foreground)">somber · brooding</text>
        <text x={70} y={96} fontSize={3.4} fill="var(--color-muted-foreground)">serene · contemplative</text>

        {/* axis captions */}
        <text x={50} y={-3} fontSize={3} textAnchor="middle" fill="var(--color-muted-foreground)">arousal +</text>
        <text x={50} y={107} fontSize={3} textAnchor="middle" fill="var(--color-muted-foreground)">arousal −</text>

        {points.map((p) => {
          const cx = vx(p.valence)
          const cy = ay(p.arousal)
          const active = hover === p.id || selectedId === p.id
          return (
            <g key={p.id} className={onSelect ? 'cursor-pointer' : undefined}
               onMouseEnter={() => setHover(p.id)} onMouseLeave={() => setHover(null)}
               onClick={() => onSelect?.(p.id)}>
              {p.ghost && (
                <line x1={cx} y1={cy} x2={vx(p.ghost.valence)} y2={ay(p.ghost.arousal)}
                      stroke="var(--color-muted-foreground)" strokeWidth={0.4} strokeDasharray="1.5 1.5" />
              )}
              {p.ghost && (
                <circle cx={vx(p.ghost.valence)} cy={ay(p.ghost.arousal)} r={1.6}
                        fill="none" stroke="var(--color-muted-foreground)" strokeWidth={0.5} />
              )}
              <circle cx={cx} cy={cy} r={active ? 3.6 : 2.6} fill={p.color}
                      stroke={active ? 'var(--color-foreground)' : 'rgba(0,0,0,0.4)'} strokeWidth={active ? 0.8 : 0.4} />
            </g>
          )
        })}
      </svg>

      {hover && (() => {
        const p = points.find((x) => x.id === hover)!
        return (
          <div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-md border border-border bg-popover px-3 py-1.5 text-center shadow-md">
            <div className="font-serif text-sm">{p.label}</div>
            {p.sublabel && <div className="text-xs text-muted-foreground">{p.sublabel}</div>}
          </div>
        )
      })()}
    </div>
  )
}

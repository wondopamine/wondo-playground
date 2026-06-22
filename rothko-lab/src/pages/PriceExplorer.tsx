import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PAINTINGS } from '@/data/paintings'
import { Button } from '@/components/ui/button'
import { formatUsd } from '@/lib/format'

const FEATURES = {
  warmRatio: { label: 'Warm ratio', get: (p: (typeof PAINTINGS)[number]) => p.features.warmRatio * 100, unit: '%' },
  meanLightness: { label: 'Mean lightness', get: (p: (typeof PAINTINGS)[number]) => p.features.meanLightness, unit: '' },
  meanChroma: { label: 'Mean chroma', get: (p: (typeof PAINTINGS)[number]) => p.features.meanChroma, unit: '' },
  contrast: { label: 'Contrast', get: (p: (typeof PAINTINGS)[number]) => p.features.contrast * 100, unit: '' },
} as const
type FeatureKey = keyof typeof FEATURES

export function PriceExplorer() {
  const navigate = useNavigate()
  const [feature, setFeature] = useState<FeatureKey>('warmRatio')
  const [perArea, setPerArea] = useState(false)

  const data = useMemo(() => {
    return PAINTINGS.filter((p) => p.price && (!perArea || p.price.pricePerCm2)).map((p) => ({
      id: p.id,
      title: p.title,
      year: p.year,
      x: FEATURES[feature].get(p),
      y: perArea ? p.price!.pricePerCm2! : p.price!.amountUsd,
      color: p.palette[0]?.hex ?? '#888',
      confidence: p.price!.confidence,
    }))
  }, [feature, perArea])

  // simple Pearson correlation for the current view
  const r = useMemo(() => {
    const n = data.length
    if (n < 3) return null
    const mx = data.reduce((s, d) => s + d.x, 0) / n
    const my = data.reduce((s, d) => s + d.y, 0) / n
    let num = 0, dx = 0, dy = 0
    for (const d of data) {
      num += (d.x - mx) * (d.y - my)
      dx += (d.x - mx) ** 2
      dy += (d.y - my) ** 2
    }
    return num / Math.sqrt(dx * dy)
  }, [data])

  return (
    <div>
      <header className="mb-6 max-w-2xl">
        <h1 className="font-serif text-4xl leading-tight tracking-tight">Price explorer</h1>
        <p className="mt-3 text-muted-foreground">
          Does color move the market? Plot sale price against a color feature. The warm/red premium is real in
          commentary and hedonic studies — but it’s a tendency, not a law, and size, period and provenance matter as
          much. Normalize by area and the picture shifts.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(Object.keys(FEATURES) as FeatureKey[]).map((k) => (
          <Button key={k} size="sm" variant={feature === k ? 'default' : 'outline'} onClick={() => setFeature(k)}>
            {FEATURES[k].label}
          </Button>
        ))}
        <div className="ml-auto">
          <Button size="sm" variant={perArea ? 'default' : 'outline'} onClick={() => setPerArea((v) => !v)}>
            {perArea ? 'Price per cm²' : 'Absolute price'}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <ResponsiveContainer width="100%" height={440}>
          <ScatterChart margin={{ top: 16, right: 24, bottom: 36, left: 24 }}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
            <XAxis
              type="number" dataKey="x" name={FEATURES[feature].label}
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
              stroke="var(--color-border)"
              label={{ value: `${FEATURES[feature].label} ${FEATURES[feature].unit}`, position: 'bottom', fill: 'var(--color-muted-foreground)', fontSize: 12 }}
            />
            <YAxis
              type="number" dataKey="y"
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
              stroke="var(--color-border)"
              tickFormatter={(v: number) => (perArea ? `$${v.toFixed(0)}` : formatUsd(v))}
              width={64}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3', stroke: 'var(--color-muted-foreground)' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload as (typeof data)[number]
                return (
                  <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
                    <div className="font-serif text-sm">{d.title}</div>
                    <div className="text-muted-foreground">{d.year}</div>
                    <div className="mt-1 font-mono">
                      {perArea ? `$${d.y.toFixed(0)}/cm²` : formatUsd(d.y)} · {FEATURES[feature].label} {d.x.toFixed(0)}{FEATURES[feature].unit}
                    </div>
                    {d.confidence === 'rumored' && <div className="text-muted-foreground">rumored figure</div>}
                  </div>
                )
              }}
            />
            <Scatter
              data={data}
              onClick={(_: unknown, index: number) => {
                const d = data[index]
                if (d) navigate(`/work/${d.id}`)
              }}
            >
              {data.map((d) => (
                <Cell key={d.id} fill={d.color} stroke={d.confidence === 'rumored' ? 'var(--color-muted-foreground)' : 'rgba(0,0,0,0.4)'} strokeDasharray={d.confidence === 'rumored' ? '2 2' : undefined} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        {r !== null && (
          <span>
            Correlation (Pearson <span className="font-mono">r</span>) for this view:{' '}
            <span className="font-mono text-foreground">{r.toFixed(2)}</span>
          </span>
        )}
        <span className="text-xs">Dashed outline = rumored/private figure. Click a point to open the work. n = {data.length}.</span>
      </div>
      <p className="mt-3 max-w-2xl text-xs text-muted-foreground">
        Correlation is not causation, and n is small. Treat this as exploratory: provenance (Rockefeller, Mellon,
        Mnuchin), the rarity of large 1950s canvases, and freshness to market are confounders the color axis can’t see.
      </p>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PAINTINGS } from '@/data/paintings'
import { PERIOD_LABELS, type Period } from '@/types'
import { PaintingImage } from '@/components/PaintingImage'
import { PaletteBar } from '@/components/PaletteBar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatUsd } from '@/lib/format'
import { emotionLabel } from '@/lib/emotion'

type Sort = 'price' | 'year' | 'valence' | 'arousal'

const PERIODS = Object.keys(PERIOD_LABELS) as Period[]

export function Gallery() {
  const [period, setPeriod] = useState<Period | 'all'>('all')
  const [sort, setSort] = useState<Sort>('price')

  const works = useMemo(() => {
    const filtered = PAINTINGS.filter((p) => period === 'all' || p.period === period)
    return [...filtered].sort((a, b) => {
      switch (sort) {
        case 'price':
          return (b.price?.amountUsd ?? -1) - (a.price?.amountUsd ?? -1)
        case 'year':
          return a.year - b.year
        case 'valence':
          return b.computedEmotion.valence - a.computedEmotion.valence
        case 'arousal':
          return b.computedEmotion.arousal - a.computedEmotion.arousal
      }
    })
  }, [period, sort])

  return (
    <div>
      <header className="mb-8 max-w-2xl">
        <h1 className="font-serif text-4xl leading-tight tracking-tight">The corpus</h1>
        <p className="mt-3 text-muted-foreground">
          Twenty works across every period. Each one decomposed into a palette, a computed emotion, and — where it
          sold — a real price. Three honest layers, kept separate so they can disagree.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {[
            { k: 'Measured', d: 'color facts' },
            { k: 'Felt', d: 'computed + documented emotion' },
            { k: 'Valued', d: 'real sale prices' },
          ].map((l) => (
            <span key={l.k} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1">
              <span className="font-medium text-foreground">{l.k}</span>
              <span className="text-muted-foreground">{l.d}</span>
            </span>
          ))}
        </div>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Button size="sm" variant={period === 'all' ? 'default' : 'outline'} onClick={() => setPeriod('all')}>
          All periods
        </Button>
        {PERIODS.map((p) => (
          <Button key={p} size="sm" variant={period === p ? 'default' : 'outline'} onClick={() => setPeriod(p)}>
            {PERIOD_LABELS[p]}
          </Button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          <span>Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-md border border-border bg-card px-2 py-1.5 text-foreground"
          >
            <option value="price">Price (high → low)</option>
            <option value="year">Year (early → late)</option>
            <option value="valence">Valence (pleasant → not)</option>
            <option value="arousal">Arousal (excited → calm)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {works.map((p) => (
          <Link
            key={p.id}
            to={`/work/${p.id}`}
            className="group rounded-lg border border-border bg-card transition-colors hover:border-accent/50"
          >
            <PaintingImage painting={p} className="rounded-t-lg" ratio={1.2} />
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-serif leading-tight">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{p.year} · {PERIOD_LABELS[p.period]}</div>
                </div>
                {p.price && (
                  <div className="text-right">
                    <div className="font-mono text-sm">{formatUsd(p.price.amountUsd)}</div>
                    {p.price.confidence === 'rumored' && (
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">rumored</div>
                    )}
                  </div>
                )}
              </div>
              <PaletteBar palette={p.palette} className="mt-3" />
              <div className="mt-3 flex items-center justify-between">
                <Badge variant="muted">{emotionLabel(p.computedEmotion)}</Badge>
                <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  analyze →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

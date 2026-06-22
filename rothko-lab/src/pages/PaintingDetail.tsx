import { Link, useParams } from 'react-router-dom'
import { getPainting } from '@/data/paintings'
import { PERIOD_LABELS } from '@/types'
import { PaintingImage } from '@/components/PaintingImage'
import { PaletteBar } from '@/components/PaletteBar'
import { Circumplex } from '@/components/Circumplex'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { emotionLabel } from '@/lib/emotion'
import { formatUsdFull } from '@/lib/format'

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <div className="font-mono text-lg">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      {hint && <div className="text-[11px] text-muted-foreground/70">{hint}</div>}
    </div>
  )
}

export function PaintingDetail() {
  const { id } = useParams()
  const p = id ? getPainting(id) : undefined

  if (!p) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Work not found.</p>
        <Link to="/" className="text-accent underline-offset-4 hover:underline">Back to the gallery</Link>
      </div>
    )
  }

  const e = p.computedEmotion
  const f = p.features

  return (
    <div>
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Gallery</Link>

      <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <PaintingImage painting={p} className="rounded-lg" ratio={p.dimensionsCm ? p.dimensionsCm.w / p.dimensionsCm.h : 1.2} />
          <PaletteBar palette={p.palette} className="mt-4" showHex height="h-4" />
          <p className="mt-3 text-xs text-muted-foreground">
            Palette {p.paletteSource === 'curated' ? 'hand-sampled from documented color descriptions' : 'extracted from image'}.
          </p>
        </div>

        <div>
          <h1 className="font-serif text-3xl leading-tight tracking-tight">{p.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{p.year}</span>
            <span>·</span>
            <Badge variant="outline">{PERIOD_LABELS[p.period]}</Badge>
            {p.dimensionsCm && <span>· {p.dimensionsCm.h} × {p.dimensionsCm.w} cm</span>}
          </div>

          {/* MEASURED */}
          <Separator className="my-5" />
          <div className="text-xs font-medium uppercase tracking-wider text-accent">Measured</div>
          <div className="mt-3 grid grid-cols-3 gap-4">
            <Stat label="Mean lightness L*" value={f.meanLightness.toFixed(0)} hint="0 dark · 100 light" />
            <Stat label="Mean chroma C*" value={f.meanChroma.toFixed(0)} hint="color intensity" />
            <Stat label="Warm ratio" value={`${(f.warmRatio * 100).toFixed(0)}%`} hint="warm-hued area" />
            <Stat label="Value contrast" value={f.lightnessRange.toFixed(0)} hint="L* range" />
            <Stat label="Hue spread" value={`${f.hueSpread.toFixed(0)}°`} hint="hue opposition" />
            <Stat label="Contrast" value={f.contrast.toFixed(2)} hint="composite 0–1" />
          </div>

          {/* FELT */}
          <Separator className="my-5" />
          <div className="text-xs font-medium uppercase tracking-wider text-accent">Felt</div>
          <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-[180px_1fr]">
            <div>
              <Circumplex
                points={[{ id: p.id, valence: e.valence, arousal: e.arousal, color: p.palette[0]?.hex ?? '#888', label: p.title }]}
              />
            </div>
            <div>
              <div className="mb-2 font-serif">{emotionLabel(e)}</div>
              <div className="flex gap-4 font-mono text-sm">
                <span>valence {e.valence >= 0 ? '+' : ''}{e.valence.toFixed(2)}</span>
                <span>arousal {e.arousal >= 0 ? '+' : ''}{e.arousal.toFixed(2)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Computed from lightness &amp; chroma (Valdez &amp; Mehrabian).</p>

              {p.curatedEmotion && (
                <div className="mt-4 rounded-md border border-border bg-secondary/40 p-3">
                  <div className="mb-1.5 flex flex-wrap gap-1.5">
                    {p.curatedEmotion.tags.map((t) => (
                      <Badge key={t} variant="accent">{t}</Badge>
                    ))}
                  </div>
                  <p className="text-sm">{p.curatedEmotion.reading}</p>
                  <a href={p.curatedEmotion.sourceUrl} target="_blank" rel="noreferrer"
                     className="mt-1 inline-block text-xs text-accent underline-offset-4 hover:underline">
                    documented reading ↗
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* VALUED */}
          <Separator className="my-5" />
          <div className="text-xs font-medium uppercase tracking-wider text-accent">Valued</div>
          {p.price ? (
            <Card className="mt-3">
              <CardHeader className="pb-2">
                <CardTitle className="font-mono text-2xl">{formatUsdFull(p.price.amountUsd)}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={p.price.type === 'private' ? 'muted' : 'default'}>{p.price.type}</Badge>
                  <Badge variant={p.price.confidence === 'rumored' ? 'outline' : 'muted'}>{p.price.confidence}</Badge>
                  <span>{p.price.venue}, {p.price.year}</span>
                </div>
                {p.price.hammerUsd && <div className="mt-2">Hammer {formatUsdFull(p.price.hammerUsd)} (before premium)</div>}
                {p.price.pricePerCm2 && <div className="mt-1">≈ {formatUsdFull(p.price.pricePerCm2)} / cm²</div>}
              </CardContent>
            </Card>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Not sold at auction — museum-held or donated.</p>
          )}

          <Separator className="my-5" />
          <div className="text-xs text-muted-foreground">
            <div className="mb-1 font-medium">Sources</div>
            <ul className="space-y-1">
              {p.sources.map((s) => (
                <li key={s}>
                  <a href={s} target="_blank" rel="noreferrer" className="text-accent underline-offset-4 hover:underline break-all">{s}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

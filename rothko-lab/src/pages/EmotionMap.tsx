import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PAINTINGS } from '@/data/paintings'
import { PERIOD_LABELS, type Period } from '@/types'
import { Circumplex, type CircumplexPoint } from '@/components/Circumplex'
import { Button } from '@/components/ui/button'

const PERIODS = Object.keys(PERIOD_LABELS) as Period[]

export function EmotionMap() {
  const navigate = useNavigate()
  const [active, setActive] = useState<Set<Period>>(new Set(PERIODS))

  const toggle = (p: Period) => {
    setActive((prev) => {
      const next = new Set(prev)
      if (next.has(p)) next.delete(p)
      else next.add(p)
      return next
    })
  }

  const points: CircumplexPoint[] = useMemo(
    () =>
      PAINTINGS.filter((p) => active.has(p.period)).map((p) => ({
        id: p.id,
        valence: p.computedEmotion.valence,
        arousal: p.computedEmotion.arousal,
        color: p.palette[0]?.hex ?? '#888',
        label: p.title,
        sublabel: `${p.year} · ${PERIOD_LABELS[p.period]}`,
      })),
    [active],
  )

  return (
    <div>
      <header className="mb-6 max-w-2xl">
        <h1 className="font-serif text-4xl leading-tight tracking-tight">Emotion map</h1>
        <p className="mt-3 text-muted-foreground">
          Every work placed by its <em>computed</em> emotion — valence across, arousal up. Light, saturated palettes
          drift to the radiant top-right; dark maroons and chapel blacks sink to the somber bottom-left.
        </p>
      </header>

      <div className="mb-5 flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <Button key={p} size="sm" variant={active.has(p) ? 'default' : 'outline'} onClick={() => toggle(p)}>
            {PERIOD_LABELS[p]}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-lg border border-border bg-card p-4">
          <Circumplex points={points} onSelect={(id) => navigate(`/work/${id}`)} />
          <p className="mt-2 text-center text-xs text-muted-foreground">Click any point to analyze the work.</p>
        </div>
        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
            <div className="mb-1 font-medium text-foreground">Read this map with care</div>
            MoMA and Rothko himself reject a flat “dark = sad, bright = happy.” He painted luminous works at the very
            end and dark ones early. The dots show what the <em>color math</em> predicts — the curated readings on each
            work’s page often tell a richer or contrary story. The disagreement is the interesting part.
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="mb-1 font-medium text-foreground">Why lightness dominates</div>
            The model leans on lightness and chroma because that’s what the evidence supports
            (Valdez &amp; Mehrabian 1994; Schloss 2016; Jonauskaite 2020). Specific hue→emotion links are weak and
            culturally contingent, so hue only nudges arousal here.
          </div>
        </div>
      </div>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PAINTINGS } from '@/data/paintings'
import { generateRothkoPalette, paletteToTokens } from '@/lib/generate'
import { paletteFeatures } from '@/lib/color'
import { emotionFromFeatures, emotionLabel } from '@/lib/emotion'
import { RothkoAbstraction } from '@/components/RothkoAbstraction'
import { PaletteBar } from '@/components/PaletteBar'
import { PaintingImage } from '@/components/PaintingImage'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'

function Labeled({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground">{value}</span>
      </div>
      {children}
    </div>
  )
}

export function DesignStudio() {
  const [valence, setValence] = useState(0.4)
  const [arousal, setArousal] = useState(0.3)
  const [hue, setHue] = useState(45)
  const [copied, setCopied] = useState<string | null>(null)

  const palette = useMemo(() => generateRothkoPalette(valence, arousal, hue), [valence, arousal, hue])
  const result = useMemo(() => emotionFromFeatures(paletteFeatures(palette)), [palette])
  const tokens = useMemo(() => paletteToTokens(palette), [palette])

  const nearest = useMemo(() => {
    return [...PAINTINGS]
      .map((p) => ({
        p,
        d: Math.hypot(p.computedEmotion.valence - valence, p.computedEmotion.arousal - arousal),
      }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 3)
      .map((x) => x.p)
  }, [valence, arousal])

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      setCopied(null)
    }
  }

  return (
    <div>
      <header className="mb-6 max-w-2xl">
        <h1 className="font-serif text-4xl leading-tight tracking-tight">Design studio</h1>
        <p className="mt-3 text-muted-foreground">
          The payoff. Choose an emotion; the inverse color model returns a Rothko-style palette tuned to it. Lightness
          and chroma come from the same Valdez &amp; Mehrabian equations, run backwards — hue is yours to set. Export
          the result as design tokens.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <Labeled label="Valence" value={`${valence >= 0 ? '+' : ''}${valence.toFixed(2)}`}>
            <Slider min={-1} max={1} step={0.01} value={[valence]} onValueChange={([v]) => setValence(v)} />
          </Labeled>
          <Labeled label="Arousal" value={`${arousal >= 0 ? '+' : ''}${arousal.toFixed(2)}`}>
            <Slider min={-1} max={1} step={0.01} value={[arousal]} onValueChange={([v]) => setArousal(v)} />
          </Labeled>
          <Labeled label="Hue (character)" value={`${hue.toFixed(0)}°`}>
            <Slider min={0} max={360} step={1} value={[hue]} onValueChange={([v]) => setHue(v)} />
          </Labeled>

          <div className="rounded-lg border border-border bg-card p-4 text-sm">
            <div className="font-serif">{emotionLabel(result)}</div>
            <div className="mt-1 font-mono text-xs text-muted-foreground">
              result · valence {result.valence.toFixed(2)} · arousal {result.arousal.toFixed(2)}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              The generated palette’s own computed emotion — it should land close to your target, confirming the
              round-trip.
            </p>
          </div>
        </div>

        <div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1.3fr_1fr]">
            <RothkoAbstraction palette={palette} className="rounded-lg" ratio={1.15} />
            <div>
              <PaletteBar palette={palette} showHex height="h-6" />
              <div className="mt-4 space-y-3">
                {(['css', 'tailwind'] as const).map((kind) => (
                  <div key={kind} className="rounded-md border border-border bg-card">
                    <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">{kind}</span>
                      <Button size="sm" variant="ghost" onClick={() => copy(tokens[kind], kind)}>
                        {copied === kind ? 'copied' : 'copy'}
                      </Button>
                    </div>
                    <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed text-muted-foreground">{tokens[kind]}</pre>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-3 text-xs font-medium uppercase tracking-wider text-accent">
              Closest Rothkos to this emotion
            </div>
            <div className="grid grid-cols-3 gap-4">
              {nearest.map((p) => (
                <Link key={p.id} to={`/work/${p.id}`} className="group">
                  <PaintingImage painting={p} className="rounded-md" ratio={1.2} />
                  <div className="mt-2 font-serif text-sm leading-tight group-hover:text-accent">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{p.year}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

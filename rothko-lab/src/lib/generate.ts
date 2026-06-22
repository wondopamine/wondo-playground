import type { Swatch } from '@/types'
import { lchToHex, makeSwatch } from './color'
import { targetToLightChroma } from './emotion'

/**
 * Generate a Rothko-style palette (enveloping ground + two floating bands)
 * tuned to a target emotion. Valence/arousal set the lightness/chroma via the
 * inverse model; `hue` sets the character (warm vs cool); the band offsets
 * mimic Rothko's stacked, slightly-shifted fields.
 */
export function generateRothkoPalette(valence: number, arousal: number, hue: number): Swatch[] {
  const { lightness, chroma } = targetToLightChroma(valence, arousal)

  const ground = lchToHex(lightness, chroma * 0.85, hue)
  const upper = lchToHex(Math.min(lightness + 20, 97), chroma, (hue + 8) % 360)
  const lower = lchToHex(Math.max(lightness - 16, 5), chroma * 0.9, (hue + 22) % 360)

  return [makeSwatch(ground, 0.5), makeSwatch(upper, 0.3), makeSwatch(lower, 0.2)]
}

/** Export a palette as copy-pasteable design tokens. */
export function paletteToTokens(palette: Swatch[]): { css: string; tailwind: string } {
  const names = ['ground', 'field-1', 'field-2', 'accent', 'shadow']
  const entries = palette.map((s, i) => ({ name: names[i] ?? `color-${i}`, hex: s.hex }))

  const css = [':root {', ...entries.map((e) => `  --rothko-${e.name}: ${e.hex};`), '}'].join('\n')
  const tailwind = [
    '@theme {',
    ...entries.map((e) => `  --color-rothko-${e.name}: ${e.hex};`),
    '}',
  ].join('\n')

  return { css, tailwind }
}

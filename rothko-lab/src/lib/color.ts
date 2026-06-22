/**
 * Color science helpers. We work in CIELAB / CIELCh because they are
 * perceptually uniform — distances and lightness there track how the eye
 * actually responds, which matters when we feed lightness and chroma into the
 * emotion model (see emotion.ts).
 */
import { converter, formatHex } from 'culori'
import type { PaletteFeatures, Swatch } from '@/types'

const toLab = converter('lab')
const toLch = converter('lch')

/** Build a hex string from CIELCh coordinates (clamped to sRGB gamut). */
export function lchToHex(l: number, c: number, h: number): string {
  return formatHex({ mode: 'lch', l, c, h }) ?? '#000000'
}

/** Convert a hex string to CIELAB [L* (0–100), a*, b*]. */
export function hexToLab(hex: string): [number, number, number] {
  const c = toLab(hex)
  if (!c) return [0, 0, 0]
  return [c.l, c.a, c.b]
}

/** Convert a hex string to CIELCh [L* (0–100), C* chroma, h hue°]. */
export function hexToLch(hex: string): [number, number, number] {
  const c = toLch(hex)
  if (!c) return [0, 0, 0]
  return [c.l, c.c, c.h ?? 0]
}

/**
 * Is a hue "warm"? Warm spans red→yellow, roughly 330°..90° on the LCh wheel
 * (reds, oranges, yellows). Cool is the rest (greens, blues, purples).
 */
export function isWarmHue(hueDeg: number): boolean {
  const h = ((hueDeg % 360) + 360) % 360
  return h >= 330 || h <= 90
}

/** Smallest angular distance between two hues, 0–180°. */
function hueDistance(a: number, b: number): number {
  const d = Math.abs(((a % 360) + 360) % 360 - (((b % 360) + 360) % 360))
  return d > 180 ? 360 - d : d
}

/**
 * Derive the Measured-layer features from a palette. All aggregates are
 * area-weighted by swatch proportion so a thin accent doesn't dominate.
 */
export function paletteFeatures(palette: Swatch[]): PaletteFeatures {
  if (palette.length === 0) {
    return {
      meanLightness: 0,
      meanChroma: 0,
      warmRatio: 0,
      lightnessRange: 0,
      hueSpread: 0,
      contrast: 0,
    }
  }

  const totalArea = palette.reduce((s, p) => s + p.proportion, 0) || 1
  let meanLightness = 0
  let meanChroma = 0
  let warmArea = 0

  for (const s of palette) {
    const [l, c, h] = s.lch
    const w = s.proportion / totalArea
    meanLightness += l * w
    meanChroma += c * w
    if (isWarmHue(h)) warmArea += w
  }

  const lightnesses = palette.map((s) => s.lch[0])
  const lightnessRange = Math.max(...lightnesses) - Math.min(...lightnesses)

  // Hue spread: largest pairwise angular distance among reasonably chromatic
  // swatches (near-neutral swatches have unstable hue, so ignore C* < 5).
  const chromatic = palette.filter((s) => s.lch[1] >= 5)
  let hueSpread = 0
  for (let i = 0; i < chromatic.length; i++) {
    for (let j = i + 1; j < chromatic.length; j++) {
      hueSpread = Math.max(hueSpread, hueDistance(chromatic[i].lch[2], chromatic[j].lch[2]))
    }
  }

  // Composite contrast: blend of value contrast (lightness range / 100) and
  // hue contrast (hue spread / 180), value weighted higher since luminance
  // contrast dominates perceived drama.
  const contrast = Math.min(1, 0.65 * (lightnessRange / 100) + 0.35 * (hueSpread / 180))

  return {
    meanLightness,
    meanChroma,
    warmRatio: warmArea,
    lightnessRange,
    hueSpread,
    contrast,
  }
}

/** Build a full Swatch from a hex string and an area proportion. */
export function makeSwatch(hex: string, proportion: number): Swatch {
  return { hex, lab: hexToLab(hex), lch: hexToLch(hex), proportion }
}

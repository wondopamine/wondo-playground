/**
 * Domain model for Rothko Lab.
 *
 * Three deliberately separate layers — Measured, Felt, Valued — kept distinct
 * so the app never conflates an extracted color fact with a felt emotion or a
 * market price. The separation is the point of the project.
 */

export type Period =
  | 'early' // 1930s–mid 1940s, figurative / surrealist
  | 'multiform' // ~1946–1949
  | 'classic' // 1949–1970, signature color fields
  | 'seagram' // 1958–1959 murals
  | 'chapel' // 1964–1967 Houston chapel
  | 'late-dark' // 1969–1970 black-on-grey / brown-grey
  | 'late-bright' // 1969 luminous works on paper

export const PERIOD_LABELS: Record<Period, string> = {
  early: 'Early / Surrealist',
  multiform: 'Multiforms',
  classic: 'Classic color-field',
  seagram: 'Seagram murals',
  chapel: 'Rothko Chapel',
  'late-dark': 'Late black-on-grey',
  'late-bright': 'Late works on paper',
}

/** A single dominant color, with perceptual coordinates precomputed offline. */
export interface Swatch {
  hex: string
  /** CIELAB: L* 0–100, a*, b* */
  lab: [number, number, number]
  /** CIELCh: L* 0–100, C* (chroma), h (hue angle, degrees) */
  lch: [number, number, number]
  /** Share of the analyzed image area, 0–1. */
  proportion: number
}

/** Objective features derived from the palette. The "Measured" layer. */
export interface PaletteFeatures {
  /** Area-weighted mean L* (0–100). */
  meanLightness: number
  /** Area-weighted mean chroma C*. */
  meanChroma: number
  /** Fraction of palette area whose hue is "warm" (≈ -30°..90°), 0–1. */
  warmRatio: number
  /** Spread of L* across the palette (max − min), a value-contrast proxy. */
  lightnessRange: number
  /** Angular spread of hues in degrees, a hue-contrast proxy (0–180). */
  hueSpread: number
  /** Composite perceptual contrast, 0–1. */
  contrast: number
}

/**
 * Emotion on Russell's circumplex. The "Felt" layer, computed branch.
 * valence/arousal/dominance are normalized to roughly -1..1.
 */
export interface ComputedEmotion {
  valence: number
  arousal: number
  dominance: number
}

/** Documented human reading of the work. The "Felt" layer, curated branch. */
export interface CuratedEmotion {
  tags: string[]
  reading: string
  sourceUrl: string
}

export type PriceType = 'auction' | 'private'
export type PriceConfidence = 'confirmed' | 'rumored'

/** Real sale record. The "Valued" layer. */
export interface PriceRecord {
  amountUsd: number
  year: number
  venue: string
  type: PriceType
  confidence: PriceConfidence
  hammerUsd?: number
  /** Derived: amountUsd / areaCm2, for size-normalized comparison. */
  pricePerCm2?: number
}

export interface Painting {
  id: string
  title: string
  year: number
  period: Period
  dimensionsCm?: { h: number; w: number }
  areaCm2?: number
  /** We link out to the museum/auction page rather than claim ownership. */
  imageRef?: { museumUrl?: string; src?: string }
  palette: Swatch[]
  /**
   * How the palette was obtained. 'curated' = hand-sampled from documented
   * color descriptions (used when the source image can't be processed —
   * Rothko images are copyrighted and hotlink-blocked). 'extracted' = produced
   * by the offline k-means script from a local image.
   */
  paletteSource: 'curated' | 'extracted'
  features: PaletteFeatures
  computedEmotion: ComputedEmotion
  curatedEmotion?: CuratedEmotion
  price?: PriceRecord
  /** Citations backing this record. */
  sources: string[]
}

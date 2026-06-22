/**
 * Color → emotion model (the "Felt" layer, computed branch).
 *
 * Grounding (see /methodology in the app for the full write-up):
 *
 * - Valdez & Mehrabian (1994), J. Exp. Psychol: General. On Munsell chips they
 *   found brightness (B) and saturation (S) drive most emotional variance while
 *   hue contributes little. Standardized regression coefficients:
 *       pleasure   =  0.69·B + 0.22·S
 *       arousal    = -0.31·B + 0.60·S
 *       dominance  = -0.76·B + 0.32·S
 *   We map pleasure → valence and keep arousal/dominance.
 *
 * - Schloss et al. (2016) and Jonauskaite et al. (2020) corroborate that
 *   LIGHTNESS → valence (light = positive) is the most robust, cross-cultural
 *   signal, and that specific hue → emotion links are weak. So hue enters only
 *   as a small arousal term, never as the valence driver.
 *
 * - Wilms & Oberfeld (2018): a small additive arousal bump, red > green > blue,
 *   meaningful only at higher saturation.
 *
 * IMPORTANT honesty note carried into the UI: Valdez & Mehrabian standardized
 * B and S as z-scores across a color set. We instead center and normalize L*
 * and C* into roughly -1..1, preserving the validated DIRECTIONS and relative
 * WEIGHTS (brightness dominates valence; saturation dominates arousal) and
 * yielding bounded, comparable scores — but the absolute numbers are an
 * adaptation, not a literal reproduction of their scale.
 */
import type { ComputedEmotion, PaletteFeatures } from '@/types'

const COEF = {
  valence: { b: 0.69, s: 0.22 },
  arousal: { b: -0.31, s: 0.6 },
  dominance: { b: -0.76, s: 0.32 },
} as const

/** LCh chroma rarely exceeds this for paint-like, non-fluorescent colors. */
const REF_MAX_CHROMA = 110

const clamp = (v: number, lo = -1, hi = 1) => Math.max(lo, Math.min(hi, v))

/**
 * Center + normalize perceptual lightness/chroma to ~[-1, 1].
 *  - L* 0..100 → B in [-1, 1] (mid grey ≈ 0)
 *  - C* 0..REF_MAX → S in [-1, 1] (mid chroma ≈ 0)
 */
function normalize(lightness: number, chroma: number): { B: number; S: number } {
  const B = clamp((lightness / 100 - 0.5) * 2)
  const S = clamp((Math.min(chroma, REF_MAX_CHROMA) / REF_MAX_CHROMA - 0.5) * 2)
  return { B, S }
}

/**
 * Small arousal bump from hue: peaks at red (~40° in LCh), troughs at
 * blue/cyan (~220°), and only matters when the color is reasonably saturated.
 * Kept small per the evidence that hue is a weak emotional driver.
 */
function hueArousal(hueDeg: number, S: number): number {
  const RED_ANGLE = 40
  const warmth = Math.cos(((hueDeg - RED_ANGLE) * Math.PI) / 180) // +1 red, -1 blue
  const saturationGate = Math.max(0, (S + 1) / 2) // 0 at neutral, 1 at max chroma
  return 0.12 * warmth * saturationGate
}

/** Emotion of a single color given its LCh coordinates. */
export function colorEmotion(lch: [number, number, number]): ComputedEmotion {
  const [l, c, h] = lch
  const { B, S } = normalize(l, c)
  return {
    valence: clamp(COEF.valence.b * B + COEF.valence.s * S),
    arousal: clamp(COEF.arousal.b * B + COEF.arousal.s * S + hueArousal(h, S)),
    dominance: clamp(COEF.dominance.b * B + COEF.dominance.s * S),
  }
}

/**
 * Palette-level emotion. Uses the area-weighted mean lightness/chroma as the
 * primary signal, then nudges arousal up for high-contrast palettes — strong
 * value or hue opposition reads as more activating (directional evidence;
 * VIMAP and arousal-from-contrast literature), so we treat it as a modest
 * booster rather than a validated coefficient.
 */
export function emotionFromFeatures(features: PaletteFeatures): ComputedEmotion {
  const { B, S } = normalize(features.meanLightness, features.meanChroma)
  const contrastBoost = 0.25 * features.contrast

  return {
    valence: clamp(COEF.valence.b * B + COEF.valence.s * S),
    arousal: clamp(COEF.arousal.b * B + COEF.arousal.s * S + contrastBoost),
    dominance: clamp(COEF.dominance.b * B + COEF.dominance.s * S),
  }
}

/**
 * Inverse model: given a target valence and arousal, solve the two Valdez &
 * Mehrabian equations for the brightness (B) and saturation (S) that would
 * produce them, then map back to perceptual lightness L* (0–100) and chroma
 * C*. Used by the Design Studio to turn an emotion into a Rothko-style palette.
 * (We invert the valence/arousal pair only; the hue/contrast terms are
 * generative choices left to the designer.)
 */
export function targetToLightChroma(
  valence: number,
  arousal: number,
): { lightness: number; chroma: number } {
  const { valence: cv, arousal: ca } = COEF
  const det = cv.b * ca.s - cv.s * ca.b // 0.69*0.60 − 0.22*(−0.31)
  const B = (ca.s * valence - cv.s * arousal) / det
  const S = (cv.b * arousal - ca.b * valence) / det
  const lightness = clamp((B + 1) / 2, 0, 1) * 100
  const chroma = clamp((S + 1) / 2, 0, 1) * REF_MAX_CHROMA
  return { lightness, chroma }
}

/**
 * A human-readable mood label for a circumplex quadrant. Intentionally hedged
 * vocabulary — these are computed tendencies, not Rothko's intent.
 */
export function emotionLabel({ valence, arousal }: ComputedEmotion): string {
  const v = valence >= 0
  const a = arousal >= 0
  if (v && a) return 'radiant · energized'
  if (v && !a) return 'serene · contemplative'
  if (!v && a) return 'tense · dramatic'
  return 'somber · brooding'
}

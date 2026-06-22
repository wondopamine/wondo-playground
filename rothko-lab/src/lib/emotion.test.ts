import { describe, expect, it } from 'vitest'
import { colorEmotion, emotionFromFeatures, emotionLabel } from './emotion'
import { hexToLch, makeSwatch, paletteFeatures } from './color'

const inRange = (v: number) => v >= -1 && v <= 1

describe('colorEmotion', () => {
  it('keeps all axes within [-1, 1]', () => {
    for (const hex of ['#ffffff', '#000000', '#ff0000', '#0000ff', '#7a6b4f']) {
      const e = colorEmotion(hexToLch(hex))
      expect(inRange(e.valence)).toBe(true)
      expect(inRange(e.arousal)).toBe(true)
      expect(inRange(e.dominance)).toBe(true)
    }
  })

  it('rates light colors as higher valence than dark (Valdez & Mehrabian / Schloss)', () => {
    const light = colorEmotion(hexToLch('#f2efe9'))
    const dark = colorEmotion(hexToLch('#1a1410'))
    expect(light.valence).toBeGreaterThan(dark.valence)
  })

  it('rates a saturated red as higher arousal than a saturated blue (Wilms & Oberfeld)', () => {
    const red = colorEmotion(hexToLch('#d4341f'))
    const blue = colorEmotion(hexToLch('#1f49d4'))
    expect(red.arousal).toBeGreaterThan(blue.arousal)
  })

  it('rates a vivid color as higher arousal than a muted one of similar lightness', () => {
    const vivid = colorEmotion(hexToLch('#e0531a'))
    const muted = colorEmotion(hexToLch('#9c8071'))
    expect(vivid.arousal).toBeGreaterThan(muted.arousal)
  })
})

describe('emotionFromFeatures', () => {
  it('reads a luminous warm palette as positive valence', () => {
    const palette = [makeSwatch('#e8a13c', 0.6), makeSwatch('#d96b2b', 0.4)]
    const e = emotionFromFeatures(paletteFeatures(palette))
    expect(e.valence).toBeGreaterThan(0)
  })

  it('reads a dark maroon/black palette as negative valence', () => {
    const palette = [makeSwatch('#2a0d10', 0.6), makeSwatch('#120608', 0.4)]
    const e = emotionFromFeatures(paletteFeatures(palette))
    expect(e.valence).toBeLessThan(0)
  })
})

describe('emotionLabel', () => {
  it('labels the four quadrants', () => {
    expect(emotionLabel({ valence: 0.5, arousal: 0.5, dominance: 0 })).toContain('radiant')
    expect(emotionLabel({ valence: 0.5, arousal: -0.5, dominance: 0 })).toContain('serene')
    expect(emotionLabel({ valence: -0.5, arousal: 0.5, dominance: 0 })).toContain('tense')
    expect(emotionLabel({ valence: -0.5, arousal: -0.5, dominance: 0 })).toContain('somber')
  })
})

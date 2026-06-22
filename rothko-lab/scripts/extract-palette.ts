/**
 * Offline palette extractor — the "compounding" tool.
 *
 *   npm run extract -- path/to/painting.jpg [k]
 *
 * Decodes a local image, runs k-means clustering in CIELAB (perceptual space,
 * so clusters match how the eye groups color), and prints dominant swatches
 * with area proportions plus the derived features and computed emotion — the
 * exact shape used in src/data/paintings.ts. Drop in any image and paste the
 * result into the dataset; every addition enriches every chart for free.
 *
 * Images are NOT downloaded here: Rothko works are copyrighted and hotlink-
 * blocked. Point this at a local file you have the right to analyze.
 */
import sharp from 'sharp'
import { converter } from 'culori'
import { paletteFeatures } from '../src/lib/color.ts'
import { emotionFromFeatures } from '../src/lib/emotion.ts'
import type { Swatch } from '../src/types.ts'

const toLab = converter('lab')
const toRgb = converter('rgb')

type Lab = { l: number; a: number; b: number }

function rgbToLab(r: number, g: number, b: number): Lab {
  const c = toLab({ mode: 'rgb', r: r / 255, g: g / 255, b: b / 255 })!
  return { l: c.l, a: c.a, b: c.b }
}

function labToHex(l: number, a: number, b: number): string {
  const c = toRgb({ mode: 'lab', l, a, b })!
  const to255 = (v: number) => Math.max(0, Math.min(255, Math.round(v * 255)))
  return (
    '#' +
    [to255(c.r), to255(c.g), to255(c.b)]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
  )
}

const dist = (p: Lab, q: Lab) =>
  (p.l - q.l) ** 2 + (p.a - q.a) ** 2 + (p.b - q.b) ** 2

function kmeans(points: Lab[], k: number, iterations = 20) {
  // k-means++ style seeding: spread initial centroids out.
  const centroids: Lab[] = [points[(Math.random() * points.length) | 0]]
  while (centroids.length < k) {
    const d2 = points.map((p) => Math.min(...centroids.map((c) => dist(p, c))))
    const sum = d2.reduce((a, b) => a + b, 0)
    let r = Math.random() * sum
    let idx = 0
    while (r > 0 && idx < d2.length) r -= d2[idx++]
    centroids.push(points[Math.max(0, idx - 1)])
  }

  const assign = new Array(points.length).fill(0)
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < points.length; i++) {
      let best = 0
      let bestD = Infinity
      for (let c = 0; c < k; c++) {
        const d = dist(points[i], centroids[c])
        if (d < bestD) (bestD = d), (best = c)
      }
      assign[i] = best
    }
    const sums = Array.from({ length: k }, () => ({ l: 0, a: 0, b: 0, n: 0 }))
    for (let i = 0; i < points.length; i++) {
      const s = sums[assign[i]]
      s.l += points[i].l
      s.a += points[i].a
      s.b += points[i].b
      s.n++
    }
    for (let c = 0; c < k; c++) {
      if (sums[c].n > 0) {
        centroids[c] = { l: sums[c].l / sums[c].n, a: sums[c].a / sums[c].n, b: sums[c].b / sums[c].n }
      }
    }
  }

  const counts = new Array(k).fill(0)
  for (const a of assign) counts[a]++
  return centroids.map((c, i) => ({ centroid: c, count: counts[i] }))
}

async function main() {
  const [file, kArg] = process.argv.slice(2)
  if (!file) {
    console.error('usage: npm run extract -- <image> [k]')
    process.exit(1)
  }
  const k = Number(kArg) || 5

  const { data, info } = await sharp(file)
    .resize(160, 160, { fit: 'inside' })
    .raw()
    .toBuffer({ resolveWithObject: true })

  const points: Lab[] = []
  for (let i = 0; i < data.length; i += info.channels) {
    points.push(rgbToLab(data[i], data[i + 1], data[i + 2]))
  }

  const clusters = kmeans(points, k).sort((x, y) => y.count - x.count)
  const total = clusters.reduce((s, c) => s + c.count, 0)

  const palette: Swatch[] = clusters.map((c) => {
    const hex = labToHex(c.centroid.l, c.centroid.a, c.centroid.b)
    const lchC = converter('lch')(hex)!
    return {
      hex,
      lab: [c.centroid.l, c.centroid.a, c.centroid.b],
      lch: [lchC.l, lchC.c, lchC.h ?? 0],
      proportion: Number((c.count / total).toFixed(3)),
    }
  })

  const features = paletteFeatures(palette)
  console.log(JSON.stringify({ palette, features, computedEmotion: emotionFromFeatures(features) }, null, 2))
}

main()

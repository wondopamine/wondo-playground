/**
 * Seed corpus. 20 works across every period and the full price spectrum.
 *
 * Palettes are 'curated' — hand-sampled from documented color descriptions in
 * museum and auction sources (Rothko images are copyrighted and hotlink-
 * blocked, so we don't extract from pixels here; use `npm run extract` on a
 * local image to add 'extracted' palettes). Every other field — features,
 * computed emotion, price/cm² — is derived by the same pipeline the rest of
 * the app uses, so the data can never drift from the model.
 *
 * Prices carry type (auction/private) and confidence (confirmed/rumored)
 * flags; private/rumored figures (esp. No. 6) are press-derived, not disclosed.
 */
import type { Painting, Period, PriceRecord } from '@/types'
import { makeSwatch, paletteFeatures } from '@/lib/color'
import { emotionFromFeatures } from '@/lib/emotion'

interface RawPainting {
  id: string
  title: string
  year: number
  period: Period
  dimensionsCm?: { h: number; w: number }
  /** [hex, areaProportion] pairs; proportions should sum to ~1. */
  palette: [string, number][]
  curatedEmotion?: { tags: string[]; reading: string; sourceUrl: string }
  price?: Omit<PriceRecord, 'pricePerCm2'>
  museumUrl?: string
  imageSrc?: string
  sources: string[]
}

function build(raw: RawPainting): Painting {
  const palette = raw.palette.map(([hex, p]) => makeSwatch(hex, p))
  const features = paletteFeatures(palette)
  const areaCm2 = raw.dimensionsCm ? raw.dimensionsCm.h * raw.dimensionsCm.w : undefined
  const price: PriceRecord | undefined = raw.price
    ? {
        ...raw.price,
        pricePerCm2: areaCm2 ? raw.price.amountUsd / areaCm2 : undefined,
      }
    : undefined

  return {
    id: raw.id,
    title: raw.title,
    year: raw.year,
    period: raw.period,
    dimensionsCm: raw.dimensionsCm,
    areaCm2,
    imageRef: { museumUrl: raw.museumUrl, src: raw.imageSrc },
    palette,
    paletteSource: 'curated',
    features,
    computedEmotion: emotionFromFeatures(features),
    curatedEmotion: raw.curatedEmotion,
    price,
    sources: raw.sources,
  }
}

const RAW: RawPainting[] = [
  {
    id: 'orange-red-yellow-1961',
    title: 'Orange, Red, Yellow',
    year: 1961,
    period: 'classic',
    dimensionsCm: { h: 236.2, w: 206.4 },
    palette: [
      ['#e8531a', 0.45],
      ['#f2a81d', 0.3],
      ['#c41f12', 0.25],
    ],
    curatedEmotion: {
      tags: ['fiery', 'radiant', 'intense'],
      reading:
        'Three radiant warm rectangles read as fiery, contemplative warmth — emotional intensity carried entirely by heat of color.',
      sourceUrl: 'https://en.wikipedia.org/wiki/Orange,_Red,_Yellow',
    },
    price: { amountUsd: 86_882_500, year: 2012, venue: 'Christie’s NY', type: 'auction', confidence: 'confirmed', hammerUsd: 77_500_000 },
    museumUrl: 'https://en.wikipedia.org/wiki/Orange,_Red,_Yellow',
    sources: ['https://en.wikipedia.org/wiki/Orange,_Red,_Yellow', 'https://heni.com/news/article/mark-rothko-orange-red-yellow-2012-05-08'],
  },
  {
    id: 'no6-violet-green-red-1951',
    title: 'No. 6 (Violet, Green and Red)',
    year: 1951,
    period: 'classic',
    dimensionsCm: { h: 230, w: 137 },
    palette: [
      ['#5e4a78', 0.45],
      ['#7d9a5a', 0.3],
      ['#a83228', 0.25],
    ],
    curatedEmotion: {
      tags: ['rare', 'balanced', 'classic'],
      reading:
        'A classic-period balance of cool violet ground against green and red bands; prized as a textbook example of the mature style.',
      sourceUrl: 'https://en.wikipedia.org/wiki/No._6_(Violet,_Green_and_Red)',
    },
    price: { amountUsd: 186_000_000, year: 2014, venue: 'Private (Bouvier → Rybolovlev)', type: 'private', confidence: 'rumored' },
    museumUrl: 'https://en.wikipedia.org/wiki/No._6_(Violet,_Green_and_Red)',
    sources: ['https://en.wikipedia.org/wiki/No._6_(Violet,_Green_and_Red)', 'https://www.cnbc.com/2024/02/29/christies-sells-rothko-painting-for-100-million-in-a-secret-sale.html'],
  },
  {
    id: 'no15-two-greens-red-stripe-1964',
    title: 'No. 15 (Two Greens and Red Stripe)',
    year: 1964,
    period: 'classic',
    dimensionsCm: { h: 232, w: 178 },
    palette: [
      ['#171410', 0.4],
      ['#3f5a3a', 0.3],
      ['#5a7d4a', 0.2],
      ['#b53322', 0.1],
    ],
    curatedEmotion: {
      tags: ['inky', 'grave', 'taut'],
      reading:
        'Deep greens over inky black with a single red stripe — grave and taut; proof that the market’s top price need not be a warm work.',
      sourceUrl: 'https://www.artnews.com/art-news/market/agnes-gund-collection-christies-rothko-twombly-cornell-1234773450/',
    },
    price: { amountUsd: 98_400_000, year: 2026, venue: 'Christie’s NY (Gund estate)', type: 'auction', confidence: 'confirmed' },
    museumUrl: 'https://en.thevalue.com/articles/mark-rothko-auction-record-christies-new-york-agnes-gund-collection-spring-sales-2026',
    sources: ['https://en.thevalue.com/articles/mark-rothko-auction-record-christies-new-york-agnes-gund-collection-spring-sales-2026'],
  },
  {
    id: 'brown-blacks-in-reds-1957',
    title: 'Brown and Blacks in Reds',
    year: 1957,
    period: 'classic',
    dimensionsCm: { h: 252, w: 207 },
    palette: [
      ['#6b2f22', 0.4],
      ['#2a1410', 0.3],
      ['#8a3a26', 0.2],
      ['#1a0c0a', 0.1],
    ],
    price: { amountUsd: 85_800_000, year: 2026, venue: 'Sotheby’s NY (Mnuchin)', type: 'auction', confidence: 'confirmed', hammerUsd: 74_000_000 },
    sources: ['https://www.artforum.com/news/rothko-sells-for-85-8-million-almost-surpasses-record-1234750496/', 'https://news.artnet.com/market/mnuchin-rothko-sothebys-2773274'],
  },
  {
    id: 'no7-1951',
    title: 'No. 7',
    year: 1951,
    period: 'classic',
    dimensionsCm: { h: 241, w: 175 },
    palette: [
      ['#c2502a', 0.4],
      ['#e0a73c', 0.3],
      ['#9a2f22', 0.3],
    ],
    price: { amountUsd: 82_500_000, year: 2021, venue: 'Sotheby’s NY (Macklowe)', type: 'auction', confidence: 'confirmed' },
    museumUrl: 'https://www.sothebys.com/en/buy/auction/2021/the-macklowe-collection/no-7',
    sources: ['https://www.sothebys.com/en/buy/auction/2021/the-macklowe-collection/no-7'],
  },
  {
    id: 'no10-1958',
    title: 'No. 10',
    year: 1958,
    period: 'classic',
    dimensionsCm: { h: 239, w: 176 },
    palette: [
      ['#1a1410', 0.45],
      ['#c2622a', 0.3],
      ['#e08a3c', 0.15],
      ['#7a3320', 0.1],
    ],
    curatedEmotion: {
      tags: ['smouldering', 'haloed', 'dark-warm'],
      reading:
        'Dark orange forms haloed over black — a smouldering work that still commanded $81.9M, complicating any simple "warm sells, dark doesn’t".',
      sourceUrl: 'https://news.artnet.com/market/christies-658-million-sale-record-rothko-89-million-297476',
    },
    price: { amountUsd: 81_925_000, year: 2015, venue: 'Christie’s NY', type: 'auction', confidence: 'confirmed', hammerUsd: 73_000_000 },
    sources: ['https://news.artnet.com/market/christies-658-million-sale-record-rothko-89-million-297476'],
  },
  {
    id: 'no1-royal-red-blue-1954',
    title: 'No. 1 (Royal Red and Blue)',
    year: 1954,
    period: 'classic',
    dimensionsCm: { h: 288.9, w: 171.5 },
    palette: [
      ['#e07b2a', 0.3],
      ['#b52838', 0.35],
      ['#2a3f8a', 0.35],
    ],
    price: { amountUsd: 75_122_500, year: 2012, venue: 'Sotheby’s NY', type: 'auction', confidence: 'confirmed' },
    museumUrl: 'https://en.wikipedia.org/wiki/No_1_(Royal_Red_and_Blue)',
    sources: ['https://en.wikipedia.org/wiki/No_1_(Royal_Red_and_Blue)'],
  },
  {
    id: 'white-center-1950',
    title: 'White Center (Yellow, Pink and Lavender on Rose)',
    year: 1950,
    period: 'classic',
    dimensionsCm: { h: 205.8, w: 141 },
    palette: [
      ['#ecc24a', 0.3],
      ['#f0ece0', 0.2],
      ['#c9a0b8', 0.2],
      ['#d4607a', 0.2],
      ['#1a1410', 0.1],
    ],
    curatedEmotion: {
      tags: ['warm', 'bright', 'transcendent'],
      reading: 'Warm, bright, "even happy"; widely read as spiritual transcendence.',
      sourceUrl: 'https://en.wikipedia.org/wiki/White_Center_(Yellow,_Pink_and_Lavender_on_Rose)',
    },
    price: { amountUsd: 72_840_000, year: 2007, venue: 'Sotheby’s NY (Rockefeller)', type: 'auction', confidence: 'confirmed' },
    museumUrl: 'https://en.wikipedia.org/wiki/White_Center_(Yellow,_Pink_and_Lavender_on_Rose)',
    sources: ['https://en.wikipedia.org/wiki/White_Center_(Yellow,_Pink_and_Lavender_on_Rose)'],
  },
  {
    id: 'untitled-violet-orange-burgundy-1962',
    title: 'Untitled',
    year: 1962,
    period: 'classic',
    dimensionsCm: { h: 258, w: 190 },
    palette: [
      ['#5e4a78', 0.35],
      ['#e0732a', 0.35],
      ['#6b2030', 0.3],
    ],
    price: { amountUsd: 66_245_000, year: 2014, venue: 'Christie’s NY', type: 'auction', confidence: 'confirmed' },
    sources: ['https://www.artnews.com/list/art-news/artists/most-expensive-works-by-mark-rothko-auction-records-1234604959/'],
  },
  {
    id: 'untitled-1960',
    title: 'Untitled',
    year: 1960,
    period: 'classic',
    dimensionsCm: { h: 235, w: 178 },
    palette: [
      ['#b54a2a', 0.4],
      ['#e0a83c', 0.3],
      ['#3a3a5a', 0.3],
    ],
    price: { amountUsd: 50_100_000, year: 2019, venue: 'Sotheby’s NY (SFMOMA deaccession)', type: 'auction', confidence: 'confirmed' },
    sources: ['https://www.sothebys.com/en/auctions/ecatalogue/2019/contemporary-art-evening-auction-n10069/lot.12.html'],
  },
  {
    id: 'no21-red-brown-black-orange-1953',
    title: 'No. 21 (Red, Brown, Black and Orange)',
    year: 1953,
    period: 'classic',
    dimensionsCm: { h: 240, w: 230 },
    palette: [
      ['#a83020', 0.3],
      ['#5e2a1a', 0.3],
      ['#1a1208', 0.2],
      ['#e0732a', 0.2],
    ],
    price: { amountUsd: 45_000_000, year: 2014, venue: 'Sotheby’s NY (Schlumberger)', type: 'auction', confidence: 'confirmed' },
    sources: ['https://www.artnet.com/artists/mark-rothko/no-21-red-brown-black-and-orange-soLOWN5rh2yuV5KQNEnjfA2'],
  },
  {
    id: 'untitled-yellow-orange-1955',
    title: 'Untitled (Yellow, Orange, Yellow, Light Orange)',
    year: 1955,
    period: 'classic',
    dimensionsCm: { h: 207, w: 152.5 },
    palette: [
      ['#ecc24a', 0.4],
      ['#e08a2a', 0.35],
      ['#f2d96a', 0.25],
    ],
    curatedEmotion: {
      tags: ['sunlit', 'buoyant', 'warm'],
      reading: 'An all-warm cascade of yellows and oranges — sunlit and buoyant.',
      sourceUrl: 'https://www.sothebys.com/en/auctions/ecatalogue/2014/masterworks-mellon-n09245/lot.14.html',
    },
    price: { amountUsd: 36_500_000, year: 2014, venue: 'Sotheby’s NY (Mellon)', type: 'auction', confidence: 'confirmed' },
    sources: ['https://www.sothebys.com/en/auctions/ecatalogue/2014/masterworks-mellon-n09245/lot.14.html'],
  },
  {
    id: 'untitled-yellow-and-blue-1954',
    title: 'Untitled (Yellow and Blue)',
    year: 1954,
    period: 'classic',
    dimensionsCm: { h: 245, w: 188 },
    palette: [
      ['#ecc24a', 0.5],
      ['#2a4a9a', 0.5],
    ],
    curatedEmotion: {
      tags: ['split', 'warm-cool', 'tense-calm'],
      reading:
        'A near-even split of warm yellow over cool blue; its value later fell ~30% (to $32.5M in 2024), partly tied to a tainted provenance.',
      sourceUrl: 'https://news.artnet.com/market/work-of-the-week-rothko-hong-kong-2569492',
    },
    price: { amountUsd: 46_500_000, year: 2015, venue: 'Sotheby’s NY', type: 'auction', confidence: 'confirmed' },
    sources: ['https://en.thevalue.com/articles/sothebys-hong-kong-modern-contemporary-evening-sale-result-mark-rothko-2024'],
  },
  {
    id: 'magenta-black-green-on-orange-1949',
    title: 'No. 3/No. 13 (Magenta, Black, Green on Orange)',
    year: 1949,
    period: 'multiform',
    dimensionsCm: { h: 216.5, w: 164.8 },
    palette: [
      ['#e0532a', 0.35],
      ['#a8285a', 0.25],
      ['#1a1410', 0.2],
      ['#3f6b4a', 0.2],
    ],
    curatedEmotion: {
      tags: ['vibrant', 'threshold', 'vibrating'],
      reading:
        'At the threshold of the classic style; the green bar optically vibrates against the orange ground — the "zenith of his vibrant period".',
      sourceUrl: 'https://www.moma.org/magazine/articles/829',
    },
    museumUrl: 'https://www.moma.org/collection/works/79687',
    sources: ['https://www.moma.org/collection/works/79687', 'https://www.moma.org/magazine/articles/829'],
  },
  {
    id: 'multiform-1948',
    title: 'Multiform',
    year: 1948,
    period: 'multiform',
    palette: [
      ['#3a6b8a', 0.3],
      ['#3aa89a', 0.25],
      ['#e0732a', 0.25],
      ['#6b3a2a', 0.2],
    ],
    curatedEmotion: {
      tags: ['floating', 'transitional', 'diaphanous'],
      reading:
        'Soft-edged blocks of blue, turquoise and orange over red-brown — color zones beginning to do the emotional work formerly carried by figures.',
      sourceUrl: 'https://www.markrothko.org/multiform/',
    },
    museumUrl: 'https://www.wikiart.org/en/mark-rothko/multiform-1948',
    sources: ['https://www.wikiart.org/en/mark-rothko/multiform-1948', 'https://www.markrothko.org/multiform/'],
  },
  {
    id: 'black-on-maroon-seagram-1958',
    title: 'Black on Maroon (Seagram Mural)',
    year: 1958,
    period: 'seagram',
    dimensionsCm: { h: 266.7, w: 381.2 },
    palette: [
      ['#3a1418', 0.55],
      ['#1a0a0c', 0.3],
      ['#5e1a20', 0.15],
    ],
    curatedEmotion: {
      tags: ['oppressive', 'funereal', 'enveloping'],
      reading:
        'Maroon and black portals meant to make viewers feel "trapped in a room where all the doors and windows are bricked up". Donated to the Tate; not for sale.',
      sourceUrl: 'https://en.wikipedia.org/wiki/Seagram_murals',
    },
    museumUrl: 'https://www.tate.org.uk/art/artworks/rothko-black-on-maroon-t01031',
    sources: ['https://en.wikipedia.org/wiki/Seagram_murals', 'https://www.tate.org.uk/visit/tate-britain/display/jmw-turner/mark-rothko-seagram-murals'],
  },
  {
    id: 'no14-1960-sfmoma',
    title: 'No. 14, 1960',
    year: 1960,
    period: 'classic',
    dimensionsCm: { h: 290.2, w: 268.3 },
    palette: [
      ['#e0732a', 0.4],
      ['#1a2a4a', 0.35],
      ['#3a2438', 0.25],
    ],
    curatedEmotion: {
      tags: ['threshold', 'sublime', 'inner-drama'],
      reading:
        'Fiery orange over brooding dark blue on an eggplant ground — read as "emotional thresholds": hope above, the weight of human experience below.',
      sourceUrl: 'https://www.sfmoma.org/artwork/97.524/',
    },
    museumUrl: 'https://www.sfmoma.org/artwork/97.524/',
    sources: ['https://www.sfmoma.org/artwork/97.524/'],
  },
  {
    id: 'untitled-black-on-gray-1969',
    title: 'Untitled (Black on Gray)',
    year: 1969,
    period: 'late-dark',
    dimensionsCm: { h: 203.3, w: 175.5 },
    palette: [
      ['#1a1714', 0.5],
      ['#8a857e', 0.4],
      ['#e8e4dc', 0.1],
    ],
    curatedEmotion: {
      tags: ['austere', 'lunar', 'stark'],
      reading:
        'Two stark registers — black over grey with a hand-painted white border. Read as moonscapes/windows, not necessarily despair (MoMA cautions against the "dark = depression" reading).',
      sourceUrl: 'https://www.guggenheim.org/artwork/3535',
    },
    museumUrl: 'https://www.guggenheim.org/artwork/3535',
    sources: ['https://www.guggenheim.org/artwork/3535', 'https://www.moma.org/magazine/articles/829'],
  },
  {
    id: 'rothko-chapel-mural-1966',
    title: 'Rothko Chapel Mural',
    year: 1966,
    period: 'chapel',
    dimensionsCm: { h: 457, w: 267 },
    palette: [
      ['#1a0e12', 0.5],
      ['#2e1620', 0.3],
      ['#3a2440', 0.2],
    ],
    curatedEmotion: {
      tags: ['contemplative', 'spiritual', 'somber'],
      reading:
        'Near-monochrome black, maroon and plum for meditation. The guestbook’s most frequent word is "peace" — though critics split on whether it is sublime or oppressive.',
      sourceUrl: 'https://rothkochapel.org/learn/about/',
    },
    museumUrl: 'https://rothkochapel.org/learn/about/',
    sources: ['https://en.wikipedia.org/wiki/Rothko_Chapel', 'https://daily.jstor.org/how-the-rothko-chapel-creates-spiritual-space/'],
  },
  {
    id: 'orange-and-yellow-1956',
    title: 'Orange and Yellow',
    year: 1956,
    period: 'classic',
    dimensionsCm: { h: 231, w: 180.3 },
    palette: [
      ['#e89a2a', 0.5],
      ['#f2c84a', 0.3],
      ['#e0d8b0', 0.2],
    ],
    curatedEmotion: {
      tags: ['radiant', 'vital', 'hopeful'],
      reading: 'Glowing orange and yellow — warmth, vitality, happiness, hope; "tranquil yet commanding".',
      sourceUrl: 'https://buffaloakg.org/artworks/k19568-orange-and-yellow',
    },
    museumUrl: 'https://buffaloakg.org/artworks/k19568-orange-and-yellow',
    sources: ['https://buffaloakg.org/artworks/k19568-orange-and-yellow'],
  },
]

export const PAINTINGS: Painting[] = RAW.map(build)

export function getPainting(id: string): Painting | undefined {
  return PAINTINGS.find((p) => p.id === id)
}

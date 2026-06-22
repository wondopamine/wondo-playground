# Rothko Color · Emotion · Price — Research & Build Plan

A web app that analyzes Mark Rothko's color, links it to emotion (computed + documented),
connects both to sale prices, and distills design-applicable insights.

---

## Part 1 — Research synthesis (the facts that drive the design)

### 1.1 Palette evolution (the spine of the dataset)

| Period | Years | Core hues | Value | Saturation |
|---|---|---|---|---|
| Early figurative / Surrealist | 1930s–mid 40s | ochre, brown, grayed green/blue, dim red | dark | low |
| Multiforms | ~1946–49 | yellow, orange, green, blue over red-brown | mixed | rising |
| Classic color-field | 1949–70 | orange, red, yellow, pink, lavender, blue | mostly luminous | high |
| Seagram murals | 1958–59 | maroon, dark red, brown, black | very dark | low–mid |
| Rothko Chapel | 1964–67 | black, maroon, plum/purple | very dark | very low |
| Late black-on-grey / brown-grey | 1969–70 | black, grey (lavender/brown hints) + white border | dark, austere | low |
| Late bright works on paper | 1969 | mauve, lavender, pale pink, light blue | light | mid |

Key nuance: the "1957 switch to dark" is gradual, not absolute — bright warm works
(e.g. *Orange, Red, Yellow*, 1961) continue afterward. Title color-names are usually
curatorial, not Rothko's.

### 1.2 Color → emotion

- **Rothko's own frame:** "I'm interested only in expressing basic human emotions —
  tragedy, ecstasy, doom" (Selden Rodman, *Conversations with Artists*, 1956/57). He
  explicitly rejected formalist "color relationship" readings; color is a *vehicle*.
- **Documented readings of specific works:** Seagram murals = oppressive/funereal
  ("trapped in a room where all the doors and windows are bricked up"); Chapel =
  contemplative/spiritual (guestbook's most frequent word: "peace") but contested as
  "too somber"; *White Center* / *Orange and Yellow* = warm, radiant, hopeful;
  Black-on-Grey = austere, moonscape-like.
- **CRITICAL design constraint:** MoMA explicitly warns against reading "dark =
  depression, bright = joy" — Rothko painted bright works at the very end and dark
  works from the early 1950s. The app must NOT hard-code that gradient.

### 1.3 Color-psychology science (the computable model)

The most reproducible, citable result: **lightness and saturation drive most emotional
variance; hue contributes little once they're controlled.**

- **Russell's circumplex** (valence × arousal) is the target space.
- **Valdez & Mehrabian (1994)** — standardized regression on Munsell chips (B = brightness,
  S = saturation, both z-scored):
  ```
  pleasure(valence) =  0.69·B + 0.22·S
  arousal           = -0.31·B + 0.60·S
  dominance         = -0.76·B + 0.32·S
  ```
- **Schloss et al. (2016):** ~82% of "happiness" variance = lightness, +6% chroma, +6%
  blue-yellow (bluer = happier). Hue effects largely vanish when lightness/chroma equated.
- **Jonauskaite et al. (2020, n≈4,600, 30 nations):** color-emotion associations largely
  universal; the **light = positive / dark = negative valence effect is the most
  cross-culturally robust signal**; specific hue→emotion links are weaker/cultural.
- **Wilms & Oberfeld (2018):** arousal highest for saturated+bright; red > green > blue
  (small hue term, only at high saturation).

Implication: compute in **CIELAB → LCh** (perceptual), feed L\* and C\* into
Valdez–Mehrabian, add a small red-weighted hue term to arousal, aggregate the palette,
and **label hue→emotion claims as weak/cultural in the UI.**

### 1.4 Technique / brushwork (scope boundary)

Detectable from a good photo: **edge softness / gradient width** (the feathered
boundary — his most characteristic signal), **color bleed at edges**, **relative
luminosity/glow** (figure lighter/more saturated than ground). NOT detectable from a
standard photo: layer count, binder, impasto texture, true (un-faded) color. So a
"brushwork" feature is limited to edge-gradient + figure-ground luminosity, clearly
labeled experimental.

### 1.5 Prices (real data, with flags)

| Title | Year | Price (USD) | Venue / type | Dominant colors |
|---|---|---|---|---|
| No. 6 (Violet, Green and Red) | 1951 | ~$186M (2014) / ~$195M (2024) — **DISPUTED/private** | private | violet, green, red |
| No. 15 (Two Greens and Red Stripe) | 1964 | **$98.4M** — public record | Christie's 2026 | black, green, red stripe |
| Orange, Red, Yellow | 1961 | $86.9M | Christie's 2012 | orange, red, yellow |
| Brown and Blacks in Reds | 1957 | $85.8M | Sotheby's 2026 | browns, blacks, reds |
| No. 7 | 1951 | $82.5M | Sotheby's 2021 | classic field |
| No. 10 | 1958 | $81.9M | Christie's 2015 | dark orange / black |
| No. 1 (Royal Red and Blue) | 1954 | $75.1M | Sotheby's 2012 | orange / red / blue |
| White Center | 1950 | $72.8M | Sotheby's 2007 | yellow, lavender on rose |
| Untitled | 1962 | $66.2M | Christie's 2014 | violet, orange, burgundy |
| Untitled (1960) | 1960 | $50.1M | Sotheby's 2019 | classic field |
| No. 21 (Red, Brown, Black, Orange) | 1951/53 | $45M | Sotheby's 2014 | red, brown, black, orange |
| Untitled (Yellow, Orange...) | 1955 | $36.5M | Sotheby's 2014 | yellows, oranges |
| Untitled (Yellow and Blue) | 1954 | $46.5M (2015) → $32.5M (2024) | Sotheby's | yellow over blue |

Price drivers: **warm/red premium is real but not deterministic** (WSJ: collectors "pay
more for works that are red and gold, as opposed to gray"; academic "Price of Color in
Rothko" + hedonic studies support color-intensity/diversity premiums) — yet the current
record is black/green and dark *No. 10* hit $81.9M. Other drivers: **classic 1950s
period, large size, blue-chip provenance, exhibition history.** Store price_type
(auction/private), confidence (confirmed/rumored), and hammer-vs-premium.

---

## Part 2 — App concept & feature brainstorm

**One-liner:** An interactive lab that decomposes Rothko's color, shows what it makes
people feel (by formula *and* by the historical record), tests that against what the
market paid, and hands you design-ready palettes and takeaways.

Three honest layers, kept visibly separate (this separation IS the intellectual product):
1. **Measured** — color features extracted from the work (objective).
2. **Felt** — computed emotion (Valdez–Mehrabian) vs documented curated readings; the
   *divergence* between them is a first-class insight, not an error.
3. **Valued** — real sale prices, explored against color, with confounds stated.

### Screens
- **Corpus / gallery** — browse the dataset; filter by period, palette, emotion, price;
  each card shows the extracted palette, not (necessarily) the copyrighted image.
- **Painting detail** — palette swatches + LCh breakdown; valence/arousal point on a
  circumplex; curated emotional reading with citation; period & technique notes;
  price card with confidence/type flags; link to the museum/auction page.
- **Color lab** — palette extraction, warm/cool ratio, lightness range, hue spread /
  contrast; compare two works side by side.
- **Emotion map** — all works on a valence×arousal circumplex; toggle computed vs
  curated; highlight where formula and humans disagree (e.g. dark works that read "peace").
- **Price explorer** — scatter of color features vs price/cm² (inflation-adjusted,
  private/rumored flagged); warm-vs-cool and period-premium views; record timeline.
- **Design studio (the payoff)** — generate a Rothko-derived palette tuned to a target
  emotion (pick a point on the circumplex → get a palette via the inverse model);
  show which palette traits correlate with higher value; export CSS/Tailwind tokens.
- **Methodology** — the model, every citation, and the caveats (disputed mappings,
  copyright, private-sale uncertainty). Transparency is the credibility.

---

## Part 3 — Data model

```ts
type Period = 'early' | 'multiform' | 'classic' | 'seagram' | 'chapel' | 'late-dark' | 'late-bright';

interface Swatch { hex: string; lab: [number, number, number]; lch: [number, number, number]; proportion: number; }

interface Painting {
  id: string;
  title: string;
  year: number;
  period: Period;
  dimensionsCm?: { h: number; w: number };
  areaCm2?: number;
  imageRef?: { museumUrl: string; thumb?: string };   // link out; avoid redistributing
  palette: Swatch[];                                    // precomputed offline (k-means in LAB)
  features: {
    meanLightness: number; meanChroma: number;
    warmRatio: number; lightnessRange: number; hueSpread: number; contrast: number;
  };
  computedEmotion: { valence: number; arousal: number; dominance: number };
  curatedEmotion?: { tags: string[]; reading: string; sourceUrl: string };
  price?: {
    amountUsd: number; year: number; venue: string;
    type: 'auction' | 'private'; confidence: 'confirmed' | 'rumored';
    hammerUsd?: number; pricePerCm2?: number;
  };
  sources: string[];
}
```

Copyright note: Rothko works are under copyright (estate/ARS). Lead with the **extracted
palette + a generated abstraction**, link out to museum pages, and treat any thumbnails as
fair-use/educational. The palette-first approach is both copyright-safe and on-theme.

---

## Part 4 — Architecture & stack

- **Vite + React + TypeScript**, **Tailwind + shadcn/ui** (per the request).
- **Color science:** `culori` (LAB/LCh conversions, deltaE) — pure, well-tested.
- **Palette extraction:** done **offline** in a Node script (k-means over LAB pixels) and
  baked into the dataset JSON — more reliable than client-side, sidesteps image CORS.
- **Emotion model:** a pure, documented `emotion.ts` module (Valdez–Mehrabian + citations)
  with unit tests — the scientific core, isolated and verifiable.
- **Charts:** Recharts for scatter/timeline; a small custom SVG circumplex.
- **No backend** — static SPA over a typed JSON dataset.

**Compound-engineering build:** the dataset, the extraction script, and the emotion model
are designed to compound — a single `add-painting` script (drop image + metadata →
auto-extract palette + compute emotion → append to typed dataset) means every new work
makes the corpus and every chart richer with near-zero marginal effort. The model is a
pure function behind a documented interface, so it can be swapped/improved without touching
the UI.

---

## Part 5 — Phased plan

- **Phase 0 — Scaffold:** Vite/React/TS/Tailwind/shadcn in the new repo & branch; the
  typed schema; `emotion.ts` (pure + tested); the offline palette-extraction script.
- **Phase 1 — Dataset:** assemble ~20–25 works from the research above with verified
  prices (re-check each price against the auction-house lot page before shipping).
- **Phase 2 — Core UI:** gallery + painting detail (palette, emotion, price).
- **Phase 3 — Analysis:** emotion circumplex + price explorer.
- **Phase 4 — Insight & polish:** design studio + methodology page + an artifact-design
  pass for a gallery-grade feel.

### Recommended decisions (open to override)
- **Project name:** `rothko-lab` (clear, on-theme).
- **Location:** `wondopamine/wondo-playground`, branch `claude/rothko-analysis-app-ij8yaa`.
- **Images:** palette-first + museum links (copyright-safe).
- **Verification:** prices/record came from search snippets (WebFetch was blocked on
  museum/auction domains); confidence flags are carried through, and I'll re-verify each
  price against its lot page during Phase 1.

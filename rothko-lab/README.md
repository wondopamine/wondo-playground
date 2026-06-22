# Rothko Lab

An interactive analysis of Mark Rothko's color — what it's made of, what it makes
people feel, and what the market paid — ending in design-ready palettes.

It keeps three layers **deliberately separate**, because conflating them is the usual
mistake:

| Layer | What it is | How it's produced |
|---|---|---|
| **Measured** | Objective color facts | Palette features in CIELAB/LCh — lightness, chroma, warm ratio, value/hue contrast |
| **Felt** | Emotion | A *computed* valence/arousal (color science) shown next to *documented* curated readings |
| **Valued** | Money | Real auction/private sale prices, flagged by type and confidence |

The point of the app is to let those three layers **agree and disagree in public**.

## The screens

- **Gallery** — the corpus (20 works, every period), filter and sort.
- **Painting detail** — the measured / felt / valued breakdown for one work, with sources.
- **Emotion map** — every work on Russell's valence × arousal circumplex.
- **Price explorer** — sale price vs a color feature, with live Pearson *r* and per-cm² normalization.
- **Design studio** — pick a target emotion → an inverse color model returns a Rothko-style palette → export CSS / Tailwind tokens.
- **Methodology** — the full model, citations, and caveats.

## The emotion model

Computed emotion is a documented **adaptation of Valdez & Mehrabian (1994)**:

```
valence(pleasure) =  0.69·B + 0.22·S
arousal           = -0.31·B + 0.60·S
dominance         = -0.76·B + 0.32·S
```

where B (brightness) and S (saturation) come from perceptual lightness L\* and chroma C\*,
centered and normalized. A small red-weighted hue term (Wilms & Oberfeld 2018) nudges
arousal, and palette contrast gives a modest arousal boost. The lightness-led weighting is
backed by Schloss et al. (2016) and Jonauskaite et al. (2020). See `src/lib/emotion.ts` and
the in-app Methodology page for the reasoning and the inverse model used by the studio.

**It never asserts "dark = sad."** Rothko and MoMA both reject that; the computed score sits
beside a sourced human reading, and they're allowed to differ.

## Tech

Vite + React 19 + TypeScript, Tailwind v4, shadcn/ui (vendored in `src/components/ui/`),
[culori](https://culorijs.org/) for color science, Recharts for plots. No backend — a
static SPA over a typed dataset.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests on the color/emotion model
npm run build    # strict tsc + production build
npm run lint
```

Requires Node 18+ (built on Node 22).

## Adding paintings (the corpus compounds)

Palettes in the seed data are **curated** — hand-sampled from documented color descriptions,
because Rothko's works are copyrighted and their images are hotlink-blocked. To add a work
from an image you have the right to analyze:

```bash
npm run extract -- path/to/painting.jpg 5    # k = number of swatches
```

This runs k-means in CIELAB and prints a `palette` / `features` / `computedEmotion` block in
the exact shape used by `src/data/paintings.ts`. Paste it in (or hand-author a `palette` of
`[hex, proportion]` pairs) and every chart updates automatically.

## Data honesty

- **Prices** are headline figures (with buyer's premium) tagged `auction`/`private` and
  `confirmed`/`rumored`. Private-sale figures (notably *No. 6, Violet, Green and Red*) are
  press-derived estimates, not disclosed — flagged as rumored throughout.
- **Correlations are exploratory.** With ~13 priced works and confounders like size, period,
  and provenance, the price views show tendencies, not predictions. The warm/red premium is
  real in the literature but not a law — the current public record is a dark green-and-black work.
- **From a photograph**, only edge softness, color bleed, and relative luminosity are reliably
  readable; layer count, binder, and true (un-faded) color are not.

## License

Personal/educational project. Rothko artwork images and titles remain © the Rothko estate /
ARS; this repository redistributes none of them — it links to museum/auction pages and renders
generated palette abstractions.

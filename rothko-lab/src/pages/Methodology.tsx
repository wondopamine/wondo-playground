function Cite({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="text-accent underline-offset-4 hover:underline">
      {children}
    </a>
  )
}

export function Methodology() {
  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-4xl leading-tight tracking-tight">Methodology &amp; caveats</h1>
      <p className="mt-3 text-muted-foreground">
        This project keeps three layers deliberately separate — what’s <em>measured</em> from the color, what’s
        <em> felt</em> (computed and documented), and what was <em>paid</em>. Conflating them is the mistake it’s
        designed to avoid. Here’s exactly how each is produced, and where to distrust it.
      </p>

      <section className="mt-8 space-y-3">
        <h2 className="font-serif text-2xl">The emotion model</h2>
        <p className="text-sm text-muted-foreground">
          Computed emotion is an adaptation of{' '}
          <Cite href="https://www.semanticscholar.org/paper/Effects-of-color-on-emotions.-Valdez-Mehrabian/d15bdf485f3a64abb59e4d0d1d1b18a9fc652bf9">
            Valdez &amp; Mehrabian (1994)
          </Cite>
          , whose standardized regressions give pleasure = 0.69·B + 0.22·S, arousal = −0.31·B + 0.60·S, and
          dominance = −0.76·B + 0.32·S, where B is brightness and S is saturation. We map pleasure → valence and feed
          perceptual lightness (L*) and chroma (C*) from CIELCh, centered and normalized to ~[−1, 1]. This preserves the
          validated <em>directions and weights</em> — brightness dominates valence, saturation dominates arousal — but
          the absolute numbers are an adaptation, not a literal reproduction of their scale.
        </p>
        <p className="text-sm text-muted-foreground">
          That lightness/chroma emphasis is well supported:{' '}
          <Cite href="https://jov.arvojournals.org/article.aspx?articleid=2550607">Schloss et al. (2016)</Cite> found
          ~82% of “happiness” variance is lightness; <Cite href="https://journals.sagepub.com/doi/10.1177/0956797620948810">Jonauskaite et al. (2020)</Cite>{' '}
          (≈4,600 people, 30 nations) found the light = positive / dark = negative signal is the most cross-culturally
          robust, while specific hue→emotion links are weaker and culture-bound. So hue enters only as a small arousal
          term (red &gt; blue), per <Cite href="https://link.springer.com/article/10.1007/s00426-017-0880-8">Wilms &amp; Oberfeld (2018)</Cite>.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="font-serif text-2xl">Why we don’t say “dark = sad”</h2>
        <p className="text-sm text-muted-foreground">
          Rothko rejected formalist readings of his color — “I’m interested only in expressing basic human emotions:
          tragedy, ecstasy, doom” (to Selden Rodman, 1956). And{' '}
          <Cite href="https://www.moma.org/magazine/articles/829">MoMA explicitly warns</Cite> against reading the dark
          paintings as depression and the bright ones as joy: he painted luminous works at the very end and dark ones
          early. So the computed map is never the last word — each work also carries a <em>documented</em> human reading,
          and the two are allowed to disagree.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="font-serif text-2xl">Palettes</h2>
        <p className="text-sm text-muted-foreground">
          Palettes here are <em>curated</em> — hand-sampled from documented color descriptions in museum and auction
          sources — because Rothko’s works are under copyright and their images are hotlink-blocked, so we don’t
          extract from pixels in-app. The repo ships an offline k-means extractor (<code className="font-mono">npm run extract</code>)
          that produces identical data from a local image you have the right to analyze. Only edge softness, color
          bleed, and relative luminosity are reliably readable from a photograph anyway; layer count, binder, and true
          (un-faded) color are not.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="font-serif text-2xl">Prices</h2>
        <p className="text-sm text-muted-foreground">
          Figures are headline prices (with buyer’s premium) from auction houses and reputable art-market reporting,
          tagged by type (auction vs private) and confidence (confirmed vs rumored). Private-sale figures — notably{' '}
          <em>No. 6 (Violet, Green and Red)</em> — are press-derived estimates, not disclosed by the houses, and are
          flagged as rumored throughout. The warm/red premium is supported by market commentary and hedonic studies
          (e.g. <Cite href="https://link.springer.com/article/10.1007/s00181-017-1413-4">Pownall &amp; Stephen 2017</Cite>),
          but it’s a tendency, not a rule: the current public record is a dark green-and-black work. With n ≈ 13 priced
          pieces and confounders like size, period and provenance, the price views are exploratory, not predictive.
        </p>
      </section>

      <p className="mt-10 text-xs text-muted-foreground">
        Research compiled June 2026 from museum (MoMA, Tate, NGA, SFMOMA, Guggenheim, Buffalo AKG), auction
        (Christie’s, Sotheby’s) and reporting (ARTnews, Artnet, Artforum) sources, plus peer-reviewed color-psychology
        literature. Per-work citations appear on each painting’s page.
      </p>
    </div>
  )
}

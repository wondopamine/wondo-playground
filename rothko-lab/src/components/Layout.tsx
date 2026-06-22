import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/', label: 'Gallery', end: true },
  { to: '/emotion', label: 'Emotion map' },
  { to: '/prices', label: 'Price explorer' },
  { to: '/studio', label: 'Design studio' },
  { to: '/methodology', label: 'Methodology' },
]

export function Layout() {
  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-3">
          <NavLink to="/" className="flex items-baseline gap-2">
            <span className="font-serif text-lg tracking-tight">Rothko Lab</span>
            <span className="hidden text-xs text-muted-foreground sm:inline">color · emotion · price</span>
          </NavLink>
          <nav className="ml-auto flex flex-wrap items-center gap-1 text-sm">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-1.5 transition-colors hover:text-foreground',
                    isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground',
                  )
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-6xl px-5 py-10 text-xs text-muted-foreground">
        Computed emotion is an adaptation of Valdez &amp; Mehrabian (1994); curated readings are sourced per work.
        Palettes are hand-sampled from documented descriptions. See Methodology for caveats.
      </footer>
    </div>
  )
}

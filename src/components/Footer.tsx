import * as React from 'react'
import { Link } from 'react-router-dom'
import { Instagram, Twitter, Youtube } from 'lucide-react'
import { FetchBackendServices } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useShop } from '@/context/ShopContext'

export function Footer() {
  const { showToast } = useShop()
  const [email, setEmail] = React.useState('')
  const [busy, setBusy] = React.useState(false)

  async function onSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || busy) return
    setBusy(true)
    try {
      const res = await FetchBackendServices.subscribeNewsletter(email.trim(), 'footer')
      showToast(res.message)
      setEmail('')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not subscribe')
    } finally {
      setBusy(false)
    }
  }

  return (
    <footer className="relative border-t border-border/70 bg-[#0a0908]">
      <div className="page-shell grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-4">
          <p className="text-display text-3xl tracking-wide">ECommerce</p>
          <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-muted-foreground">
            Liquid glass, liquid light. A house of tailored essentials, fine knits and silk —
            made in small runs, kept for years.
          </p>
          <form onSubmit={onSubscribe} className="mt-7 flex max-w-sm gap-2">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email for the private list"
              aria-label="Email address"
              className="h-11"
            />
            <Button type="submit" size="md" disabled={busy} className="shrink-0">
              {busy ? '…' : 'Join'}
            </Button>
          </form>
          <div className="mt-6 flex gap-2">
            {[Instagram, Twitter, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <h3 className="font-sans text-[11px] font-semibold tracking-[0.24em] text-primary uppercase">
            Shop
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            {[
              { to: '/shop', label: 'All pieces' },
              { to: '/shop?isNew=true', label: 'New arrivals' },
              { to: '/shop?gender=women', label: 'Women' },
              { to: '/shop?gender=men', label: 'Men' },
              { to: '/shop?category=accessories', label: 'Accessories' },
            ].map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="transition-colors hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h3 className="font-sans text-[11px] font-semibold tracking-[0.24em] text-primary uppercase">
            The House
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>
              <Link to="/#story" className="transition-colors hover:text-foreground">
                Our story
              </Link>
            </li>
            <li>
              <Link to="/#values" className="transition-colors hover:text-foreground">
                Craft &amp; values
              </Link>
            </li>
            <li>
              <Link to="/#membership" className="transition-colors hover:text-foreground">
                Membership
              </Link>
            </li>
            <li>
              <Link to="/shop?collection=atelier-classics" className="transition-colors hover:text-foreground">
                Atelier classics
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <h3 className="font-sans text-[11px] font-semibold tracking-[0.24em] text-primary uppercase">
            Client care
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>concierge@ecommerce.maison</li>
            <li>+1 (212) 555-0148</li>
            <li>Mon–Sat, 10:00–19:00 EST</li>
            <li>14 Mercer Street, New York</li>
          </ul>
          <p className="mt-6 text-xs leading-relaxed text-muted-foreground/70">
            Complimentary shipping and returns worldwide. Every order arrives in recycled
            packaging with a hand-written card.
          </p>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="page-shell flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} ECommerce Maison. All rights reserved.</p>
          <p className="tracking-[0.2em] uppercase">Crafted in small runs</p>
        </div>
      </div>
    </footer>
  )
}

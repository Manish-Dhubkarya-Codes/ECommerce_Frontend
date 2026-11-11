import * as React from 'react'
import { Heart, Menu, Search, ShoppingBag } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useShop } from '@/context/ShopContext'
import { cn } from '@/lib/utils'

const links = [
  { to: '/shop', label: 'Shop' },
  { to: '/shop?gender=women', label: 'Women' },
  { to: '/shop?gender=men', label: 'Men' },
  { to: '/shop?collection=noir-etude', label: 'Collections' },
  { to: '/#story', label: 'The House' },
]

export function Navbar() {
  const { openDrawer, cartCount, wishlist, cartPulse } = useShop()
  const [scrolled, setScrolled] = React.useState(false)
  const location = useLocation()
  const pulseKey = cartPulse

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  React.useEffect(() => {
    openDrawer(null)
  }, [location.pathname, location.search, openDrawer])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        scrolled
          ? 'glass-strong shadow-[0_10px_40px_-24px_rgba(0,0,0,0.8)]'
          : 'bg-transparent border-b border-transparent',
      )}
    >
      <div className="page-shell flex h-16 items-center justify-between gap-4 md:h-[72px]">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => openDrawer('menu')}
            className="grid size-10 place-items-center rounded-full text-foreground/80 transition-colors hover:bg-white/10 hover:text-primary md:hidden"
          >
            <Menu className="size-5" />
          </button>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {links.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-3.5 py-2 font-sans text-[12px] font-medium tracking-[0.14em] uppercase transition-colors',
                    isActive && location.search === ''
                      ? 'text-primary'
                      : 'text-foreground/70 hover:text-foreground',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <Link
          to="/"
          className="absolute left-1/2 -translate-x-1/2 text-center"
          aria-label="ECommerce home"
        >
          <span className="text-display text-[26px] leading-none tracking-[0.04em] text-foreground md:text-[30px]">
            ECommerce
          </span>
          <span className="mt-0.5 hidden font-sans text-[9px] tracking-[0.42em] text-primary/80 uppercase md:block">
            Maison
          </span>
        </Link>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            aria-label="Search"
            onClick={() => openDrawer('search')}
            className="grid size-10 place-items-center rounded-full text-foreground/80 transition-colors hover:bg-white/10 hover:text-primary"
          >
            <Search className="size-[18px]" />
          </button>
          <button
            type="button"
            aria-label={`Wishlist, ${wishlist.length} items`}
            onClick={() => openDrawer('wishlist')}
            className="relative grid size-10 place-items-center rounded-full text-foreground/80 transition-colors hover:bg-white/10 hover:text-primary"
          >
            <Heart className="size-[18px]" />
            {wishlist.length > 0 && (
              <span className="absolute right-1 top-1.5 grid size-4 place-items-center rounded-full bg-primary font-sans text-[9px] font-semibold text-primary-foreground">
                {wishlist.length}
              </span>
            )}
          </button>
          <button
            type="button"
            aria-label={`Shopping bag, ${cartCount} items`}
            onClick={() => openDrawer('cart')}
            className="relative grid size-10 place-items-center rounded-full text-foreground/80 transition-colors hover:bg-white/10 hover:text-primary"
          >
            <span
              key={`bag-${pulseKey}`}
              id="nav-cart-target"
              className={cn('grid place-items-center', pulseKey > 0 && 'cart-bag-shake')}
            >
              <ShoppingBag className="size-[18px]" />
            </span>
            {cartCount > 0 && (
              <span
                key={`count-${cartPulse}-${cartCount}`}
                aria-live="polite"
                className="cart-badge-pop absolute right-1 top-1.5 grid size-4 place-items-center rounded-full bg-primary font-sans text-[9px] font-semibold text-primary-foreground shadow-[0_0_10px_rgba(200,169,106,0.55)]"
              >
                {cartCount}
              </span>
            )}
            {/* impact ring host */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full opacity-0"
            />
          </button>
        </div>
      </div>
    </header>
  )
}

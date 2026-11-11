import * as React from 'react'
import { Heart, Minus, Plus, Search, Trash2, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useShop } from '@/context/ShopContext'
import { formatPrice, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function Panel({
  open,
  onClose,
  title,
  side = 'right',
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  side?: 'right' | 'left'
  children: React.ReactNode
}) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    ref.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <div
      className={cn('fixed inset-0 z-[70]', open ? '' : 'pointer-events-none')}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-black/60 backdrop-blur-[3px] transition-opacity duration-400',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'absolute inset-y-0 flex w-full max-w-[420px] flex-col bg-[#111009] shadow-2xl outline-none transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]',
          side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
          open
            ? 'translate-x-0'
            : side === 'right'
              ? 'translate-x-full'
              : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="font-sans text-xs font-semibold tracking-[0.26em] uppercase">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  )
}

function CartPanel() {
  const { cart, drawer, closeDrawer, setQuantity, removeFromCart, cartSubtotal, cartPulse } =
    useShop()
  const navigate = useNavigate()
  const bumpKey = cartPulse

  return (
    <Panel open={drawer === 'cart'} onClose={closeDrawer} title={`Your bag (${cart.length})`}>
      {cart.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
          <p className="text-display text-2xl">Your bag is empty</p>
          <p className="text-sm text-muted-foreground">The rail is waiting.</p>
          <Button
            onClick={() => {
              closeDrawer()
              navigate('/shop')
            }}
          >
            Browse the collection
          </Button>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <ul className="flex-1 divide-y divide-border/70 px-6">
            {cart.map((line) => (
              <li key={line.key} className="cart-line-in flex gap-4 py-5">
                <Link
                  to={`/product/${line.product.slug}`}
                  onClick={closeDrawer}
                  className="size-20 shrink-0 overflow-hidden rounded-lg bg-white/5"
                >
                  {line.product.images[0] && (
                    <img
                      src={line.product.images[0].url}
                      alt={line.product.images[0].alt}
                      className="size-full object-cover"
                      loading="lazy"
                    />
                  )}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link
                    to={`/product/${line.product.slug}`}
                    onClick={closeDrawer}
                    className="truncate font-sans text-sm font-medium hover:text-primary"
                  >
                    {line.product.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Size {line.size}
                    {line.product.color_name ? ` · ${line.product.color_name}` : ''}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1 rounded-full border border-border">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setQuantity(line.key, line.quantity - 1)}
                        className="grid size-7 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span
                        key={`${line.key}-${line.quantity}-${bumpKey}`}
                        className="qty-bump w-5 text-center text-xs"
                      >
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => setQuantity(line.key, line.quantity + 1)}
                        className="grid size-7 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        {formatPrice(Number(line.product.price) * line.quantity)}
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove ${line.product.name}`}
                        onClick={() => removeFromCart(line.key)}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-border px-6 py-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-base font-medium">{formatPrice(cartSubtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Shipping and duties calculated at checkout.
            </p>
            <Button
              className="mt-4 w-full"
              onClick={() => {
                closeDrawer()
                navigate('/checkout')
              }}
            >
              Proceed to checkout
            </Button>
            <Button
              variant="ghost"
              className="mt-2 w-full text-muted-foreground"
              onClick={closeDrawer}
            >
              Continue shopping
            </Button>
          </div>
        </div>
      )}
    </Panel>
  )
}

function WishlistPanel() {
  const { wishlist, drawer, closeDrawer, toggleWishlist, addToCart } = useShop()
  const navigate = useNavigate()

  return (
    <Panel open={drawer === 'wishlist'} onClose={closeDrawer} title={`Wishlist (${wishlist.length})`}>
      {wishlist.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
          <Heart className="size-8 text-primary/60" />
          <p className="text-display text-2xl">Nothing saved yet</p>
          <p className="text-sm text-muted-foreground">Tap the heart on any piece to keep it.</p>
          <Button
            onClick={() => {
              closeDrawer()
              navigate('/shop')
            }}
          >
            Find something to love
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-border/70 px-6">
          {wishlist.map((product) => (
            <li key={product.id} className="cart-line-in flex gap-4 py-5">
              <Link
                to={`/product/${product.slug}`}
                onClick={closeDrawer}
                className="size-20 shrink-0 overflow-hidden rounded-lg bg-white/5"
              >
                {product.images[0] && (
                  <img
                    src={product.images[0].url}
                    alt={product.images[0].alt}
                    className="size-full object-cover"
                    loading="lazy"
                  />
                )}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <Link
                  to={`/product/${product.slug}`}
                  onClick={closeDrawer}
                  className="truncate font-sans text-sm font-medium hover:text-primary"
                >
                  {product.name}
                </Link>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {product.color_name || product.category_name || ''}
                </p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="text-sm font-medium">{formatPrice(product.price)}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        const size =
                          product.sizes.find((s) => s.available)?.size || 'One Size'
                        const img = e.currentTarget
                          .closest('li')
                          ?.querySelector('img')
                          ?.getBoundingClientRect()
                        addToCart(product, size, 1, img)
                      }}
                    >
                      Add
                    </Button>
                    <button
                      type="button"
                      aria-label={`Remove ${product.name}`}
                      onClick={(e) => toggleWishlist(product, { x: e.clientX, y: e.clientY })}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

function SearchPanel() {
  const { drawer, closeDrawer } = useShop()
  const navigate = useNavigate()
  const [query, setQuery] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (drawer === 'search') {
      const t = setTimeout(() => inputRef.current?.focus(), 250)
      return () => clearTimeout(t)
    }
  }, [drawer])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    closeDrawer()
    navigate(`/shop?search=${encodeURIComponent(q)}`)
  }

  const suggestions = ['Overcoat', 'Silk', 'Cashmere', 'Trench', 'Denim', 'Hoodie']

  return (
    <Panel open={drawer === 'search'} onClose={closeDrawer} title="Search">
      <div className="px-6 py-6">
        <form onSubmit={submit}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef as never}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search coats, silk, knitwear…"
              className="h-12 pl-12"
              aria-label="Search products"
            />
          </div>
        </form>
        <p className="mt-6 font-sans text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
          Popular now
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                closeDrawer()
                navigate(`/shop?search=${encodeURIComponent(s)}`)
              }}
              className="rounded-full border border-border px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </Panel>
  )
}

function MenuPanel() {
  const { drawer, closeDrawer } = useShop()

  const items = [
    { label: 'New arrivals', to: '/shop?isNew=true' },
    { label: 'All pieces', to: '/shop' },
    { label: 'Women', to: '/shop?gender=women' },
    { label: 'Men', to: '/shop?gender=men' },
    { label: 'Collections', to: '/shop?collection=noir-etude' },
    { label: 'The House', to: '/#story' },
    { label: 'Membership', to: '/#membership' },
  ]

  return (
    <Panel open={drawer === 'menu'} onClose={closeDrawer} title="Menu" side="left">
      <nav className="flex flex-col gap-1 px-6 py-8">
        {items.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            onClick={closeDrawer}
            className="text-display rounded-lg px-2 py-3 text-2xl transition-colors hover:bg-white/5 hover:text-primary"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </Panel>
  )
}

export function Drawers() {
  return (
    <>
      <CartPanel />
      <WishlistPanel />
      <SearchPanel />
      <MenuPanel />
    </>
  )
}

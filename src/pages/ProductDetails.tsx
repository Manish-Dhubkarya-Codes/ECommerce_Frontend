import * as React from 'react'
import { Check, ChevronRight, Heart, Minus, Plus, Share2, Truck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { FetchBackendServices } from '@/lib/api'
import type { Product } from '@/types'
import { formatPrice, cn } from '@/lib/utils'
import { useShop } from '@/context/ShopContext'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const { addToCart, toggleWishlist, isWished, showToast, openQuickView } = useShop()

  const [product, setProduct] = React.useState<Product | null>(null)
  const [related, setRelated] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [activeImage, setActiveImage] = React.useState(0)
  const [size, setSize] = React.useState<string | null>(null)
  const [quantity, setQuantity] = React.useState(1)
  const [openDetail, setOpenDetail] = React.useState<string | null>('description')
  const [added, setAdded] = React.useState(false)
  const heroImgRef = React.useRef<HTMLImageElement>(null)

  React.useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)
    setError(null)
    setActiveImage(0)
    setQuantity(1)
    setAdded(false)

    Promise.all([FetchBackendServices.getProduct(slug), FetchBackendServices.getRelated(slug)])
      .then(([item, rel]) => {
        if (cancelled) return
        setProduct(item)
        setRelated(rel)
        setSize(item.sizes.find((s) => s.available)?.size ?? null)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Product not found')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <div className="page-shell grid gap-10 pt-28 sm:pt-32 lg:grid-cols-2">
        <div className="aspect-[4/5] animate-pulse rounded-3xl bg-white/5" />
        <div className="space-y-4">
          <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-white/5" />
          <div className="h-6 w-32 animate-pulse rounded bg-white/5" />
          <div className="h-32 w-full animate-pulse rounded bg-white/5" />
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <section className="page-shell flex min-h-[70vh] flex-col items-center justify-center gap-4 pt-24 text-center">
        <p className="eyebrow">Not found</p>
        <h1 className="text-display text-4xl">{error || 'This piece is not on the rail'}</h1>
        <Link to="/shop">
          <Button>Back to shop</Button>
        </Link>
      </section>
    )
  }

  const wished = isWished(product.id)
  const gallery = product.images.length ? product.images : []
  const price = Number(product.price)
  const compareAt = product.compare_at_price ? Number(product.compare_at_price) : null

  const accordionItems: { id: string; label: string; content: React.ReactNode }[] = [
    {
      id: 'description',
      label: 'Description',
      content: <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>,
    },
    {
      id: 'details',
      label: 'Details & fit',
      content: (
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          {product.details.map((d) => (
            <li key={d} className="flex gap-2">
              <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
              {d}
            </li>
          ))}
          {product.fabric && <li>Fabric: {product.fabric}</li>}
          {product.gender && <li>Fit: {product.gender}</li>}
        </ul>
      ),
    },
    {
      id: 'care',
      label: 'Shipping & care',
      content: (
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="flex gap-2">
            <Truck className="mt-0.5 size-4 shrink-0 text-primary" />
            Complimentary express shipping worldwide. Returns within 30 days.
          </p>
          {product.care && <p>Care: {product.care}</p>}
          <p>Free repairs for life — send it back whenever the seams say so.</p>
        </div>
      ),
    },
  ]

  return (
    <div className="page-shell pb-24 pt-24 sm:pt-28">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 font-sans text-[11px] tracking-[0.14em] text-muted-foreground uppercase"
      >
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="size-3" />
        <Link to="/shop" className="hover:text-primary">
          Shop
        </Link>
        {product.category_name && (
          <>
            <ChevronRight className="size-3" />
            <Link
              to={`/shop?category=${product.category_slug}`}
              className="hover:text-primary"
            >
              {product.category_name}
            </Link>
          </>
        )}
        <ChevronRight className="size-3" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <div className="flex flex-col-reverse gap-4 sm:flex-row">
          {gallery.length > 1 && (
            <div className="flex gap-3 sm:flex-col" role="tablist" aria-label="Product images">
              {gallery.map((image, i) => (
                <button
                  key={image.position}
                  type="button"
                  role="tab"
                  aria-selected={i === activeImage}
                  aria-label={`View image ${i + 1}`}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    'size-16 shrink-0 overflow-hidden rounded-lg border transition-all sm:size-20',
                    i === activeImage
                      ? 'border-primary shadow-[0_0_0_3px_rgba(200,169,106,0.25)]'
                      : 'border-border opacity-65 hover:opacity-100',
                  )}
                >
                  <img src={image.url} alt="" className="size-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
          <div className="relative flex-1 overflow-hidden rounded-3xl bg-[#16140f]">
            {gallery[activeImage] && (
              <img
                key={gallery[activeImage].position}
                ref={heroImgRef}
                src={gallery[activeImage].url}
                alt={gallery[activeImage].alt}
                className="gallery-fade aspect-[4/5] size-full object-cover"
              />
            )}
            <div className="absolute left-4 top-4 flex flex-col gap-1.5">
              {product.is_new && <Badge className="bg-primary/90 text-primary-foreground">New</Badge>}
              {compareAt && compareAt > price && (
                <Badge className="border-white/25 bg-black/50 text-white/90">
                  {Math.round(((compareAt - price) / compareAt) * 100)}% off
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="lg:pt-4">
          {product.collection_name && (
            <Link
              to={`/shop?collection=${product.collection_slug}`}
              className="eyebrow hover:underline"
            >
              {product.collection_name}
            </Link>
          )}
          <h1 className="mt-2 text-balance text-display text-4xl leading-[1.05] sm:text-5xl">
            {product.name}
          </h1>
          {product.subtitle && (
            <p className="mt-2 text-sm text-muted-foreground">{product.subtitle}</p>
          )}

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-2xl font-medium text-primary">
              {formatPrice(product.price, product.currency)}
            </span>
            {compareAt && compareAt > price && (
              <span className="text-base text-muted-foreground line-through">
                {formatPrice(compareAt, product.currency)}
              </span>
            )}
            <span className="text-xs text-muted-foreground">incl. tax</span>
          </div>

          <div className="gold-rule my-6" />

          {/* Colour */}
          {(product.color_name || product.color_hex) && (
            <div className="flex items-center gap-3">
              <span className="font-sans text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                Colour
              </span>
              <span className="flex items-center gap-2 text-sm">
                {product.color_hex && (
                  <span
                    className="size-4 rounded-full border border-white/25"
                    style={{ background: product.color_hex }}
                  />
                )}
                {product.color_name}
              </span>
            </div>
          )}

          {/* Sizes */}
          {product.sizes.length > 0 && (
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <span className="font-sans text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                  Size
                </span>
                <span className="text-xs text-muted-foreground">
                  {size ? `Selected: ${size}` : 'Pick a size'}
                </span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s.size}
                    type="button"
                    disabled={!s.available}
                    onClick={() => setSize(s.size)}
                    className={cn(
                      'min-w-12 rounded-full border px-4 py-2 text-xs transition-all duration-300',
                      size === s.size
                        ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_0_3px_rgba(200,169,106,0.2)] scale-105'
                        : 'border-border hover:border-primary/60 hover:scale-105',
                      !s.available &&
                        'cursor-not-allowed border-border/50 text-muted-foreground/50 line-through',
                    )}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + actions */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <div className="flex h-12 items-center gap-1 rounded-full border border-border px-2">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="grid size-9 place-items-center rounded-full text-muted-foreground hover:text-foreground"
              >
                <Minus className="size-4" />
              </button>
              <span
                key={quantity}
                className="qty-bump w-6 text-center text-sm font-medium"
              >
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                className="grid size-9 place-items-center rounded-full text-muted-foreground hover:text-foreground"
              >
                <Plus className="size-4" />
              </button>
            </div>

            <Button
              className={cn(
                'h-12 flex-1 sm:min-w-52',
                added && 'bg-emerald-600 hover:bg-emerald-600',
              )}
              disabled={
                product.stock <= 0 || (product.sizes.length > 0 && !size) || added
              }
              onClick={() => {
                if (added) return
                setAdded(true)
                addToCart(
                  product,
                  size || 'One Size',
                  quantity,
                  heroImgRef.current?.getBoundingClientRect(),
                )
                window.setTimeout(() => setAdded(false), 1600)
              }}
            >
              {added ? (
                <>
                  <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
                    <path
                      d="M3.5 8.5 L6.5 11.5 L12.5 4.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Added to bag
                </>
              ) : product.stock > 0 ? (
                'Add to bag'
              ) : (
                'Out of stock'
              )}
            </Button>

            <button
              type="button"
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={(e) =>
                toggleWishlist(product, { x: e.clientX, y: e.clientY })
              }
              className={cn(
                'grid size-12 place-items-center rounded-full border transition-colors',
                wished
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50 hover:text-primary',
              )}
            >
              <Heart className={cn('size-5', wished && 'fill-current')} />
            </button>

            <button
              type="button"
              aria-label="Share"
              onClick={() => {
                const url = window.location.href
                if (navigator.share) {
                  navigator.share({ title: product.name, url }).catch(() => undefined)
                } else {
                  navigator.clipboard?.writeText(url)
                  showToast('Link copied to clipboard')
                }
              }}
              className="grid size-12 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              <Share2 className="size-5" />
            </button>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                {product.stock <= 5
                  ? `Only ${product.stock} left in the atelier`
                  : 'In stock — ships within 24 hours'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-destructive" />
                Currently unavailable
              </span>
            )}
          </p>

          {/* Accordions */}
          <div className="mt-8 divide-y divide-border border-y border-border">
            {accordionItems.map((item) => (
              <div key={item.id}>
                <button
                  type="button"
                  onClick={() => setOpenDetail(openDetail === item.id ? null : item.id)}
                  aria-expanded={openDetail === item.id}
                  className="flex w-full items-center justify-between py-4 text-left font-sans text-xs font-semibold tracking-[0.18em] uppercase"
                >
                  {item.label}
                  <Plus
                    className={cn(
                      'size-4 text-muted-foreground transition-transform duration-300',
                      openDetail === item.id && 'rotate-45',
                    )}
                  />
                </button>
                {openDetail === item.id && (
                  <div className="pb-5 animate-in fade-in">{item.content}</div>
                )}
              </div>
            ))}
          </div>

          {product.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/shop?search=${encodeURIComponent(tag)}`}
                  className="rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 border-t border-border/70 pt-14" aria-label="You may also like">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Continue</p>
              <h2 className="mt-2 text-display text-3xl sm:text-4xl">You may also like</h2>
            </div>
            <button
              type="button"
              onClick={() => openQuickView(product)}
              className="hidden pb-1 font-sans text-[11px] tracking-[0.2em] text-primary uppercase sm:block"
            >
              Back to quick view
            </button>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            {related.slice(0, 4).map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

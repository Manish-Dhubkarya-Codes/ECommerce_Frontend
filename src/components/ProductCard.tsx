import * as React from 'react'
import { Eye, Heart, Plus, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Product } from '@/types'
import { formatPrice, cn } from '@/lib/utils'
import { useShop } from '@/context/ShopContext'
import { Badge } from '@/components/ui/badge'

export function ProductCard({
  product,
  className,
  priority = false,
}: {
  product: Product
  className?: string
  priority?: boolean
}) {
  const { isWished, toggleWishlist, openQuickView, addToCart } = useShop()
  const wished = isWished(product.id)
  const primary = product.images[0]
  const secondary = product.images[1]
  const mediaRef = React.useRef<HTMLDivElement>(null)
  const [added, setAdded] = React.useState(false)

  function originFromEvent(e: React.MouseEvent) {
    return { x: e.clientX, y: e.clientY }
  }

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (added) return
    const rect =
      mediaRef.current?.getBoundingClientRect() ??
      (e.currentTarget as HTMLElement).getBoundingClientRect()
    const size = product.sizes.find((s) => s.available)?.size || 'One Size'
    addToCart(product, size, 1, rect)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 900)
  }

  return (
    <article className={cn('group relative flex flex-col', className)}>
      <div ref={mediaRef} className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#16140f]">
        <Link
          to={`/product/${product.slug}`}
          className="absolute inset-0"
          aria-label={product.name}
        >
          {primary && (
            <img
              src={primary.url}
              alt={primary.alt}
              loading={priority ? 'eager' : 'lazy'}
              className="size-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.045]"
            />
          )}
          {secondary && (
            <img
              src={secondary.url}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </Link>

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.is_new && <Badge className="bg-primary/90 text-primary-foreground">New</Badge>}
          {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
            <Badge className="border-white/25 bg-black/50 text-white/90">Sale</Badge>
          )}
          {product.stock <= 3 && product.stock > 0 && (
            <Badge className="border-white/25 bg-black/50 text-white/90">Low stock</Badge>
          )}
        </div>

        <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100 focus-within:opacity-100">
          <button
            type="button"
            aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name}`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleWishlist(product, originFromEvent(e))
            }}
            className={cn(
              'grid size-9 place-items-center rounded-full backdrop-blur-md transition-all duration-300',
              wished
                ? 'scale-105 bg-primary text-primary-foreground shadow-[0_0_16px_rgba(200,169,106,0.55)]'
                : 'bg-black/45 text-white hover:scale-105 hover:bg-black/75',
            )}
          >
            <Heart className={cn('size-4', wished && 'fill-current')} />
          </button>
          <button
            type="button"
            aria-label={`Quick view ${product.name}`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              openQuickView(product)
            }}
            className="grid size-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-black/75"
          >
            <Eye className="size-4" />
          </button>
          <button
            type="button"
            aria-label={`Add ${product.name} to bag`}
            disabled={product.stock <= 0 || added}
            onClick={quickAdd}
            className={cn(
              'grid size-9 place-items-center rounded-full transition-all duration-300',
              added
                ? 'scale-110 bg-emerald-500 text-white shadow-[0_0_18px_rgba(16,185,129,0.55)]'
                : 'bg-primary text-primary-foreground shadow-[0_8px_20px_-8px_rgba(200,169,106,0.9)] hover:scale-110',
              'active:scale-95 disabled:pointer-events-none disabled:opacity-40',
            )}
          >
            {added ? (
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
            ) : product.stock > 0 ? (
              <Plus className="size-4" />
            ) : (
              <ShoppingBag className="size-4" />
            )}
          </button>
        </div>

        <div className="pointer-events-none absolute inset-x-3 bottom-3 translate-y-2 rounded-full bg-black/55 px-3 py-1 text-center text-[10px] tracking-[0.16em] text-white/85 uppercase opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {added ? 'Added to bag' : 'Quick add'}
        </div>
      </div>

      <div className="mt-3.5 flex flex-col gap-1 px-0.5">
        <div className="flex items-start justify-between gap-3">
          <Link
            to={`/product/${product.slug}`}
            className="font-sans text-sm font-medium leading-snug transition-colors hover:text-primary"
          >
            {product.name}
          </Link>
          <span className="shrink-0 text-sm font-medium text-foreground/90">
            {formatPrice(product.price, product.currency)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {[product.subtitle, product.color_name].filter(Boolean).join(' · ')}
        </p>
      </div>
    </article>
  )
}

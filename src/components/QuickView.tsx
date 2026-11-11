import * as React from 'react'
import { X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useShop } from '@/context/ShopContext'
import { formatPrice, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function QuickView() {
  const { quickView, closeQuickView, addToCart, toggleWishlist, isWished } = useShop()
  const navigate = useNavigate()
  const [size, setSize] = React.useState<string | null>(null)
  const [closing, setClosing] = React.useState(false)
  const [added, setAdded] = React.useState(false)
  const imageRef = React.useRef<HTMLImageElement>(null)

  React.useEffect(() => {
    if (quickView) {
      setSize(quickView.sizes.find((s) => s.available)?.size ?? null)
      setClosing(false)
      setAdded(false)
      document.body.style.overflow = 'hidden'
      const onKey = (e: KeyboardEvent) => e.key === 'Escape' && requestClose()
      document.addEventListener('keydown', onKey)
      return () => {
        document.body.style.overflow = ''
        document.removeEventListener('keydown', onKey)
      }
    }
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickView])

  function requestClose() {
    if (closing) return
    setClosing(true)
    window.setTimeout(closeQuickView, 180)
  }

  if (!quickView) return null

  const product = quickView
  const image = product.images[0]

  function handleAdd() {
    if (added || product.stock <= 0) return
    const rect = imageRef.current?.getBoundingClientRect()
    setAdded(true)
    // fly from modal image after a beat so the button state reads
    window.setTimeout(() => {
      requestClose()
      window.setTimeout(() => {
        addToCart(product, size || product.sizes[0]?.size || 'One Size', 1, rect)
      }, 160)
    }, 220)
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-[80] flex items-center justify-center p-4',
        closing && 'pointer-events-none',
      )}
      role="presentation"
    >
      <div
        className={cn(
          'absolute inset-0 bg-black/65 backdrop-blur-[3px] transition-opacity duration-300',
          closing ? 'opacity-0' : 'opacity-100',
        )}
        onClick={requestClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Quick view: ${product.name}`}
        className={cn(
          'relative z-10 grid max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border bg-[#14120e] shadow-2xl',
          'transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:grid-cols-2',
          closing ? 'scale-95 opacity-0 translate-y-3' : 'scale-100 opacity-100 translate-y-0',
        )}
        style={{
          animation: closing ? undefined : 'qv-in 0.4s cubic-bezier(0.22,1,0.36,1) both',
        }}
      >
        <button
          type="button"
          onClick={requestClose}
          aria-label="Close quick view"
          className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-black/70"
        >
          <X className="size-4" />
        </button>

        <div className="relative aspect-[4/5] overflow-hidden bg-[#1a1813] md:aspect-auto md:min-h-[440px]">
          {image && (
            <img
              ref={imageRef}
              src={image.url}
              alt={image.alt}
              className="size-full rounded-l-3xl object-cover md:rounded-l-[1.5rem]"
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent md:rounded-l-[1.5rem]" />
        </div>

        <div className="stagger-in flex flex-col gap-4 p-7">
          <div>
            {product.is_new && <span className="eyebrow">New in</span>}
            <h2 className="mt-1.5 text-display text-3xl leading-tight">{product.name}</h2>
            {product.subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{product.subtitle}</p>
            )}
            <p className="mt-3 text-lg font-medium text-primary">
              {formatPrice(product.price, product.currency)}
              {product.compare_at_price &&
                Number(product.compare_at_price) > Number(product.price) && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground line-through">
                    {formatPrice(product.compare_at_price, product.currency)}
                  </span>
                )}
            </p>
          </div>

          {product.sizes.length > 1 && (
            <div>
              <p className="font-sans text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                Select size
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s.size}
                    type="button"
                    disabled={!s.available}
                    onClick={() => setSize(s.size)}
                    className={cn(
                      'min-w-11 rounded-full border px-3 py-1.5 text-xs transition-all duration-300',
                      size === s.size
                        ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_0_3px_rgba(200,169,106,0.2)] scale-105'
                        : 'border-border text-foreground hover:border-primary/60 hover:scale-105',
                      !s.available && 'cursor-not-allowed opacity-35 line-through',
                    )}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto flex flex-col gap-2">
            <Button
              disabled={product.stock <= 0 || added}
              onClick={handleAdd}
              className={cn('relative overflow-hidden', added && 'bg-emerald-600 hover:bg-emerald-600')}
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
                  Added
                </>
              ) : product.stock > 0 ? (
                'Add to bag'
              ) : (
                'Out of stock'
              )}
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={(e) => toggleWishlist(product, { x: e.clientX, y: e.clientY })}
              >
                {isWished(product.id) ? 'Saved' : 'Save'}
              </Button>
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  requestClose()
                  window.setTimeout(() => navigate(`/product/${product.slug}`), 160)
                }}
              >
                Full details
              </Button>
            </div>
            <Link
              to={`/product/${product.slug}`}
              onClick={requestClose}
              className="text-center text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              View piece
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

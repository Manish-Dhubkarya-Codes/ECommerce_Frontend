import * as React from 'react'
import type { Product } from '@/types'
import { throwToCart } from '@/lib/motion'

export interface CartLine {
  key: string
  product: Product
  size: string
  quantity: number
}

export type DrawerKind = 'cart' | 'wishlist' | 'search' | 'menu' | null
export type QuickViewProduct = Product | null

export type SourceRect = DOMRect | { x: number; y: number; width: number; height: number }

interface ShopState {
  cart: CartLine[]
  wishlist: Product[]
  drawer: DrawerKind
  quickView: QuickViewProduct
  toast: string | null
  cartPulse: number
  addToCart: (product: Product, size: string, quantity?: number, source?: SourceRect | null) => void
  removeFromCart: (key: string) => void
  setQuantity: (key: string, quantity: number) => void
  clearCart: () => void
  toggleWishlist: (product: Product, origin?: { x: number; y: number } | null) => void
  isWished: (productId: number) => boolean
  openDrawer: (drawer: DrawerKind) => void
  closeDrawer: () => void
  openQuickView: (product: Product) => void
  closeQuickView: () => void
  showToast: (message: string) => void
  cartCount: number
  cartSubtotal: number
}

const ShopContext = React.createContext<ShopState | null>(null)

const STORAGE_KEY = 'ecommerce-shop-v1'

interface Persisted {
  cart: CartLine[]
  wishlist: Product[]
}

function loadPersisted(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Persisted
      return { cart: parsed.cart ?? [], wishlist: parsed.wishlist ?? [] }
    }
  } catch {
    /* ignore corrupt storage */
  }
  return { cart: [], wishlist: [] }
}

function heartBurst(x: number, y: number, active: boolean) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const layer = document.createElement('div')
  layer.setAttribute('aria-hidden', 'true')
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:100;'
  document.body.appendChild(layer)
  const wrap = document.createElement('div')
  wrap.style.cssText = `position:absolute;left:${x}px;top:${y}px;`
  layer.appendChild(wrap)

  for (let i = 0; i < 7; i++) {
    const s = document.createElement('span')
    const angle = ((i - 3) * 28 * Math.PI) / 180
    const dist = 48 + (i % 3) * 18
    s.textContent = active ? '♥' : '♡'
    s.style.cssText = `position:absolute;font-size:14px;line-height:1;color:${active ? '#c8a96a' : '#9b958a'};transform:translate(-50%,-50%);text-shadow:0 0 10px ${active ? 'rgba(200,169,106,0.6)' : 'transparent'};`
    wrap.appendChild(s)
    s.animate(
      [
        { transform: 'translate(-50%,-50%) scale(0.4)', opacity: 0 },
        { transform: 'translate(-50%,-50%) scale(1.1)', opacity: 1, offset: 0.2 },
        {
          transform: `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px)) scale(1)`,
          opacity: 0,
        },
      ],
      {
        duration: 750,
        delay: i * 30,
        easing: 'cubic-bezier(0.2,0.8,0.3,1)',
        fill: 'forwards',
      },
    )
  }
  const ring = document.createElement('span')
  ring.style.cssText = `position:absolute;width:12px;height:12px;border:2px solid ${active ? '#c8a96a' : '#9b958a'};border-radius:999px;transform:translate(-50%,-50%);opacity:0;`
  wrap.appendChild(ring)
  ring.animate(
    [
      { transform: 'translate(-50%,-50%) scale(0.5)', opacity: 0.9 },
      { transform: 'translate(-50%,-50%) scale(5)', opacity: 0 },
    ],
    { duration: 650, easing: 'ease-out' },
  )
  window.setTimeout(() => layer.remove(), 1000)
}

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const initial = React.useMemo(loadPersisted, [])
  const [cart, setCart] = React.useState<CartLine[]>(initial.cart)
  const [wishlist, setWishlist] = React.useState<Product[]>(initial.wishlist)
  const [drawer, setDrawer] = React.useState<DrawerKind>(null)
  const [quickView, setQuickView] = React.useState<QuickViewProduct>(null)
  const [toast, setToast] = React.useState<string | null>(null)
  const [cartPulse, setCartPulse] = React.useState(0)
  const toastTimer = React.useRef<number | undefined>(undefined)

  React.useEffect(() => {
    const payload: Persisted = { cart, wishlist }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [cart, wishlist])

  const showToast = React.useCallback((message: string) => {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3200)
  }, [])

  const addToCart = React.useCallback(
    (product: Product, size: string, quantity = 1, source?: SourceRect | null) => {
      // mutate cart first so state is correct even if animation is interrupted
      setCart((prev) => {
        const key = `${product.id}-${size}`
        const existing = prev.find((line) => line.key === key)
        if (existing) {
          return prev.map((line) =>
            line.key === key ? { ...line, quantity: Math.min(20, line.quantity + quantity) } : line,
          )
        }
        return [...prev, { key, product, size, quantity }]
      })

      showToast(`${product.name} added to bag`)

      if (source) {
        // fly lands ~720ms — bump badge as it arrives
        window.setTimeout(() => setCartPulse((n) => n + 1), 700)
        void throwToCart({ rect: source, imageUrl: product.images[0]?.url ?? null })
      } else {
        setCartPulse((n) => n + 1)
      }
    },
    [showToast],
  )

  const removeFromCart = React.useCallback((key: string) => {
    setCart((prev) => prev.filter((line) => line.key !== key))
  }, [])

  const setQuantity = React.useCallback((key: string, quantity: number) => {
    setCart((prev) =>
      quantity <= 0
        ? prev.filter((line) => line.key !== key)
        : prev.map((line) => (line.key === key ? { ...line, quantity } : line)),
    )
  }, [])

  const clearCart = React.useCallback(() => setCart([]), [])

  const toggleWishlist = React.useCallback(
    (product: Product, origin?: { x: number; y: number } | null) => {
      setWishlist((prev) => {
        const exists = prev.some((p) => p.id === product.id)
        if (origin) heartBurst(origin.x, origin.y, !exists)
        showToast(
          exists ? `${product.name} removed from wishlist` : `${product.name} saved to wishlist`,
        )
        return exists ? prev.filter((p) => p.id !== product.id) : [...prev, product]
      })
    },
    [showToast],
  )

  const isWished = React.useCallback(
    (productId: number) => wishlist.some((p) => p.id === productId),
    [wishlist],
  )

  const openDrawer = React.useCallback((kind: DrawerKind) => setDrawer(kind), [])
  const closeDrawer = React.useCallback(() => setDrawer(null), [])
  const openQuickView = React.useCallback((product: Product) => setQuickView(product), [])
  const closeQuickView = React.useCallback(() => setQuickView(null), [])

  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0)
  const cartSubtotal = cart.reduce(
    (sum, line) => sum + Number(line.product.price) * line.quantity,
    0,
  )

  const value = React.useMemo<ShopState>(
    () => ({
      cart,
      wishlist,
      drawer,
      quickView,
      toast,
      cartPulse,
      addToCart,
      removeFromCart,
      setQuantity,
      clearCart,
      toggleWishlist,
      isWished,
      openDrawer,
      closeDrawer,
      openQuickView,
      closeQuickView,
      showToast,
      cartCount,
      cartSubtotal,
    }),
    [
      cart,
      wishlist,
      drawer,
      quickView,
      toast,
      cartPulse,
      addToCart,
      removeFromCart,
      setQuantity,
      clearCart,
      toggleWishlist,
      isWished,
      openDrawer,
      closeDrawer,
      openQuickView,
      closeQuickView,
      showToast,
      cartCount,
      cartSubtotal,
    ],
  )

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop(): ShopState {
  const ctx = React.useContext(ShopContext)
  if (!ctx) throw new Error('useShop must be used within ShopProvider')
  return ctx
}

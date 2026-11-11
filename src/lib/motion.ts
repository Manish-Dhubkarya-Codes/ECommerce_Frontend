/**
 * Premium micro-interactions: Bézier fly-to-cart, burst, cart recoil.
 * Pattern: motion.dev / Effect.Labs — fixed clone + quadratic arc + WAAPI.
 */

export interface ThrowSource {
  rect: DOMRect | { x: number; y: number; width: number; height: number }
  imageUrl?: string | null
}

const CART_SELECTOR = '#nav-cart-target'

function prefersReduced() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function centerOf(rect: DOMRect | { x: number; y: number; width: number; height: number }) {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
    w: rect.width,
    h: rect.height,
  }
}

function cartTarget() {
  const el = document.querySelector<HTMLElement>(CART_SELECTOR)
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, el, rect: r }
}

/** Quadratic Bézier samples → WAAPI keyframes (arc with control point above). */
function arcKeyframes(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  scale0: number,
  scale1: number,
  steps = 28,
) {
  const cx = (x0 + x1) / 2
  const cy = Math.min(y0, y1) - Math.max(70, Math.abs(x1 - x0) * 0.32 + 56)
  const frames: Keyframe[] = []

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const m = 1 - t
    const x = m * m * x0 + 2 * m * t * cx + t * t * x1
    const y = m * m * y0 + 2 * m * t * cy + t * t * y1
    const scale = scale0 + (scale1 - scale0) * (t * t * (3 - 2 * t)) // smoothstep shrink
    const t2 = Math.min(1, t + 0.035)
    const m2 = 1 - t2
    const x2 = m2 * m2 * x0 + 2 * m2 * t2 * cx + t2 * t2 * x1
    const y2 = m2 * m2 * y0 + 2 * m2 * t2 * cy + t2 * t2 * y1
    const angle = Math.atan2(y2 - y, x2 - x) * (180 / Math.PI) * 0.1

    frames.push({
      transform: `translate3d(${x - x0}px, ${y - y0}px, 0) scale(${scale}) rotate(${angle}deg)`,
      opacity: t > 0.9 ? 0 : 1,
      offset: t,
    })
  }
  return frames
}

function burstAt(x: number, y: number, color = '#c8a96a') {
  if (prefersReduced()) return
  const layer = document.createElement('div')
  layer.setAttribute('aria-hidden', 'true')
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:100;'
  document.body.appendChild(layer)

  for (let i = 0; i < 12; i++) {
    const p = document.createElement('span')
    const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.45
    const dist = 26 + Math.random() * 44
    const size = 3 + Math.random() * 4
    p.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;border-radius:999px;background:${color};transform:translate(-50%,-50%);box-shadow:0 0 10px ${color}99;`
    layer.appendChild(p)
    p.animate(
      [
        { transform: 'translate(-50%,-50%) scale(1.2)', opacity: 1 },
        {
          transform: `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px)) scale(0.15)`,
          opacity: 0,
        },
      ],
      {
        duration: 520 + Math.random() * 220,
        easing: 'cubic-bezier(0.15,0.85,0.3,1)',
        fill: 'forwards',
      },
    )
  }
  window.setTimeout(() => layer.remove(), 950)
}

function recoilCart(el: HTMLElement) {
  if (prefersReduced()) return
  el.animate(
    [
      { transform: 'translate(0,0) scale(1) rotate(0deg)' },
      { transform: 'translate(4px,-6px) scale(1.2) rotate(-10deg)', offset: 0.22 },
      { transform: 'translate(-2px,3px) scale(0.92) rotate(5deg)', offset: 0.52 },
      { transform: 'translate(1px,-1px) scale(1.04) rotate(-1deg)', offset: 0.75 },
      { transform: 'translate(0,0) scale(1) rotate(0deg)' },
    ],
    { duration: 560, easing: 'cubic-bezier(0.22,1.35,0.36,1)' },
  )

  const r = el.getBoundingClientRect()
  const ring = document.createElement('span')
  ring.setAttribute('aria-hidden', 'true')
  ring.style.cssText = `position:fixed;left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;width:${r.width}px;height:${r.height}px;border:2px solid #c8a96a;border-radius:999px;transform:translate(-50%,-50%);pointer-events:none;z-index:101;`
  document.body.appendChild(ring)
  ring
    .animate(
      [
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 0.9 },
        { transform: 'translate(-50%,-50%) scale(3.4)', opacity: 0 },
      ],
      { duration: 580, easing: 'cubic-bezier(0.15,0.85,0.3,1)' },
    )
    .finished.then(() => ring.remove())
    .catch(() => ring.remove())
}

function popBadge() {
  const badge = document
    .querySelector<HTMLElement>(CART_SELECTOR)
    ?.parentElement?.querySelector<HTMLElement>('span.bg-primary')
  if (!badge || prefersReduced()) return
  badge.classList.remove('cart-badge-pop')
  void badge.offsetWidth
  badge.classList.add('cart-badge-pop')
}

/**
 * Lift a print of the product, toss it on a real arc into the bag,
 * then recoil the bag and pop the badge.
 */
export async function throwToCart(source: ThrowSource): Promise<void> {
  const from = centerOf(source.rect)
  const target = cartTarget()

  burstAt(from.x, from.y)

  if (!target || prefersReduced()) {
    if (target) recoilCart(target.el)
    popBadge()
    return
  }

  // flight print sized toward the bag (~52px)
  const startW = Math.max(56, Math.min(from.w, 150))
  const startH = Math.max(72, Math.min(from.h, 190))
  const endScale = 52 / startW

  const clone = document.createElement('div')
  clone.setAttribute('aria-hidden', 'true')
  clone.style.cssText = [
    'position:fixed',
    `left:${from.x - startW / 2}px`,
    `top:${from.y - startH / 2}px`,
    `width:${startW}px`,
    `height:${startH}px`,
    'z-index:100',
    'pointer-events:none',
    'border-radius:16px',
    'overflow:hidden',
    'will-change:transform,opacity',
    'transform-origin:center center',
    'box-shadow:0 22px 48px -14px rgba(0,0,0,0.65)',
    'border:1px solid rgba(255,255,255,0.14)',
    'background:#1a1712',
  ].join(';')

  if (source.imageUrl) {
    const img = document.createElement('img')
    img.src = source.imageUrl
    img.alt = ''
    img.draggable = false
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;'
    clone.appendChild(img)
  }

  const sheen = document.createElement('span')
  sheen.style.cssText =
    'position:absolute;inset:0;background:linear-gradient(125deg,transparent 28%,rgba(255,255,255,0.4) 48%,transparent 64%);mix-blend-mode:soft-light;opacity:0;'
  clone.appendChild(sheen)
  void sheen.animate(
    [
      { opacity: 0, transform: 'translateX(-45%)' },
      { opacity: 1, offset: 0.45 },
      { opacity: 0, transform: 'translateX(45%)' },
    ],
    { duration: 720, easing: 'ease-in-out' },
  )

  document.body.appendChild(clone)

  const frames = arcKeyframes(0, 0, target.x - from.x, target.y - from.y, 1, endScale)

  try {
    const anim = clone.animate(frames, {
      duration: 740,
      easing: 'cubic-bezier(0.4, 0.05, 0.2, 1)',
      fill: 'forwards',
    })
    await anim.finished
  } catch {
    /* cancelled mid-flight */
  }

  clone.remove()
  recoilCart(target.el)
  popBadge()
}

export { burstAt, recoilCart, popBadge }

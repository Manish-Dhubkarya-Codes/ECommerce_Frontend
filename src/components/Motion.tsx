import * as React from 'react'

/** Order confirmation gold dust — pure DOM, no React re-render mid-flight. */
export function OrderCelebration({ show }: { show: boolean }) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!show || !ref.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = ref.current
    root.innerHTML = ''

    for (let i = 0; i < 28; i++) {
      const p = document.createElement('span')
      const r1 = Math.abs(Math.sin(i * 12.9898 + 78.233) * 43758.5453) % 1
      const r2 = Math.abs(Math.sin(i * 39.346 + 11.135) * 24634.6345) % 1
      const r3 = Math.abs(Math.sin(i * 7.789 + 3.141) * 15731.743) % 1
      p.className = 'gold-dust'
      p.style.left = '50%'
      p.style.top = '42%'
      p.style.width = `${4 + r1 * 6}px`
      p.style.height = `${4 + r1 * 6}px`
      p.style.animationDelay = `${r3 * 0.35}s`
      p.style.setProperty('--dust-tx', `${(r1 - 0.5) * 90}vw`)
      p.style.setProperty('--dust-ty', `${(r2 - 0.5) * 80}vh`)
      root.appendChild(p)
    }
    return () => {
      root.innerHTML = ''
    }
  }, [show])

  if (!show) return null
  return <div ref={ref} className="pointer-events-none fixed inset-0 z-[95]" aria-hidden="true" />
}

/** Global motion hooks live in ShopContext / lib/motion — placeholder for future layers. */
export function MotionLayer() {
  return null
}

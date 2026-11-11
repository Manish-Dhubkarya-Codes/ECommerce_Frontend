import * as React from 'react'
import { useShop } from '@/context/ShopContext'
import { cn } from '@/lib/utils'

export function Toast() {
  const { toast } = useShop()
  const [visible, setVisible] = React.useState(false)
  const [text, setText] = React.useState('')

  React.useEffect(() => {
    if (toast) {
      setText(toast)
      setVisible(true)
      return
    }
    setVisible(false)
  }, [toast])

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[90] flex justify-center px-4"
    >
      <div
        className={cn(
          'glass-strong pointer-events-auto flex items-center gap-2.5 rounded-full py-3 pr-6 pl-5 text-sm shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]',
          'transition-all duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
          visible
            ? 'translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-4 scale-95 opacity-0',
        )}
      >
        <span className="relative grid size-5 shrink-0 place-items-center">
          <span className="absolute inset-0 rounded-full bg-primary/25" />
          <svg viewBox="0 0 16 16" className="relative size-3 text-primary" aria-hidden="true">
            <path
              d="M3.5 8.5 L6.5 11.5 L12.5 4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="text-foreground">{text}</span>
      </div>
    </div>
  )
}

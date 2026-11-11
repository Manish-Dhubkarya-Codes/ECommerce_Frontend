import * as React from 'react'
import { cn } from '@/lib/utils'

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-primary/35 bg-primary/10 px-2.5 py-0.5',
        'font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-primary',
        className,
      )}
      {...props}
    />
  )
}

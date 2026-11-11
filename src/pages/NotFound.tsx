import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <section className="page-shell flex min-h-[70vh] flex-col items-center justify-center gap-5 pt-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="text-display text-5xl">This rail is empty</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The page you were looking for has been moved, sold out, or never hung here.
      </p>
      <Link to="/">
        <Button>Return to the house</Button>
      </Link>
    </section>
  )
}

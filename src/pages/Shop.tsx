import * as React from 'react'
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { FetchBackendServices } from '@/lib/api'
import type { Category, Paginated, Product, ProductQuery } from '@/types'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const SORT_OPTIONS: { value: NonNullable<ProductQuery['sort']>; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'name_asc', label: 'Name: A–Z' },
]

const GENDERS = [
  { value: '', label: 'All' },
  { value: 'women', label: 'Women' },
  { value: 'men', label: 'Men' },
  { value: 'unisex', label: 'Unisex' },
]

export function ShopPage() {
  const [params, setParams] = useSearchParams()
  const [products, setProducts] = React.useState<Paginated<Product> | null>(null)
  const [categories, setCategories] = React.useState<Category[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchDraft, setSearchDraft] = React.useState(params.get('search') ?? '')
  const [filtersOpen, setFiltersOpen] = React.useState(false)

  const search = params.get('search') ?? ''
  const category = params.get('category') ?? ''
  const gender = params.get('gender') ?? ''
  const collection = params.get('collection') ?? ''
  const isNew = params.get('isNew') === 'true'
  const sort = (params.get('sort') as ProductQuery['sort']) || 'featured'
  const page = Math.max(1, Number(params.get('page')) || 1)

  const patch = React.useCallback(
    (next: Record<string, string | null>) => {
      const merged = new URLSearchParams(params)
      for (const [key, value] of Object.entries(next)) {
        if (value === null || value === '') merged.delete(key)
        else merged.set(key, value)
      }
      if (!('page' in next)) merged.delete('page')
      setParams(merged, { replace: true })
    },
    [params, setParams],
  )

  React.useEffect(() => {
    FetchBackendServices.getCategories()
      .then(setCategories)
      .catch(() => undefined)
  }, [])

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const query: ProductQuery = {
      sort,
      page,
      limit: 12,
    }
    if (search) query.search = search
    if (category) query.category = category
    if (gender) query.gender = gender
    if (collection) query.collection = collection
    if (isNew) query.isNew = true

    FetchBackendServices.getProducts(query)
      .then((result) => {
        if (!cancelled) setProducts(result)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [search, category, gender, collection, isNew, sort, page])

  const title = search
    ? `Results for “${search}”`
    : category
      ? categories.find((c) => c.slug === category)?.name || 'Shop'
      : collection
        ? 'Collection'
        : isNew
          ? 'New arrivals'
          : gender
            ? `${gender.charAt(0).toUpperCase()}${gender.slice(1)}`
            : 'The collection'

  const hasFilters = Boolean(search || category || gender || collection || isNew)
  const totalPages = products?.meta.totalPages ?? 1

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    patch({ search: searchDraft.trim() || null })
  }

  const pageNumbers = React.useMemo(() => {
    const nums: number[] = []
    const start = Math.max(1, Math.min(page - 2, totalPages - 4))
    const end = Math.min(totalPages, start + 4)
    for (let i = start; i <= end; i++) nums.push(i)
    return nums
  }, [page, totalPages])

  return (
    <div className="page-shell pb-24 pt-28 sm:pt-32">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Shop</p>
          <h1 className="mt-2 text-display text-5xl leading-none sm:text-6xl">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {products
              ? `${products.meta.total} ${products.meta.total === 1 ? 'piece' : 'pieces'}`
              : 'Loading the rail…'}
          </p>
        </div>
        <form onSubmit={submitSearch} className="flex w-full max-w-sm gap-2">
          <Input
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder="Search the catalogue…"
            aria-label="Search products"
          />
          <Button type="submit" variant="outline" className="shrink-0">
            Search
          </Button>
        </form>
      </header>

      <div className="mt-8 flex flex-wrap items-center gap-2 border-y border-border/70 py-3">
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 font-sans text-[11px] tracking-[0.16em] uppercase transition-colors hover:border-primary/50 hover:text-primary lg:hidden"
          aria-expanded={filtersOpen}
        >
          <SlidersHorizontal className="size-3.5" />
          Filters
        </button>

        <div className={cn('contents', !filtersOpen && 'max-lg:hidden')}>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Gender">
            {GENDERS.map((g) => (
              <button
                key={g.label}
                type="button"
                onClick={() => patch({ gender: g.value || null })}
                className={cn(
                  'rounded-full px-4 py-1.5 font-sans text-[11px] tracking-[0.14em] uppercase transition-colors',
                  gender === g.value
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
                )}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="mx-1 hidden h-5 w-px bg-border sm:block" />

          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Category">
            <button
              type="button"
              onClick={() => patch({ category: null })}
              className={cn(
                'rounded-full px-4 py-1.5 font-sans text-[11px] tracking-[0.14em] uppercase transition-colors',
                !category
                  ? 'bg-secondary text-foreground'
                  : 'border border-border text-muted-foreground hover:border-primary/50',
              )}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => patch({ category: c.slug })}
                className={cn(
                  'rounded-full px-4 py-1.5 font-sans text-[11px] tracking-[0.14em] uppercase transition-colors',
                  category === c.slug
                    ? 'bg-secondary text-foreground'
                    : 'border border-border text-muted-foreground hover:border-primary/50',
                )}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchDraft('')
                  setParams(new URLSearchParams(), { replace: true })
                }}
                className="inline-flex items-center gap-1 text-[11px] tracking-[0.14em] text-muted-foreground uppercase hover:text-primary"
              >
                <X className="size-3" /> Clear
              </button>
            )}
            <label className="flex items-center gap-2 text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
              Sort
              <select
                value={sort}
                onChange={(e) => patch({ sort: e.target.value })}
                className="rounded-full border border-border bg-transparent px-3 py-1.5 font-sans text-[11px] tracking-normal text-foreground uppercase outline-none focus:border-primary/50"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#16140f]">
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {isNew || collection ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {isNew && (
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/12 px-4 py-1.5 text-[11px] tracking-[0.14em] text-primary uppercase">
              New only
              <button type="button" aria-label="Remove new filter" onClick={() => patch({ isNew: null })}>
                <X className="size-3" />
              </button>
            </span>
          )}
          {collection && (
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/12 px-4 py-1.5 text-[11px] tracking-[0.14em] text-primary uppercase">
              {collection}
              <button
                type="button"
                aria-label="Remove collection filter"
                onClick={() => patch({ collection: null })}
              >
                <X className="size-3" />
              </button>
            </span>
          )}
        </div>
      ) : null}

      {error && (
        <p className="mt-10 rounded-2xl border border-destructive/40 bg-destructive/10 px-5 py-4 text-sm text-destructive-foreground">
          {error}
        </p>
      )}

      {loading ? (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] rounded-2xl bg-white/5" />
              <div className="mt-3 h-4 w-2/3 rounded bg-white/5" />
              <div className="mt-2 h-3 w-1/3 rounded bg-white/5" />
            </div>
          ))}
        </div>
      ) : products && products.items.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="text-display text-3xl">Nothing on this rail</p>
          <p className="text-sm text-muted-foreground">
            Try clearing a filter or searching for something else.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchDraft('')
              setParams(new URLSearchParams(), { replace: true })
            }}
          >
            Reset the shop
          </Button>
        </div>
      ) : (
        <div className="stagger-in mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {products?.items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {products && totalPages > 1 && (
        <nav
          className="mt-14 flex items-center justify-center gap-2"
          aria-label="Pagination"
        >
          <button
            type="button"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => patch({ page: String(page - 1) })}
            className="grid size-10 place-items-center rounded-full border border-border transition-colors hover:border-primary/50 disabled:opacity-35"
          >
            <ChevronLeft className="size-4" />
          </button>
          {pageNumbers.map((n) => (
            <button
              key={n}
              type="button"
              aria-current={n === page ? 'page' : undefined}
              onClick={() => patch({ page: String(n) })}
              className={cn(
                'grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm transition-colors',
                n === page
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
              )}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            aria-label="Next page"
            disabled={page >= totalPages}
            onClick={() => patch({ page: String(page + 1) })}
            className="grid size-10 place-items-center rounded-full border border-border transition-colors hover:border-primary/50 disabled:opacity-35"
          >
            <ChevronRight className="size-4" />
          </button>
        </nav>
      )}

      {products && products.meta.total > 0 && (
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Showing {products.items.length} of {products.meta.total} pieces · complimentary
          worldwide shipping
        </p>
      )}
    </div>
  )
}

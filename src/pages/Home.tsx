import * as React from 'react'
import { ArrowRight, Gem, Leaf, Scissors, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import ClothingRailHero, {
  type RailGarment,
} from '@/components/ui/product-rail-gallery'
import { FetchBackendServices } from '@/lib/api'
import type { HomeData, Product } from '@/types'
import { formatPrice, cn } from '@/lib/utils'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useShop } from '@/context/ShopContext'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2000&q=80'
const STORY_IMAGE =
  'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1400&q=80'
const MEMBERSHIP_IMAGE =
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1800&q=80'

function toRailGarment(product: Product): RailGarment {
  return {
    id: String(product.id),
    name: product.name,
    description: product.subtitle || product.description?.slice(0, 140),
    kind: product.rail_kind ?? undefined,
    color: product.color_hex || undefined,
    trim: product.trim_hex || undefined,
    tag: formatPrice(product.price, product.currency),
    details: [product.fabric, product.color_name, product.care].filter(Boolean) as string[],
  }
}

function SectionHeading({
  eyebrow,
  title,
  copy,
  align = 'center',
}: {
  eyebrow: string
  title: string
  copy?: string
  align?: 'center' | 'left'
}) {
  return (
    <div className={cn('max-w-2xl', align === 'center' ? 'mx-auto text-center' : '')}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-balance text-display text-4xl leading-[1.05] sm:text-5xl">
        {title}
      </h2>
      {copy && (
        <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          {copy}
        </p>
      )}
    </div>
  )
}

function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden">
      <img
        src={HERO_IMAGE}
        alt="Model wearing the house red wool coat"
        className="absolute inset-0 size-full object-cover object-[50%_28%]"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0c0b09] via-[#0c0b09]/35 to-[#0c0b09]/55" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,transparent_35%,rgba(12,11,9,0.55)_100%)]" />

      <div className="page-shell relative z-10 pb-16 pt-32 sm:pb-24">
        <div className="glass max-w-2xl rounded-3xl p-8 sm:p-11">
          <p className="eyebrow">Autumn / Winter 2026</p>
          <h1 className="mt-4 text-balance text-display text-5xl leading-[0.98] sm:text-6xl md:text-7xl">
            Liquid glass,
            <br />
            <em className="font-light text-primary">liquid light.</em>
          </h1>
          <p className="mt-5 max-w-md text-pretty text-sm leading-relaxed text-foreground/75 sm:text-base">
            Tailored coats, fine-gauge knits and sand-washed silk — cut in small runs at the
            atelier, finished by hand, kept for years.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/shop">
              <Button size="lg">
                Shop the collection
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link to="/shop?isNew=true">
              <Button variant="glass" size="lg">
                New arrivals
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
        <span className="font-sans text-[10px] tracking-[0.3em] text-foreground/50 uppercase">
          Scroll
        </span>
        <span className="h-10 w-px bg-gradient-to-b from-primary/80 to-transparent" />
      </div>
    </section>
  )
}

function RailSection({ products }: { products: Product[] }) {
  const { showToast } = useShop()
  if (!products.length) return null
  return (
    <section className="relative overflow-hidden py-20 sm:py-28" aria-label="On the rail">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(200,169,106,0.13),transparent_55%)]" />
      <ClothingRailHero
        items={products.map(toRailGarment)}
        eyebrow="On the rail"
        heading="Pieces in rotation"
        caption="Turn the rail. Every piece hangs the way it does in the atelier."
        autoplay
        hanger="wood"
        labels={{ front: 'Front', back: 'Back', close: 'Close', show: 'Show' }}
        onOpenChange={(index) => {
          if (index !== null) showToast(products[index]?.name ?? '')
        }}
        action={
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full border border-primary/45 px-6 py-2.5 font-sans text-xs font-medium tracking-[0.18em] text-primary uppercase transition-colors hover:bg-primary/10"
          >
            Shop all pieces
            <ArrowRight className="size-3.5" />
          </Link>
        }
      />
    </section>
  )
}

function NewArrivals({ products }: { products: Product[] }) {
  if (!products.length) return null
  return (
    <section className="page-shell py-16 sm:py-24" aria-label="New arrivals">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          align="left"
          eyebrow="Just in"
          title="New arrivals"
          copy="The latest from the workroom — fresh cuts, quiet colours, no noise."
        />
        <Link
          to="/shop?isNew=true"
          className="group inline-flex items-center gap-2 pb-2 font-sans text-xs font-medium tracking-[0.2em] text-primary uppercase"
        >
          View all
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
        {products.slice(0, 8).map((product, i) => (
          <ProductCard key={product.id} product={product} priority={i < 4} />
        ))}
      </div>
    </section>
  )
}

function CategoriesSection({
  categories,
}: {
  categories: HomeData['categories']
}) {
  if (!categories.length) return null
  return (
    <section className="page-shell py-16 sm:py-24" aria-label="Shop by category">
      <SectionHeading
        eyebrow="Wardrobe"
        title="Shop by category"
        copy="Six rails, one standard — everything is meant to be worn hard and often."
      />
      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/shop?category=${category.slug}`}
            className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#16140f]"
          >
            {category.image_url && (
              <img
                src={category.image_url}
                alt={category.name}
                loading="lazy"
                className="size-full object-cover opacity-85 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-center">
              <p className="font-sans text-sm font-medium tracking-wide">{category.name}</p>
              <p className="mt-0.5 text-[11px] text-foreground/60">
                {category.product_count} {category.product_count === 1 ? 'piece' : 'pieces'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function StorySection() {
  return (
    <section id="story" className="relative scroll-mt-24 py-16 sm:py-28" aria-label="Our story">
      <div className="page-shell grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_at_30%_20%,rgba(200,169,106,0.18),transparent_60%)]" />
          <img
            src={STORY_IMAGE}
            alt="Inside the atelier boutique"
            loading="lazy"
            className="aspect-[4/5] w-full rounded-3xl object-cover"
          />
          <div className="glass absolute -bottom-5 right-4 rounded-2xl px-5 py-4 sm:right-8">
            <p className="text-display text-3xl text-primary">Est. 2016</p>
            <p className="font-sans text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
              New York &amp; Florence
            </p>
          </div>
        </div>

        <div>
          <p className="eyebrow">The house</p>
          <h2 className="mt-3 text-balance text-display text-4xl leading-[1.05] sm:text-5xl">
            A quiet room where cloth becomes clothing
          </h2>
          <div className="gold-rule my-6 max-w-40" />
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            ECommerce began with one coat and one question: what would we wear every winter for
            the next twenty years? The answer became the Meridian Overcoat — and the standard
            everything else is cut against.
          </p>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            We work with a handful of mills we visit in person, sew in small runs so nothing is
            rushed, and finish each piece by hand. No seasonal churn, no noise — only cloth that
            earns its place.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              'Small-run production',
              'Traceable mills',
              'Repairs for life',
              'Plastic-free packing',
            ].map((item) => (
              <li
                key={item}
                className="glass flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-medium tracking-wide"
              >
                <span className="size-1.5 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
          <Link to="/shop?collection=atelier-classics" className="mt-8 inline-block">
            <Button variant="outline">
              Explore the classics
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

function FeaturedCollection({
  collection,
}: {
  collection: HomeData['featuredCollection']
}) {
  if (!collection) return null
  return (
    <section className="page-shell py-16 sm:py-24" aria-label="Featured collection">
      <div className="relative overflow-hidden rounded-[2rem] border border-border">
        {collection.image_url && (
          <img
            src={collection.image_url}
            alt={collection.name}
            loading="lazy"
            className="absolute inset-0 size-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0b09]/92 via-[#0c0b09]/65 to-[#0c0b09]/25" />
        <div className="relative z-10 max-w-xl p-9 sm:p-14 lg:p-16">
          <p className="eyebrow">{collection.season || 'Featured'}</p>
          <h2 className="mt-3 text-balance text-display text-4xl leading-[1.05] sm:text-5xl">
            {collection.name}
          </h2>
          {collection.tagline && (
            <p className="mt-3 text-pretty text-base italic text-primary/90 sm:text-lg">
              “{collection.tagline}”
            </p>
          )}
          <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-foreground/75">
            {collection.description}
          </p>
          <Link to={`/shop?collection=${collection.slug}`} className="mt-8 inline-block">
            <Button size="lg">
              Enter the collection
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

const VALUES = [
  {
    icon: Scissors,
    title: 'Cut by hand',
    copy: 'Pattern, chalk and shears before any machine. Each run is small enough to check every seam.',
  },
  {
    icon: Gem,
    title: 'Honest cloth',
    copy: 'Italian wool, Japanese oxford, Grade-A cashmere — named on the label, sourced on sight.',
  },
  {
    icon: Leaf,
    title: 'Made to stay',
    copy: 'Fewer pieces, worn longer. Free repairs for life keep clothing out of the bin.',
  },
  {
    icon: Sparkles,
    title: 'Client care',
    copy: 'A named concierge, worldwide shipping, and returns that never feel like a chore.',
  },
]

function ValuesSection() {
  return (
    <section
      id="values"
      className="relative scroll-mt-24 overflow-hidden border-y border-border/70 py-16 sm:py-24"
      aria-label="Our values"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_120%,rgba(200,169,106,0.12),transparent_55%)]" />
      <div className="page-shell">
        <SectionHeading
          eyebrow="Why us"
          title="Four things we refuse to compromise"
          copy="Standards, not slogans — the reasons people come back to the house."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ icon: Icon, title, copy }) => (
            <article
              key={title}
              className="glass group rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 hover:border-primary/40"
            >
              <span className="grid size-11 place-items-center rounded-full bg-primary/12 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-5 font-sans text-sm font-semibold tracking-wide">{title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function MembershipSection({ memberCount }: { memberCount: number }) {
  const { showToast } = useShop()
  const [email, setEmail] = React.useState('')
  const [firstName, setFirstName] = React.useState('')
  const [busy, setBusy] = React.useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    try {
      const res = await FetchBackendServices.joinMembership({
        email: email.trim(),
        firstName: firstName.trim() || undefined,
        tier: 'premiere',
      })
      showToast(res.message)
      setEmail('')
      setFirstName('')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not join')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section
      id="membership"
      className="relative scroll-mt-24 overflow-hidden py-20 sm:py-28"
      aria-label="Membership"
    >
      <img
        src={MEMBERSHIP_IMAGE}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute inset-0 size-full object-cover object-[50%_35%]"
      />
      <div className="absolute inset-0 bg-[#0c0b09]/78" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,transparent_20%,rgba(12,11,9,0.85)_85%)]" />

      <div className="page-shell relative z-10 flex justify-center">
        <div className="glass-strong w-full max-w-3xl rounded-[2rem] px-7 py-10 text-center sm:px-14 sm:py-14">
          <p className="eyebrow">The inner circle</p>
          <h2 className="mt-3 text-balance text-display text-4xl leading-[1.05] sm:text-5xl">
            Membership, by invitation of your inbox
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground">
            First access to drops, atelier appointments, complimentary alterations and the
            annual private sale. Free, always.{' '}
            <span className="text-primary">{memberCount} members</span> and counting.
          </p>

          <form
            onSubmit={onSubmit}
            className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row"
          >
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              aria-label="First name"
              className="sm:max-w-[160px]"
            />
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              aria-label="Email address"
              className="flex-1"
            />
            <Button type="submit" disabled={busy} className="shrink-0">
              {busy ? 'Joining…' : 'Become a member'}
            </Button>
          </form>
          <p className="mt-4 text-[11px] text-muted-foreground/80">
            By joining you agree to receive house notes. Leave any time — we make it one click.
          </p>
        </div>
      </div>
    </section>
  )
}

function FeaturedStrip({ products }: { products: Product[] }) {
  if (!products.length) return null
  return (
    <section className="page-shell py-16 sm:py-20" aria-label="Featured pieces">
      <SectionHeading
        eyebrow="Chosen by the atelier"
        title="House signatures"
        copy="The four pieces the team reaches for first — season after season."
      />
      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

function StatsStrip({ stats }: { stats: HomeData['stats'] }) {
  const items = [
    { value: stats.products, label: 'Pieces in the catalogue' },
    { value: stats.categories, label: 'Rails' },
    { value: stats.members, label: 'Members' },
    { value: `${stats.orders}+`, label: 'Orders shipped' },
  ]
  return (
    <section className="border-t border-border/70" aria-label="House numbers">
      <div className="page-shell grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <p className="text-display text-4xl text-primary">{item.value}</p>
            <p className="mt-1 font-sans text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function HomePage() {
  const [data, setData] = React.useState<HomeData | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    FetchBackendServices.getHome()
      .then((home) => {
        if (!cancelled) setData(home)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load')
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <section className="page-shell flex min-h-[70vh] flex-col items-center justify-center gap-4 pt-24 text-center">
        <p className="eyebrow">Connection</p>
        <h1 className="text-display text-4xl">The atelier is offline</h1>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()}>Try again</Button>
      </section>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="text-display text-3xl text-primary/80">ECommerce</span>
          <span className="h-px w-24 animate-pulse bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
      </div>
    )
  }

  return (
    <>
      <Hero />
      <RailSection products={data.rail} />
      <NewArrivals products={data.newArrivals} />
      <CategoriesSection categories={data.categories} />
      <FeaturedCollection collection={data.featuredCollection} />
      <StorySection />
      <FeaturedStrip products={data.featured} />
      <ValuesSection />
      <MembershipSection memberCount={data.stats.members} />
      <StatsStrip stats={data.stats} />
    </>
  )
}

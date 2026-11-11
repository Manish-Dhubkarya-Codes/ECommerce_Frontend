import * as React from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  Package,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { FetchBackendServices } from '@/lib/api'
import type {
  CreateOrderPayload,
  DeliveryMethod,
  Order,
  PaymentDetails,
} from '@/types'
import { formatPrice, cn } from '@/lib/utils'
import { useShop } from '@/context/ShopContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OrderCelebration } from '@/components/Motion'

const STEPS = ['Contact', 'Shipping', 'Payment', 'Review'] as const
type Step = (typeof STEPS)[number]

const DELIVERY_OPTIONS: {
  id: DeliveryMethod
  label: string
  eta: string
  cost: number
  icon: React.ReactNode
}[] = [
  {
    id: 'standard',
    label: 'Standard',
    eta: '5–7 business days',
    cost: 0,
    icon: <Package className="size-4" />,
  },
  {
    id: 'express',
    label: 'Express',
    eta: '2–3 business days',
    cost: 18,
    icon: <Truck className="size-4" />,
  },
  {
    id: 'overnight',
    label: 'Overnight',
    eta: 'Next business day',
    cost: 35,
    icon: <Sparkles className="size-4" />,
  },
]

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 19)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block font-sans text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-1.5 block text-xs text-destructive animate-in fade-in slide-in-from-left-1">
          {error}
        </span>
      )}
    </label>
  )
}

export function CheckoutPage() {
  const { cart, cartSubtotal, clearCart, showToast, openDrawer, cartCount } = useShop()
  const navigate = useNavigate()

  const [stepIndex, setStepIndex] = React.useState(0)
  const [direction, setDirection] = React.useState<'forward' | 'back'>('forward')
  const [busy, setBusy] = React.useState(false)
  const [placedOrder, setPlacedOrder] = React.useState<Order | null>(null)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const [contact, setContact] = React.useState({
    email: '',
    fullName: '',
    phone: '',
  })
  const [shipping, setShipping] = React.useState({
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
  })
  const [delivery, setDelivery] = React.useState<DeliveryMethod>('standard')
  const [payment, setPayment] = React.useState<PaymentDetails>({
    nameOnCard: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
  })
  const [promoInput, setPromoInput] = React.useState('')
  const [promo, setPromo] = React.useState<{
    code: string
    discount: number
    shippingCost: number | null
    label: string | null
  } | null>(null)
  const [promoBusy, setPromoBusy] = React.useState(false)

  const step: Step = STEPS[stepIndex]
  const deliveryMeta = DELIVERY_OPTIONS.find((d) => d.id === delivery)!
  const baseShipping = promo?.shippingCost != null ? promo.shippingCost : deliveryMeta.cost
  const discount = promo?.discount ?? 0
  const shippingCost = delivery === 'express' && promo?.code === 'FREESHIP' ? 0 : baseShipping
  const total = Math.max(0, cartSubtotal - discount + shippingCost)

  React.useEffect(() => {
    if (cart.length === 0 && !placedOrder) {
      const t = window.setTimeout(() => navigate('/shop', { replace: true }), 0)
      return () => window.clearTimeout(t)
    }
  }, [cart.length, placedOrder, navigate])

  function validateStep(index: number): boolean {
    const next: Record<string, string> = {}

    if (index === 0) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact.email.trim())) {
        next.email = 'Enter a valid email'
      }
      if (contact.fullName.trim().length < 2) {
        next.fullName = 'Full name is required'
      }
    }

    if (index === 1) {
      if (shipping.address1.trim().length < 4) next.address1 = 'Street address is required'
      if (shipping.city.trim().length < 2) next.city = 'City is required'
      if (shipping.postalCode.trim().length < 3) next.postalCode = 'Postal code is required'
      if (shipping.country.trim().length < 2) next.country = 'Country is required'
    }

    if (index === 2) {
      if (payment.nameOnCard.trim().length < 2) next.nameOnCard = 'Name on card is required'
      const digits = payment.cardNumber.replace(/\D/g, '')
      if (digits.length < 13) next.cardNumber = 'Enter a valid card number'
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(payment.expiry)) next.expiry = 'Use MM/YY'
      if (!/^\d{3,4}$/.test(payment.cvc)) next.cvc = 'CVC is 3–4 digits'
    }

    setErrors(next)
    if (Object.keys(next).length > 0) {
      showToast('Please fix the highlighted fields')
      return false
    }
    return true
  }

  function goNext() {
    if (!validateStep(stepIndex)) return
    setDirection('forward')
    setStepIndex((i) => Math.min(STEPS.length - 1, i + 1))
  }

  function goBack() {
    setDirection('back')
    setStepIndex((i) => Math.max(0, i - 1))
  }

  async function applyPromo() {
    const code = promoInput.trim().toUpperCase()
    if (!code || promoBusy) return
    setPromoBusy(true)
    try {
      const preview = await FetchBackendServices.previewPromo(code, cartSubtotal, delivery)
      setPromo({
        code: preview.code,
        discount: preview.discount,
        shippingCost: preview.shippingCost,
        label: preview.label,
      })
      showToast(preview.message)
    } catch (err) {
      setPromo(null)
      showToast(err instanceof Error ? err.message : 'Promo not valid')
    } finally {
      setPromoBusy(false)
    }
  }

  async function placeOrder() {
    if (busy) return
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) {
      setDirection('back')
      setStepIndex(0)
      return
    }

    setBusy(true)
    try {
      const payload: CreateOrderPayload = {
        email: contact.email.trim().toLowerCase(),
        fullName: contact.fullName.trim(),
        phone: contact.phone.trim() || undefined,
        shippingAddress: {
          fullName: contact.fullName.trim(),
          address1: shipping.address1.trim(),
          address2: shipping.address2.trim() || undefined,
          city: shipping.city.trim(),
          state: shipping.state.trim(),
          postalCode: shipping.postalCode.trim(),
          country: shipping.country.trim(),
        },
        deliveryMethod: delivery,
        payment: {
          nameOnCard: payment.nameOnCard.trim(),
          cardNumber: payment.cardNumber.replace(/\s/g, ''),
          expiry: payment.expiry,
          cvc: payment.cvc,
        },
        items: cart.map((line) => ({
          productId: line.product.id,
          size: line.size,
          quantity: line.quantity,
        })),
        promoCode: promo?.code ?? null,
      }

      const result = await FetchBackendServices.createOrder(payload)
      setPlacedOrder(result.order)
      clearCart()
      showToast(result.message)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not place order')
    } finally {
      setBusy(false)
    }
  }

  if (placedOrder) {
    return <OrderSuccess order={placedOrder} onContinue={() => navigate('/shop')} />
  }

  if (cartCount === 0) {
    return (
      <section className="page-shell flex min-h-[70vh] flex-col items-center justify-center gap-4 pt-24 text-center">
        <p className="eyebrow">Checkout</p>
        <h1 className="text-display text-4xl">Your bag is empty</h1>
        <Link to="/shop">
          <Button>Browse the collection</Button>
        </Link>
      </section>
    )
  }

  return (
    <div className="page-shell pb-24 pt-28 sm:pt-32">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Secure checkout</p>
          <h1 className="mt-2 text-display text-4xl sm:text-5xl">Complete your order</h1>
        </div>
        <button
          type="button"
          onClick={() => openDrawer('cart')}
          className="font-sans text-[11px] tracking-[0.2em] text-primary uppercase hover:underline"
        >
          Edit bag ({cartCount})
        </button>
      </div>

      {/* Stepper */}
      <ol className="mb-10 flex flex-wrap gap-x-6 gap-y-3" aria-label="Checkout progress">
        {STEPS.map((label, i) => {
          const state = i < stepIndex ? 'done' : i === stepIndex ? 'current' : 'todo'
          return (
            <li key={label} className="flex items-center gap-2">
              <span
                className={cn(
                  'grid size-7 place-items-center rounded-full border text-[11px] font-semibold transition-all duration-500',
                  state === 'done' && 'border-primary bg-primary text-primary-foreground',
                  state === 'current' &&
                    'border-primary bg-primary/15 text-primary shadow-[0_0_0_4px_rgba(200,169,106,0.15)]',
                  state === 'todo' && 'border-border text-muted-foreground',
                )}
              >
                {state === 'done' ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  'font-sans text-[11px] tracking-[0.18em] uppercase',
                  state === 'current' ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <span className="ml-4 hidden h-px w-14 bg-border sm:block" aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ol>
      <div className="mb-10 h-1 overflow-hidden rounded-full bg-white/8">
        <div
          className="progress-shine h-full rounded-full bg-gradient-to-r from-primary/70 via-primary to-primary/70 transition-[width] duration-500 ease-out"
          style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <section
          key={step}
          className={cn(
            'rounded-3xl border border-border bg-white/[0.03] p-6 sm:p-8',
            direction === 'forward' ? 'step-enter' : 'step-enter-back',
          )}
        >
          {step === 'Contact' && (
            <div className="stagger-in flex flex-col gap-5">
              <div>
                <h2 className="text-display text-2xl">Contact details</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  We send the receipt and tracking link here.
                </p>
              </div>
              <Field label="Email" error={errors.email}>
                <Input
                  type="email"
                  autoComplete="email"
                  value={contact.email}
                  onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                  placeholder="you@atelier.com"
                  className={errors.email ? 'border-destructive' : ''}
                />
              </Field>
              <Field label="Full name" error={errors.fullName}>
                <Input
                  autoComplete="name"
                  value={contact.fullName}
                  onChange={(e) => setContact((c) => ({ ...c, fullName: e.target.value }))}
                  placeholder="Alex Moreau"
                  className={errors.fullName ? 'border-destructive' : ''}
                />
              </Field>
              <Field label="Phone (optional)">
                <Input
                  type="tel"
                  autoComplete="tel"
                  value={contact.phone}
                  onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                  placeholder="+1 415 555 0134"
                />
              </Field>
            </div>
          )}

          {step === 'Shipping' && (
            <div className="stagger-in flex flex-col gap-5">
              <div>
                <h2 className="text-display text-2xl">Shipping address</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Complimentary returns within 30 days.
                </p>
              </div>
              <Field label="Street address" error={errors.address1}>
                <Input
                  autoComplete="address-line1"
                  value={shipping.address1}
                  onChange={(e) => setShipping((s) => ({ ...s, address1: e.target.value }))}
                  placeholder="12 Mercer Street"
                  className={errors.address1 ? 'border-destructive' : ''}
                />
              </Field>
              <Field label="Apartment, suite (optional)">
                <Input
                  autoComplete="address-line2"
                  value={shipping.address2}
                  onChange={(e) => setShipping((s) => ({ ...s, address2: e.target.value }))}
                  placeholder="Floor 4"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City" error={errors.city}>
                  <Input
                    autoComplete="address-level2"
                    value={shipping.city}
                    onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))}
                    placeholder="New York"
                    className={errors.city ? 'border-destructive' : ''}
                  />
                </Field>
                <Field label="State / region">
                  <Input
                    autoComplete="address-level1"
                    value={shipping.state}
                    onChange={(e) => setShipping((s) => ({ ...s, state: e.target.value }))}
                    placeholder="NY"
                  />
                </Field>
                <Field label="Postal code" error={errors.postalCode}>
                  <Input
                    autoComplete="postal-code"
                    value={shipping.postalCode}
                    onChange={(e) => setShipping((s) => ({ ...s, postalCode: e.target.value }))}
                    placeholder="10013"
                    className={errors.postalCode ? 'border-destructive' : ''}
                  />
                </Field>
                <Field label="Country" error={errors.country}>
                  <Input
                    autoComplete="country-name"
                    value={shipping.country}
                    onChange={(e) => setShipping((s) => ({ ...s, country: e.target.value }))}
                    className={errors.country ? 'border-destructive' : ''}
                  />
                </Field>
              </div>

              <div className="mt-2">
                <p className="mb-3 font-sans text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                  Delivery speed
                </p>
                <div className="grid gap-3">
                  {DELIVERY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setDelivery(opt.id)
                        if (promo?.code === 'FREESHIP' && opt.id !== 'express') {
                          /* keep promo; server recalculates */
                        }
                      }}
                      className={cn(
                        'flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-all duration-300',
                        delivery === opt.id
                          ? 'border-primary bg-primary/10 shadow-[0_0_0_3px_rgba(200,169,106,0.12)]'
                          : 'border-border hover:border-primary/40',
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={cn(
                            'grid size-9 place-items-center rounded-full',
                            delivery === opt.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-white/8 text-muted-foreground',
                          )}
                        >
                          {opt.icon}
                        </span>
                        <span>
                          <span className="block text-sm font-medium">{opt.label}</span>
                          <span className="text-xs text-muted-foreground">{opt.eta}</span>
                        </span>
                      </span>
                      <span className="text-sm font-medium">
                        {opt.cost === 0 ? 'Free' : formatPrice(opt.cost)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'Payment' && (
            <div className="stagger-in flex flex-col gap-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-display text-2xl">Payment</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Demo checkout — card data never leaves this browser.
                  </p>
                </div>
                <span className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                  <Lock className="size-3 text-primary" />
                  SSL
                </span>
              </div>

              <Field label="Name on card" error={errors.nameOnCard}>
                <Input
                  autoComplete="cc-name"
                  value={payment.nameOnCard}
                  onChange={(e) => setPayment((p) => ({ ...p, nameOnCard: e.target.value }))}
                  placeholder="Alex Moreau"
                  className={errors.nameOnCard ? 'border-destructive' : ''}
                />
              </Field>
              <Field label="Card number" error={errors.cardNumber}>
                <Input
                  inputMode="numeric"
                  autoComplete="cc-number"
                  value={payment.cardNumber}
                  onChange={(e) =>
                    setPayment((p) => ({ ...p, cardNumber: formatCardNumber(e.target.value) }))
                  }
                  placeholder="4242 4242 4242 4242"
                  className={cn('font-mono tracking-widest', errors.cardNumber && 'border-destructive')}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Expiry" error={errors.expiry}>
                  <Input
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    value={payment.expiry}
                    onChange={(e) =>
                      setPayment((p) => ({ ...p, expiry: formatExpiry(e.target.value) }))
                    }
                    placeholder="12/28"
                    className={cn('font-mono', errors.expiry && 'border-destructive')}
                  />
                </Field>
                <Field label="CVC" error={errors.cvc}>
                  <Input
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    value={payment.cvc}
                    onChange={(e) =>
                      setPayment((p) => ({
                        ...p,
                        cvc: e.target.value.replace(/\D/g, '').slice(0, 4),
                      }))
                    }
                    placeholder="123"
                    className={cn('font-mono', errors.cvc && 'border-destructive')}
                  />
                </Field>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-white/[0.03] px-4 py-3 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 shrink-0 text-primary" />
                Use any Luhn-valid test number — e.g. 4242 4242 4242 4242.
              </div>
            </div>
          )}

          {step === 'Review' && (
            <div className="stagger-in flex flex-col gap-6">
              <div>
                <h2 className="text-display text-2xl">Review & place order</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  One last look before we cut the label.
                </p>
              </div>

              <div className="space-y-3 rounded-2xl border border-border/70 p-4">
                <ReviewRow label="Contact" value={contact.email} sub={contact.fullName} />
                <ReviewRow
                  label="Ship to"
                  value={`${shipping.address1}${shipping.address2 ? `, ${shipping.address2}` : ''}`}
                  sub={`${shipping.city}, ${shipping.state} ${shipping.postalCode}, ${shipping.country}`}
                />
                <ReviewRow
                  label="Delivery"
                  value={`${deliveryMeta.label} — ${deliveryMeta.eta}`}
                  sub={shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                />
                <ReviewRow
                  label="Payment"
                  value={`•••• ${payment.cardNumber.replace(/\D/g, '').slice(-4) || '••••'}`}
                  sub={payment.nameOnCard}
                />
              </div>

              <ul className="space-y-3">
                {cart.map((line) => (
                  <li key={line.key} className="flex items-center gap-3">
                    <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-white/5">
                      {line.product.images[0] && (
                        <img
                          src={line.product.images[0].url}
                          alt=""
                          className="size-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{line.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Size {line.size} · Qty {line.quantity}
                      </p>
                    </div>
                    <span className="text-sm">
                      {formatPrice(Number(line.product.price) * line.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
            <Button
              variant="ghost"
              onClick={goBack}
              disabled={stepIndex === 0 || busy}
              className={cn(stepIndex === 0 && 'invisible')}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>

            {stepIndex < STEPS.length - 1 ? (
              <Button onClick={goNext}>
                Continue
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button onClick={placeOrder} disabled={busy} className="min-w-48">
                {busy ? (
                  <>
                    <span className="processing-spin size-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                    Processing…
                  </>
                ) : (
                  <>
                    <Lock className="size-4" />
                    Place order · {formatPrice(total)}
                  </>
                )}
              </Button>
            )}
          </div>
        </section>

        {/* Summary */}
        <aside className="h-fit rounded-3xl border border-border bg-white/[0.03] p-6 lg:sticky lg:top-28">
          <h2 className="font-sans text-xs font-semibold tracking-[0.24em] uppercase">
            Order summary
          </h2>

          <ul className="mt-5 space-y-4">
            {cart.map((line) => (
              <li key={line.key} className="flex gap-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-white/5">
                  {line.product.images[0] && (
                    <img
                      src={line.product.images[0].url}
                      alt=""
                      className="size-full object-cover"
                    />
                  )}
                  <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {line.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{line.product.name}</p>
                  <p className="text-xs text-muted-foreground">Size {line.size}</p>
                </div>
                <span className="text-sm text-foreground/90">
                  {formatPrice(Number(line.product.price) * line.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex gap-2">
            <Input
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              placeholder="Promo code"
              aria-label="Promo code"
              className="h-10 flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4"
              onClick={applyPromo}
              disabled={promoBusy || !promoInput.trim()}
            >
              {promoBusy ? '…' : 'Apply'}
            </Button>
          </div>
          {promo && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-primary animate-in fade-in">
              <Check className="size-3.5" />
              {promo.code}
              {promo.label ? ` — ${promo.label}` : ''}
              <button
                type="button"
                className="ml-auto text-muted-foreground underline-offset-2 hover:underline"
                onClick={() => {
                  setPromo(null)
                  setPromoInput('')
                }}
              >
                Remove
              </button>
            </p>
          )}
          <p className="mt-2 text-[11px] text-muted-foreground">
            Try <span className="text-primary">MAISON10</span>,{' '}
            <span className="text-primary">WELCOME</span>, or{' '}
            <span className="text-primary">FREESHIP</span>.
          </p>

          <div className="gold-rule my-5" />

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatPrice(cartSubtotal)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-primary">
                <dt>Discount</dt>
                <dd>−{formatPrice(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-medium">
              <dt>Total</dt>
              <dd className="text-primary">{formatPrice(total)}</dd>
            </div>
          </dl>

          <p className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary" />
            Encrypted demo payment · no real charge
          </p>
        </aside>
      </div>
    </div>
  )
}

function ReviewRow({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">
        <span className="block text-foreground">{value}</span>
        <span className="block text-xs text-muted-foreground">{sub}</span>
      </span>
    </div>
  )
}

function OrderSuccess({ order, onContinue }: { order: Order; onContinue: () => void }) {
  const [celebrate, setCelebrate] = React.useState(true)

  React.useEffect(() => {
    const t = window.setTimeout(() => setCelebrate(false), 2200)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <div className="page-shell flex min-h-[80vh] flex-col items-center justify-center pt-24 text-center">
      <OrderCelebration show={celebrate} />

      <div className="success-ring relative grid size-24 place-items-center rounded-full border border-primary/40 bg-primary/10">
        <svg viewBox="0 0 48 48" className="size-12" aria-hidden="true">
          <path
            d="M12 25.5 L20.5 34 L36 15"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="check-draw text-primary"
          />
        </svg>
        <span className="absolute inset-0 rounded-full ring-4 ring-primary/20" />
      </div>

      <p className="eyebrow mt-8">Order confirmed</p>
      <h1 className="mt-3 text-balance text-display text-4xl sm:text-5xl">
        The atelier has your order
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
        A confirmation is on its way to{' '}
        <span className="text-foreground">{order.email}</span>. We will write when it leaves the
        studio.
      </p>

      <div className="mt-8 w-full max-w-md rounded-3xl border border-border bg-white/[0.03] p-6 text-left stagger-in">
        <div className="flex items-center justify-between">
          <span className="font-sans text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
            Order
          </span>
          <span className="font-mono text-sm text-primary">{order.orderNumber}</span>
        </div>
        <div className="gold-rule my-4" />
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Items</dt>
            <dd>{order.items.reduce((s, i) => s + i.quantity, 0)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Delivery</dt>
            <dd>{order.deliveryLabel}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">ETA</dt>
            <dd>{order.deliveryEta}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-3 font-medium">
            <dt>Total</dt>
            <dd className="text-primary">{formatPrice(order.total, order.currency)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={onContinue}>Continue shopping</Button>
        <Link to="/">
          <Button variant="ghost">Back home</Button>
        </Link>
      </div>
    </div>
  )
}

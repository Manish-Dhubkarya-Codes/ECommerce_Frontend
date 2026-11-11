export interface ProductImage {
  url: string
  alt: string
  position: number
}

export interface ProductSize {
  size: string
  available: boolean
}

export interface Product {
  id: number
  slug: string
  name: string
  subtitle?: string | null
  description?: string | null
  price: string
  compare_at_price?: string | null
  currency: string
  gender: 'men' | 'women' | 'unisex'
  color_name?: string | null
  color_hex?: string | null
  trim_hex?: string | null
  rail_kind?: 'tee' | 'knit' | 'hoodie' | 'shirt' | 'jacket' | 'coat' | null
  fabric?: string | null
  care?: string | null
  images: ProductImage[]
  sizes: ProductSize[]
  details: string[]
  tags: string[]
  is_featured: boolean
  is_new: boolean
  stock: number
  category_slug?: string | null
  category_name?: string | null
  collection_slug?: string | null
  collection_name?: string | null
}

export interface Category {
  id: number
  slug: string
  name: string
  description?: string | null
  image_url?: string | null
  gender: string
  sort_order: number
  product_count: number
}

export interface Collection {
  id: number
  slug: string
  name: string
  tagline?: string | null
  description?: string | null
  image_url?: string | null
  season?: string | null
  is_featured: boolean
  product_count: number
}

export interface Paginated<T> {
  items: T[]
  meta: { total: number; page: number; limit: number; totalPages: number; hasMore: boolean }
}

export interface HomeData {
  newArrivals: Product[]
  featured: Product[]
  rail: Product[]
  categories: Category[]
  featuredCollection: Collection | null
  stats: { products: number; categories: number; orders: number; members: number }
}

export interface ProductQuery {
  search?: string
  category?: string
  collection?: string
  gender?: string
  color?: string
  size?: string
  minPrice?: number | string
  maxPrice?: number | string
  featured?: boolean
  isNew?: boolean
  inStock?: boolean
  sort?: 'featured' | 'newest' | 'price_asc' | 'price_desc' | 'name_asc'
  page?: number
  limit?: number
}

export type DeliveryMethod = 'standard' | 'express' | 'overnight'

export interface ShippingAddress {
  fullName: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface CheckoutItem {
  productId: number
  size: string
  quantity: number
}

export interface PaymentDetails {
  nameOnCard: string
  cardNumber: string
  expiry: string
  cvc: string
}

export interface OrderLine {
  productId: number
  slug: string
  name: string
  size: string
  quantity: number
  price: number
  currency: string
  imageUrl?: string | null
}

export interface Order {
  id: number
  orderNumber: string
  email: string
  fullName: string
  phone?: string | null
  shippingAddress: ShippingAddress & Record<string, unknown>
  deliveryMethod: DeliveryMethod
  deliveryLabel: string
  deliveryEta: string
  subtotal: number
  shippingCost: number
  discount: number
  total: number
  currency: string
  paymentStatus: string
  paymentMethod: string
  status: string
  items: OrderLine[]
  promoCode?: string | null
  createdAt: string
}

export interface CreateOrderPayload {
  email: string
  fullName: string
  phone?: string
  shippingAddress: ShippingAddress
  deliveryMethod: DeliveryMethod
  payment: PaymentDetails
  items: CheckoutItem[]
  promoCode?: string | null
}

export interface CreateOrderResult {
  order: Order
  payment: { brand: string; last4: string; transactionId: string }
  delivery: { method: DeliveryMethod; label: string; eta: string }
  message: string
}

export interface PromoPreview {
  code: string
  discount: number
  shippingCost: number
  label: string | null
  message: string
}

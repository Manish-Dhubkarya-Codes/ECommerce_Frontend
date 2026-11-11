import type {
  Category,
  Collection,
  CreateOrderPayload,
  CreateOrderResult,
  HomeData,
  Order,
  Paginated,
  Product,
  ProductQuery,
  PromoPreview,
} from '@/types'

export const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ||
  'http://localhost:3001/api' || 'https://ecommerce-backend-xcdq.onrender.com'

interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: { total: number; page: number; limit: number; totalPages: number; hasMore: boolean }
  error?: { message: string; details?: unknown }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  })
  const body = (await res.json().catch(() => null)) as ApiResponse<T> | null
  if (!res.ok || !body?.success) {
    const message = body?.error?.message || `Request failed (${res.status})`
    throw new Error(message)
  }
  return body.data
}

function qs(params: Record<string, unknown>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '' || value === false) continue
    search.set(key, String(value))
  }
  const s = search.toString()
  return s ? `?${s}` : ''
}

/** All backend reads and writes for the storefront. */
export const FetchBackendServices = {
  async getHome(): Promise<HomeData> {
    return request<HomeData>('/home')
  },

  async getProducts(query: ProductQuery = {}): Promise<Paginated<Product>> {
    const res = await fetch(`${API_BASE}/products${qs(query as Record<string, unknown>)}`)
    const body = (await res.json()) as ApiResponse<Product[]>
    if (!res.ok || !body.success) {
      throw new Error(body.error?.message || 'Could not load products')
    }
    return { items: body.data, meta: body.meta! }
  },

  async getProduct(slug: string): Promise<Product> {
    return request<Product>(`/products/${encodeURIComponent(slug)}`)
  },

  async getRelated(slug: string): Promise<Product[]> {
    return request<Product[]>(`/products/${encodeURIComponent(slug)}/related`)
  },

  async getRailItems(): Promise<Product[]> {
    return request<Product[]>('/products/rail')
  },

  async getCategories(): Promise<Category[]> {
    return request<Category[]>('/categories')
  },

  async getCollections(): Promise<Collection[]> {
    return request<Collection[]>('/collections')
  },

  async getFeaturedCollection(): Promise<Collection> {
    return request<Collection>('/collections/featured')
  },

  async subscribeNewsletter(email: string, source = 'footer'): Promise<{ message: string }> {
    return request<{ message: string }>('/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email, source }),
    })
  },

  async joinMembership(payload: {
    email: string
    firstName?: string
    lastName?: string
    tier?: string
  }): Promise<{ message: string; alreadyMember: boolean }> {
    return request<{ message: string; alreadyMember: boolean }>('/membership', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async createOrder(payload: CreateOrderPayload): Promise<CreateOrderResult> {
    return request<CreateOrderResult>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async getOrder(orderNumber: string): Promise<{ order: Order }> {
    return request<{ order: Order }>(`/orders/${encodeURIComponent(orderNumber)}`)
  },

  async previewPromo(
    code: string,
    subtotal: number,
    delivery: string,
  ): Promise<PromoPreview> {
    const qs = new URLSearchParams({ code, subtotal: String(subtotal), delivery })
    return request<PromoPreview>(`/orders/promo?${qs.toString()}`)
  },
}

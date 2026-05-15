import axios from 'axios'
import { API_URL } from './url'
import type {
  ProductDto,
  CreateProductPayload,
  UpdateProductPayload,
  CreateProductResponse,
  ProductsPageData,
  ProductsListResponse,
} from '@/src/interface/product'

export type {
  ProductDto,
  CreateProductPayload,
  UpdateProductPayload,
  CreateProductResponse,
  ProductsPageData,
  ProductsListResponse,
}

export const PRODUCT_CATEGORY_LABELS = ['Bắp', 'Đồ uống', 'Combo', 'Khác'] as const
export type ProductCategoryLabel = (typeof PRODUCT_CATEGORY_LABELS)[number]

const API_CATEGORY_TO_LABEL: Record<string, ProductCategoryLabel> = {
  FOOD: 'Bắp',
  DRINK: 'Đồ uống',
  COMBO: 'Combo',
  OTHER: 'Khác',
}

const LABEL_TO_API_CATEGORY: Record<ProductCategoryLabel, string> = {
  Bắp: 'FOOD',
  'Đồ uống': 'DRINK',
  Combo: 'COMBO',
  Khác: 'OTHER',
}

export function displayCategory(api: string): ProductCategoryLabel {
  return API_CATEGORY_TO_LABEL[api] ?? 'Khác'
}

export function toApiCategory(label: ProductCategoryLabel): string {
  return LABEL_TO_API_CATEGORY[label] ?? 'OTHER'
}

const parseProductsPage = (raw: unknown): { products: ProductDto[]; total?: number; limit?: number } => {
  if (!raw || typeof raw !== 'object') return { products: [] }
  const d = raw as ProductsListResponse
  if (!d.success || !d.data) return { products: [] }
  if (Array.isArray(d.data)) return { products: d.data as ProductDto[] }
  const inner = d.data as ProductsPageData
  const products = Array.isArray(inner.products) ? inner.products : []
  const total = typeof inner.total === 'number' ? inner.total : undefined
  const limit = typeof inner.limit === 'number' ? inner.limit : undefined
  return { products, total, limit }
}

/** Một trang: `GET /api/v1/products?page=&limit=` */
export const API_GetProductsPage = async (
  page: number,
  limit: number
): Promise<{ products: ProductDto[]; total?: number; limit?: number }> => {
  const res = await axios.get<ProductsListResponse>(`${API_URL}/api/v1/products`, {
    params: { page, limit },
  })
  return parseProductsPage(res.data)
}

const MAX_PAGES = 500

/**
 * Lấy toàn bộ sản phẩm: gọi API phân trang lặp cho đến khi đủ `total` hoặc hết trang.
 */
export const API_GetProducts = async (pageSize = 100): Promise<ProductDto[]> => {
  const all: ProductDto[] = []
  let page = 1
  let reportedTotal: number | undefined

  for (let i = 0; i < MAX_PAGES; i++) {
    const { products, total, limit: serverLimit } = await API_GetProductsPage(page, pageSize)
    if (total !== undefined) reportedTotal = total
    if (!products.length) break
    all.push(...products)
    if (reportedTotal !== undefined && all.length >= reportedTotal) break
    if (serverLimit !== undefined) {
      if (products.length < serverLimit) break
    } else if (products.length < pageSize) {
      break
    }
    page += 1
  }

  return all
}

export const API_CreateProduct = async (payload: CreateProductPayload): Promise<CreateProductResponse> => {
  const res = await axios.post<CreateProductResponse>(`${API_URL}/api/v1/products`, payload)
  return res.data
}

export const API_UpdateProduct = async (productId: string, payload: UpdateProductPayload) => {
  const res = await axios.patch(`${API_URL}/api/v1/products/${productId}`, payload)
  return res.data
}

export const API_DeleteProduct = async (productId: string) => {
  const res = await axios.delete(`${API_URL}/api/v1/products/${productId}`)
  return res.data
}

export interface ProductDto {
  id: string
  name: string
  category: string
  price: number
  stock: number
  image_url: string | null
  status: string
  created_at: string
}

export interface CreateProductPayload {
  name: string
  category: string
  price: number
  stock?: number
  image_url?: string
  status?: string
}

export type UpdateProductPayload = Partial<CreateProductPayload>

export interface CreateProductResponse {
  success: boolean
  data: {
    message: string
    product: ProductDto
  }
}

export interface ProductsPageData {
  message?: string
  products?: ProductDto[]
  total?: number
  page?: number
  limit?: number
}

export interface ProductsListResponse {
  success: boolean
  data: ProductsPageData | ProductDto[]
}

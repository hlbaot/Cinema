export interface CreatePayosPaymentRequest {
  booking_id: string
}

export interface CreatePayosPaymentResponse {
  payment_code?: string
  checkoutUrl?: string
  payment_id?: string
  order_code?: number
  qrCode?: string
  qr_image_data_url?: string
  amount?: number
  currency?: string
  provider?: string
  payment_status?: string
  payos_status?: string
  description?: string
  expired_at?: number | null
  bank_bin?: string
  account_number?: string
  account_name?: string
  movie?: { title?: string; [key: string]: unknown }
  products?: unknown[]
  total_price?: number
  booking?: {
    booking_code?: string
    movie?: { title?: string; [key: string]: unknown }
    showtime?: { cinema_name?: string; room_name?: string; [key: string]: unknown }
    seats?: unknown[]
    products?: unknown[]
    [key: string]: unknown
  }
  [key: string]: unknown
}

export interface BookingPaymentStatusResponse {
  success: boolean
  is_paid?: boolean
  status?: string
  payment_status?: string
  payos_status?: string
  data?: {
    message?: string
    status?: string
    payment_status?: string
    payos_status?: string
    paid?: boolean
    is_paid?: boolean
    booking_id?: string
    [key: string]: unknown
  }
  message?: string
}

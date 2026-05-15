export interface TicketVerifyDetail {
  ticketId?: string
  ticketCode?: string
  ticketStatus?: string
  bookingId?: string
  bookingCode?: string
  bookingStatus?: string
  customerName?: string
  movieTitle?: string
  showtime?: string
  roomName?: string
  seats?: string[]
  status?: string
  checkedInAt?: string
}

export interface TicketVerifyApiResponse {
  valid: boolean
  ticket_id?: string
  ticket_code?: string
  ticket_status?: string
  booking_id?: string
  booking_code?: string
  booking_status?: string
  customer_name?: string
  movie_title?: string
  showtime_start?: string
  message?: string
}

export interface TicketVerifyOutcome {
  valid: boolean
  checkedIn?: boolean
  message: string
  detail?: TicketVerifyDetail
  source: 'api' | 'demo'
}

export interface StaffTicketSaleDto {
  id: string
  code?: string
  movieTitle?: string
  showtime?: string
  seats?: string[]
  amountVnd: number
  status?: string
  createdAt: string
}

export interface CreateStaffRequest {
  full_name: string
  email: string
  password: string
  phone?: string
  avatar_url?: string
}

export interface UserItemDto {
  id: string
  email: string
  full_name: string
  phone: string | null
  avatar_url: string | null
  role: string
  status: string
  auth_provider: 'local' | 'google'
  created_at: string
}

export interface CreateStaffResponseDto {
  success: boolean
  data: {
    message: string
    staff: UserItemDto
    /** Một số backend tự tạo mật khẩu và trả về đây (khi không gửi `password` lúc tạo). */
    temporary_password?: string
  }
}

export interface GetUserResponseDto {
  success: boolean
  data: {
    message: string
    users: UserItemDto[]
    total: number
    page: number
    limit: number
  }
}

export interface TicketCheckInResponseDto {
  id: string
  booking_id: string
  ticket_code: string
  qr_code_url: string
  status: string
  checked_in_at: string
}

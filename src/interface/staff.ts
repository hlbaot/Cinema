export interface TicketVerifyDetail {
  movieTitle?: string
  showtime?: string
  roomName?: string
  seats?: string[]
  status?: string
}

export interface TicketVerifyOutcome {
  valid: boolean
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
  success: boolean
  data?: {
    message?: string
    ticket?: Record<string, unknown>
    [key: string]: unknown
  }
  message?: string
}

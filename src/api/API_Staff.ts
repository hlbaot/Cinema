import axios from 'axios'
import { API_URL } from './url'

/** Đổi path cho khớp backend Nest khi có module staff/tickets */
const TICKET_VERIFY_PATH = '/api/v1/tickets/verify'
const TICKET_CHECKIN_PATH = '/api/v1/tickets'
const TICKET_SALES_PATH = '/api/v1/staff/ticket-sales'
const CREATE_STAFF_PATH = '/api/v1/users/staff'
const GET_STAFFS_PATH = '/api/v1/users/staffs'

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

function errText(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const d = e.response?.data as { message?: string | string[] } | undefined
    const m = d?.message
    if (Array.isArray(m)) return m.join(', ')
    if (typeof m === 'string') return m
    return e.message
  }
  if (e instanceof Error) return e.message
  return 'Lỗi không xác định'
}

/**
 * Kiểm tra mã vé. Backend: POST body `{ code }` — có thể trả `data.valid`, `data.ticket`, …
 * Nếu gọi API lỗi: thử mã bắt đầu `DEMO` để demo nội bộ.
 */
export async function API_VerifyTicket(code: string): Promise<TicketVerifyOutcome> {
  const trimmed = code.trim()
  if (!trimmed) {
    return { valid: false, message: 'Vui lòng nhập mã vé.', source: 'demo' }
  }

  const upper = trimmed.toUpperCase()
  if (upper.startsWith('DEMO')) {
    return {
      valid: true,
      message: 'Vé hợp lệ (mã demo, không gọi server).',
      source: 'demo',
      detail: {
        movieTitle: 'Phim demo',
        showtime: new Date().toISOString(),
        roomName: 'P.01',
        seats: ['D07', 'D08'],
        status: 'Đã thanh toán',
      },
    }
  }

  try {
    const res = await axios.post<{ success?: boolean; data?: Record<string, unknown> }>(
      `${API_URL}${TICKET_VERIFY_PATH}`,
      { code: trimmed }
    )
    const data = res.data?.data as Record<string, unknown> | undefined
    if (data && typeof data.valid === 'boolean') {
      const ticket = (data.ticket as Record<string, unknown>) || {}
      return {
        valid: data.valid,
        message: typeof data.message === 'string' ? data.message : data.valid ? 'Vé hợp lệ.' : 'Vé không hợp lệ.',
        source: 'api',
        detail: {
          movieTitle: typeof ticket.movie_title === 'string' ? ticket.movie_title : typeof ticket.movieTitle === 'string' ? ticket.movieTitle : undefined,
          showtime: typeof ticket.show_time === 'string' ? ticket.show_time : typeof ticket.showtime === 'string' ? ticket.showtime : undefined,
          roomName: typeof ticket.room_name === 'string' ? ticket.room_name : typeof ticket.roomName === 'string' ? ticket.roomName : undefined,
          seats: Array.isArray(ticket.seats) ? (ticket.seats as string[]) : undefined,
          status: typeof ticket.status === 'string' ? ticket.status : undefined,
        },
      }
    }
    return {
      valid: !!res.data?.success,
      message: 'Phản hồi máy chủ không đúng định dạng.',
      source: 'api',
    }
  } catch (e) {
    return {
      valid: false,
      message: `Không kiểm tra được qua API (${TICKET_VERIFY_PATH}). ${errText(e)} — dùng mã DEMO… để thử giao diện.`,
      source: 'api',
    }
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

/** Check-in vé sau khi verify (role staff/admin). */
export async function API_CheckInTicket(
  ticketId: string,
  accessToken?: string,
): Promise<TicketCheckInResponseDto> {
  const headers: Record<string, string> = {}
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const res = await axios.patch<TicketCheckInResponseDto>(`${API_URL}${TICKET_CHECKIN_PATH}/${ticketId}/check-in`, undefined, { headers })
  return res.data
}

/** Chuẩn hoá một dòng bán vé từ API (snake_case / camelCase / booking_id). */
function mapSaleRow(raw: Record<string, unknown>): StaffTicketSaleDto | null {
  const id = typeof raw.id === 'string' ? raw.id : typeof raw.booking_id === 'string' ? raw.booking_id : null
  if (!id) return null
  const amount =
    typeof raw.amount_vnd === 'number'
      ? raw.amount_vnd
      : typeof raw.amountVnd === 'number'
        ? raw.amountVnd
        : typeof raw.total === 'number'
          ? raw.total
          : 0
  const createdAt =
    typeof raw.created_at === 'string' ? raw.created_at : typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString()
  return {
    id,
    code: typeof raw.code === 'string' ? raw.code : typeof raw.ticket_code === 'string' ? raw.ticket_code : undefined,
    movieTitle: typeof raw.movie_title === 'string' ? raw.movie_title : typeof raw.movieTitle === 'string' ? raw.movieTitle : undefined,
    showtime: typeof raw.show_time === 'string' ? raw.show_time : typeof raw.showtime === 'string' ? raw.showtime : undefined,
    seats: Array.isArray(raw.seats) ? (raw.seats as string[]) : undefined,
    amountVnd: amount,
    status: typeof raw.status === 'string' ? raw.status : undefined,
    createdAt,
  }
}

/** Danh sách bán vé từ backend (nếu có). */
export async function API_GetStaffTicketSales(page = 1, limit = 50): Promise<StaffTicketSaleDto[]> {
  try {
    const res = await axios.get<{ success?: boolean; data?: Record<string, unknown> }>(`${API_URL}${TICKET_SALES_PATH}`, {
      params: { page, limit },
    })
    const data = res.data?.data
    if (!data || typeof data !== 'object') return []
    const inner = data as { sales?: unknown[]; items?: unknown[]; bookings?: unknown[] }
    const arr = inner.sales ?? inner.items ?? inner.bookings ?? []
    if (!Array.isArray(arr)) return []
    return arr.map(r => mapSaleRow(r as Record<string, unknown>)).filter((x): x is StaffTicketSaleDto => x !== null)
  } catch {
    return []
  }
}

/** Tạo tài khoản staff (role admin). */
export async function API_CreateStaff(
  payload: CreateStaffRequest,
  accessToken?: string,
): Promise<CreateStaffResponseDto> {
  const headers: Record<string, string> = {}
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const res = await axios.post<CreateStaffResponseDto>(`${API_URL}${CREATE_STAFF_PATH}`, payload, {
    headers,
  })
  return res.data
}

/** Lấy danh sách staff (role admin). */
export async function API_GetStaffs(
  page = 1,
  limit = 20,
  accessToken?: string,
): Promise<GetUserResponseDto> {
  const headers: Record<string, string> = {}
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const res = await axios.get<GetUserResponseDto>(`${API_URL}${GET_STAFFS_PATH}`, {
    params: { page, limit },
    headers,
  })
  return res.data
}

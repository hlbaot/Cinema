import axios from 'axios'
import { API_AdminCreateStaff, API_AdminGetCustomers, API_AdminGetStaffs } from '@/src/api/API_Admin'
import { API_URL } from './url'
import type {
  TicketVerifyDetail,
  TicketVerifyOutcome,
  TicketVerifyApiResponse,
  StaffTicketSaleDto,
  CreateStaffRequest,
  UserItemDto,
  CreateStaffResponseDto,
  GetUserResponseDto,
  TicketCheckInResponseDto,
} from '@/src/interface/staff'

export type {
  TicketVerifyDetail,
  TicketVerifyOutcome,
  TicketVerifyApiResponse,
  StaffTicketSaleDto,
  CreateStaffRequest,
  UserItemDto,
  CreateStaffResponseDto,
  GetUserResponseDto,
  TicketCheckInResponseDto,
}

/** Đổi path cho khớp backend Nest khi có module staff/tickets */
const TICKET_VERIFY_PATH = '/api/v1/tickets/verify'
const TICKET_CHECKIN_PATH = '/api/v1/tickets'
const TICKET_SALES_PATH = '/api/v1/staff/ticket-sales'

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function textValue(source: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.trim()) return value
  }

  return undefined
}

function authHeaders(accessToken?: string): Record<string, string> {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
}

function unwrapVerifyResponse(raw: unknown): Record<string, unknown> {
  if (!isRecord(raw)) return {}
  if (isRecord(raw.data) && (typeof raw.data.valid === 'boolean' || 'ticket_id' in raw.data || 'ticketId' in raw.data)) {
    return raw.data
  }

  return raw
}

function mapVerifyPayload(raw: unknown): TicketVerifyOutcome {
  const data = unwrapVerifyResponse(raw)
  const valid = data.valid === true
  const ticketId = textValue(data, 'ticket_id', 'ticketId')
  const ticketCode = textValue(data, 'ticket_code', 'ticketCode')
  const ticketStatus = textValue(data, 'ticket_status', 'ticketStatus')
  const bookingId = textValue(data, 'booking_id', 'bookingId')
  const bookingCode = textValue(data, 'booking_code', 'bookingCode')
  const bookingStatus = textValue(data, 'booking_status', 'bookingStatus')

  return {
    valid,
    message: textValue(data, 'message') ?? (valid ? 'Vé hợp lệ.' : 'Vé không hợp lệ.'),
    source: 'api',
    detail: {
      ticketId,
      ticketCode,
      ticketStatus,
      bookingId,
      bookingCode,
      bookingStatus,
      customerName: textValue(data, 'customer_name', 'customerName'),
      movieTitle: textValue(data, 'movie_title', 'movieTitle'),
      showtime: textValue(data, 'showtime_start', 'showtimeStart', 'showtime'),
      status: ticketStatus,
    },
  }
}

function mapCheckInPayload(raw: unknown): TicketCheckInResponseDto {
  const root = isRecord(raw) ? raw : {}
  const data = isRecord(root.data) ? root.data : root
  const ticket = isRecord(data.ticket) ? data.ticket : data

  return {
    id: textValue(ticket, 'id') ?? '',
    booking_id: textValue(ticket, 'booking_id', 'bookingId') ?? '',
    ticket_code: textValue(ticket, 'ticket_code', 'ticketCode') ?? '',
    qr_code_url: textValue(ticket, 'qr_code_url', 'qrCodeUrl') ?? '',
    status: textValue(ticket, 'status') ?? '',
    checked_in_at: textValue(ticket, 'checked_in_at', 'checkedInAt') ?? '',
  }
}

/**
 * Verify QR vé. Backend nhận body `{ qr_payload }` và trả trực tiếp thông tin vé.
 * Nếu dùng mã bắt đầu `DEMO`, page vẫn có thể test giao diện mà không cần server.
 */
export async function API_VerifyTicket(code: string, accessToken?: string): Promise<TicketVerifyOutcome> {
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
        ticketId: 'DEMO-TICKET-ID',
        ticketCode: trimmed,
        bookingCode: 'CNM-DEMO',
        bookingStatus: 'paid',
        customerName: 'Khách demo',
        movieTitle: 'Phim demo',
        showtime: new Date().toISOString(),
        roomName: 'P.01',
        seats: ['D07', 'D08'],
        status: 'valid',
      },
    }
  }

  try {
    const res = await axios.post<TicketVerifyApiResponse | { data?: TicketVerifyApiResponse }>(
      `${API_URL}${TICKET_VERIFY_PATH}`,
      { qr_payload: trimmed },
      { headers: authHeaders(accessToken) },
    )
    return mapVerifyPayload(res.data)
  } catch (e) {
    return {
      valid: false,
      message: `Không kiểm tra được qua API (${TICKET_VERIFY_PATH}). ${errText(e)} — dùng mã DEMO… để thử giao diện.`,
      source: 'api',
    }
  }
}

/** Check-in vé sau khi verify (role staff/admin). */
export async function API_CheckInTicket(
  ticketId: string,
  accessToken?: string,
): Promise<TicketCheckInResponseDto> {
  const res = await axios.patch<TicketCheckInResponseDto>(`${API_URL}${TICKET_CHECKIN_PATH}/${ticketId}/check-in`, undefined, {
    headers: authHeaders(accessToken),
  })

  return mapCheckInPayload(res.data)
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

/** Tạo tài khoản staff (role admin) — dùng chung layer chuẩn hoá với trang Quản lý nhân viên. */
export async function API_CreateStaff(
  payload: CreateStaffRequest,
  accessToken?: string,
): Promise<CreateStaffResponseDto> {
  return API_AdminCreateStaff(
    {
      full_name: payload.full_name,
      email: payload.email,
      password: payload.password,
      phone: payload.phone,
    },
    accessToken,
  )
}

/** Lấy danh sách staff (role admin). */
export async function API_GetStaffs(
  page = 1,
  limit = 20,
  accessToken?: string,
): Promise<GetUserResponseDto> {
  return API_AdminGetStaffs(page, limit, accessToken)
}

/** Lấy danh sách customer (role admin). */
export async function API_GetCustomers(
  page = 1,
  limit = 20,
  search = '',
  accessToken?: string,
): Promise<GetUserResponseDto> {
  return API_AdminGetCustomers(page, limit, search, accessToken)
}

import axios from 'axios'
import { API_URL } from './url'
import type {
  ShowtimeDto,
  ShowtimesByWeekResponse,
  GetShowtimesByWeekParams,
  GetDraftShowtimesParams,
  ShowtimeFormatOption,
  ShowtimeSeatItemDto,
  DraftShowtimesPaginationDto,
  DraftShowtimesResponse,
  PublishAllShowtimeDraftByDateResponseDto,
  PublishShowtimeResponseDto,
  LockShowtimeSeatsRequest,
  LockShowtimeSeatsResponse,
} from '@/src/interface/showtime'

export type {
  ShowtimeDto,
  ShowtimesByWeekResponse,
  GetShowtimesByWeekParams,
  GetDraftShowtimesParams,
  ShowtimeFormatOption,
  ShowtimeSeatItemDto,
  DraftShowtimesPaginationDto,
  DraftShowtimesResponse,
  PublishAllShowtimeDraftByDateResponseDto,
  PublishShowtimeResponseDto,
  LockShowtimeSeatsRequest,
  LockShowtimeSeatsResponse,
}

function normalizeMovieId(s: ShowtimeDto): string | undefined {
  if (typeof s.movie_id === 'string') return s.movie_id
  if (typeof s.movieId === 'string') return s.movieId
  return undefined
}

function normalizeYmd(s: ShowtimeDto): string | undefined {
  const d = typeof s.date === 'string' ? s.date : undefined
  if (!d) return undefined
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d
  return d
}

function normalizeStartTime(s: ShowtimeDto): string | undefined {
  const t = (typeof s.start_time === 'string' ? s.start_time : typeof s.startTime === 'string' ? s.startTime : undefined) as
    | string
    | undefined
  if (!t) return undefined
  const m = t.match(/\b(\d{2}:\d{2})\b/)
  return m?.[1] ?? t.slice(0, 5)
}

function parseShowtimes(raw: unknown): ShowtimeDto[] {
  if (!raw || typeof raw !== 'object') return []
  const res = raw as ShowtimesByWeekResponse
  const data = res.data
  if (Array.isArray(data)) return data as ShowtimeDto[]
  if (data && typeof data === 'object') {
    const maybe = (data as Record<string, unknown>).showtimes ?? (data as Record<string, unknown>).items
    if (Array.isArray(maybe)) return maybe as ShowtimeDto[]
  }
  return []
}

function parseShowtimeFormats(raw: unknown): ShowtimeFormatOption[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map(item => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      if (typeof row.value !== 'string' || typeof row.label !== 'string') return null

      return {
        value: row.value,
        label: row.label,
      }
    })
    .filter((item): item is ShowtimeFormatOption => item !== null)
}

function parseShowtimeSeats(raw: unknown): ShowtimeSeatItemDto[] {
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object'
      ? ((raw as Record<string, unknown>).data as unknown[] | undefined) ??
        ((raw as Record<string, unknown>).items as unknown[] | undefined) ??
        ((raw as Record<string, unknown>).seats as unknown[] | undefined)
      : undefined

  if (!Array.isArray(list)) return []

  return list
    .map(item => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>

      if (
        typeof row.id !== 'string' ||
        typeof row.showtime_id !== 'string' ||
        typeof row.seat_id !== 'string' ||
        typeof row.seat_row !== 'string' ||
        typeof row.seat_number !== 'number' ||
        typeof row.type !== 'string' ||
        typeof row.price !== 'number' ||
        typeof row.status !== 'string'
      ) {
        return null
      }

      return {
        id: row.id,
        showtime_id: row.showtime_id,
        seat_id: row.seat_id,
        seat_row: row.seat_row,
        seat_number: row.seat_number,
        type: row.type,
        price: row.price,
        status: row.status,
      }
    })
    .filter((item): item is ShowtimeSeatItemDto => item !== null)
}

function parseDraftShowtimes(raw: unknown): DraftShowtimesPaginationDto {
  const fallback: DraftShowtimesPaginationDto = {
    message: '',
    showtimes: [],
    total: 0,
    page: 1,
    limit: 10,
    total_pages: 0,
    current_page: 1,
    next_page: null,
    previous_page: null,
    has_next_page: false,
    has_previous_page: false,
  }

  if (!raw || typeof raw !== 'object') return fallback

  const top = raw as Record<string, unknown>
  const data = (top.data && typeof top.data === 'object' ? top.data : top) as Record<string, unknown>
  const showtimes = Array.isArray(data.showtimes) ? (data.showtimes as ShowtimeDto[]) : []

  return {
    message: typeof data.message === 'string' ? data.message : fallback.message,
    showtimes,
    total: typeof data.total === 'number' ? data.total : fallback.total,
    page: typeof data.page === 'number' ? data.page : fallback.page,
    limit: typeof data.limit === 'number' ? data.limit : fallback.limit,
    total_pages: typeof data.total_pages === 'number' ? data.total_pages : fallback.total_pages,
    current_page: typeof data.current_page === 'number' ? data.current_page : fallback.current_page,
    next_page: typeof data.next_page === 'number' ? data.next_page : null,
    previous_page: typeof data.previous_page === 'number' ? data.previous_page : null,
    has_next_page: typeof data.has_next_page === 'boolean' ? data.has_next_page : fallback.has_next_page,
    has_previous_page: typeof data.has_previous_page === 'boolean' ? data.has_previous_page : fallback.has_previous_page,
  }
}

function parsePublishDraftShowtimes(raw: unknown): PublishAllShowtimeDraftByDateResponseDto['data'] {
  const fallback: PublishAllShowtimeDraftByDateResponseDto['data'] = {
    message: '',
    total_published: 0,
    showtimes: [],
  }

  if (!raw || typeof raw !== 'object') return fallback

  const top = raw as Record<string, unknown>
  const data = (top.data && typeof top.data === 'object' ? top.data : top) as Record<string, unknown>

  return {
    message: typeof data.message === 'string' ? data.message : fallback.message,
    total_published: typeof data.total_published === 'number' ? data.total_published : fallback.total_published,
    showtimes: Array.isArray(data.showtimes) ? (data.showtimes as ShowtimeDto[]) : fallback.showtimes,
  }
}

function parsePublishOneDraftShowtime(raw: unknown): PublishShowtimeResponseDto['data'] {
  const fallback: PublishShowtimeResponseDto['data'] = {
    message: '',
    showtime: {},
  }

  if (!raw || typeof raw !== 'object') return fallback

  const top = raw as Record<string, unknown>
  const data = (top.data && typeof top.data === 'object' ? top.data : top) as Record<string, unknown>
  const showtime = data.showtime

  return {
    message: typeof data.message === 'string' ? data.message : fallback.message,
    showtime: showtime && typeof showtime === 'object' ? (showtime as ShowtimeDto) : fallback.showtime,
  }
}

export const API_GetShowtimesByWeek = async (params: GetShowtimesByWeekParams = {}): Promise<ShowtimeDto[]> => {
  const res = await axios.get(`${API_URL}/api/v1/showtimes/week`, {
    params,
  })
  return parseShowtimes(res.data)
}

export const API_GetShowtimeFormats = async (): Promise<ShowtimeFormatOption[]> => {
  const res = await axios.get(`${API_URL}/api/v1/showtimes/formats`)
  return parseShowtimeFormats(res.data)
}

export const API_GetShowtimeSeats = async (showtimeId: string): Promise<ShowtimeSeatItemDto[]> => {
  const res = await axios.get(`${API_URL}/api/v1/showtimes/${showtimeId}/seats`)
  return parseShowtimeSeats(res.data)
}

export const API_LockShowtimeSeats = async (
  showtimeId: string,
  body: LockShowtimeSeatsRequest,
  accessToken?: string,
): Promise<LockShowtimeSeatsResponse> => {
  const headers: Record<string, string> = {}
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`

  const res = await axios.post<LockShowtimeSeatsResponse>(`${API_URL}/api/v1/showtimes/${showtimeId}/seats/lock`, body, { headers })
  return res.data
}

export const API_GetDraftShowtimes = async (
  params: GetDraftShowtimesParams = {},
  accessToken?: string,
): Promise<DraftShowtimesResponse> => {
  const headers: Record<string, string> = {}
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const res = await axios.get(`${API_URL}/api/v1/showtimes/drafts`, {
    params,
    headers,
  })

  return {
    success: Boolean((res.data as { success?: unknown })?.success),
    data: parseDraftShowtimes(res.data),
  }
}

export const API_GenerateDraftShowtimes = async (
  params: GetDraftShowtimesParams = {},
  accessToken?: string,
): Promise<DraftShowtimesResponse> => {
  const headers: Record<string, string> = {}
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const res = await axios.post(
    `${API_URL}/api/v1/showtimes/drafts/generate`,
    {
      page: params.page,
      limit: params.limit,
    },
    { headers },
  )

  return {
    success: Boolean((res.data as { success?: unknown })?.success),
    data: parseDraftShowtimes(res.data),
  }
}

export const API_PublishAllShowtimeDrafts = async (
  accessToken?: string,
): Promise<PublishAllShowtimeDraftByDateResponseDto> => {
  const headers: Record<string, string> = {}
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const res = await axios.post(`${API_URL}/api/v1/showtimes/drafts/publish`, undefined, { headers })

  return {
    success: Boolean((res.data as { success?: unknown })?.success),
    data: parsePublishDraftShowtimes(res.data),
  }
}

export const API_PublishShowtimeDraft = async (
  showtimeId: string,
  accessToken?: string,
): Promise<PublishShowtimeResponseDto> => {
  const headers: Record<string, string> = {}
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const res = await axios.post(`${API_URL}/api/v1/showtimes/drafts/${showtimeId}/publish`, undefined, { headers })

  return {
    success: Boolean((res.data as { success?: unknown })?.success),
    data: parsePublishOneDraftShowtime(res.data),
  }
}

export function getMovieId(showtime: ShowtimeDto): string | undefined {
  return normalizeMovieId(showtime)
}

export function getShowtimeYmd(showtime: ShowtimeDto): string | undefined {
  return normalizeYmd(showtime)
}

export function getShowtimeStartTime(showtime: ShowtimeDto): string | undefined {
  return normalizeStartTime(showtime)
}

export function getShowtimeId(showtime: ShowtimeDto): string | undefined {
  if (typeof showtime.id === 'string') return showtime.id
  const anyShowtime = showtime as Record<string, unknown>
  const v =
    (typeof anyShowtime.showtime_id === 'string' && anyShowtime.showtime_id) ||
    (typeof anyShowtime.session_id === 'string' && anyShowtime.session_id) ||
    (typeof anyShowtime.booking_id === 'string' && anyShowtime.booking_id)
  return typeof v === 'string' ? v : undefined
}

export function getRoomId(showtime: ShowtimeDto): string | undefined {
  const anyShowtime = showtime as Record<string, unknown>
  const v =
    (typeof anyShowtime.room_id === 'string' && anyShowtime.room_id) ||
    (typeof anyShowtime.roomId === 'string' && anyShowtime.roomId) ||
    (typeof anyShowtime.theater_room_id === 'string' && anyShowtime.theater_room_id)
  if (typeof v === 'string') return v
  if (typeof anyShowtime.room_id === 'number') return String(anyShowtime.room_id)
  return undefined
}

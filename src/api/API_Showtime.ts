import axios from 'axios'
import { API_URL } from './url'

export type ShowtimeDto = {
  id?: string
  movie_id?: string
  movieId?: string
  date?: string
  start_time?: string
  startTime?: string
  // backend có thể trả thêm trường khác, nên giữ dạng index signature
  [key: string]: unknown
}

export interface ShowtimesByWeekResponse {
  success?: boolean
  data?: unknown
}

function normalizeMovieId(s: ShowtimeDto): string | undefined {
  if (typeof s.movie_id === 'string') return s.movie_id
  if (typeof s.movieId === 'string') return s.movieId
  return undefined
}

function normalizeYmd(s: ShowtimeDto): string | undefined {
  const d = typeof s.date === 'string' ? s.date : undefined
  if (!d) return undefined
  // dự kiến backend trả dạng YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d
  return d
}

function normalizeStartTime(s: ShowtimeDto): string | undefined {
  const t = (typeof s.start_time === 'string' ? s.start_time : typeof s.startTime === 'string' ? s.startTime : undefined) as
    | string
    | undefined
  if (!t) return undefined
  // nếu có seconds, cắt còn HH:mm
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

export interface GetShowtimesByWeekParams {
  date?: string
}

export const API_GetShowtimesByWeek = async (params: GetShowtimesByWeekParams = {}): Promise<ShowtimeDto[]> => {
  const res = await axios.get(`${API_URL}/api/v1/showtimes/week`, {
    params,
  })
  return parseShowtimes(res.data)
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
  // một số backend có thể dùng tên khác
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


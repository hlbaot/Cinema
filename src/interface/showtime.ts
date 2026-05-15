export type ShowtimeDto = {
  id?: string
  movie_id?: string
  movieId?: string
  date?: string
  start_time?: string
  startTime?: string
  [key: string]: unknown
}

export interface ShowtimesByWeekResponse {
  success?: boolean
  data?: unknown
}

export interface GetShowtimesByWeekParams {
  date?: string
}

export interface GetDraftShowtimesParams {
  page?: number
  limit?: number
}

export interface ShowtimeFormatOption {
  value: string
  label: string
}

export type ShowtimeSeatStatus = 'available' | 'reserved' | 'booked' | 'blocked'

export interface ShowtimeSeatItemDto {
  id: string
  showtime_id: string
  seat_id: string
  seat_row: string
  seat_number: number
  type: string
  price: number
  status: ShowtimeSeatStatus | string
}

export interface DraftShowtimesPaginationDto {
  message: string
  showtimes: ShowtimeDto[]
  total: number
  page: number
  limit: number
  total_pages: number
  current_page: number
  next_page: number | null
  previous_page: number | null
  has_next_page: boolean
  has_previous_page: boolean
}

export interface DraftShowtimesResponse {
  success: boolean
  data: DraftShowtimesPaginationDto
}

export interface PublishAllShowtimeDraftByDateResponseDto {
  success: boolean
  data: {
    message: string
    total_published: number
    showtimes: ShowtimeDto[]
  }
}

export interface PublishShowtimeResponseDto {
  success: boolean
  data: {
    message: string
    showtime: ShowtimeDto
  }
}

export interface LockShowtimeSeatsRequest {
  /** ID các showtime_seat cần khóa tạm thời. */
  showtime_seat_ids: string[]
}

export type LockShowtimeSeatsResponse = boolean

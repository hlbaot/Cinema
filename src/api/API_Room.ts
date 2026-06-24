import axios from 'axios'
import { API_URL } from './url'
import type { CinemaRoomDto, CinemaRoomSeatDto, RoomDetailResponse, RoomsListResponse } from '@/src/interface/room'

export type { CinemaRoomDto, CinemaRoomSeatDto, RoomDetailResponse, RoomsListResponse }

export type RoomStatusUpdate = 'active' | 'maintenance' | 'inactive' | string

export type CreateRoomPayload = {
  name: string
  format: string
  total_rows: number
  total_columns: number
}

export type GenerateRoomSeatsPayload = {
  room_id: string
  rows: number
  seats_per_row: number
}

const parseRoomsResponse = (res: RoomsListResponse): CinemaRoomDto[] => {
  if (!res.success || !res.data?.rooms || !Array.isArray(res.data.rooms)) return []
  return res.data.rooms
}

const parseRoomDetailResponse = (res: RoomDetailResponse): CinemaRoomDto & { seats?: CinemaRoomSeatDto[] } => {
  const data = res.data as Record<string, unknown>
  const roomRecord = data.room && typeof data.room === 'object'
    ? data.room as CinemaRoomDto & { seats?: CinemaRoomSeatDto[] }
    : data as unknown as CinemaRoomDto & { seats?: CinemaRoomSeatDto[] }

  if (!roomRecord || typeof roomRecord !== 'object' || !('id' in roomRecord)) {
    throw new Error('Phản hồi chi tiết phòng không hợp lệ')
  }

  const seats = Array.isArray(data.seats)
    ? data.seats as CinemaRoomSeatDto[]
    : roomRecord.seats

  return {
    ...roomRecord,
    seats,
  }
}

function parseRoomFromUnknown(raw: unknown): CinemaRoomDto | null {
  if (!raw || typeof raw !== 'object') return null
  const root = raw as Record<string, unknown>
  const data = root.data && typeof root.data === 'object' ? root.data as Record<string, unknown> : root
  const room = data.room && typeof data.room === 'object' ? data.room as Record<string, unknown> : data
  if (!room.id || !room.name) return null

  return {
    id: String(room.id),
    name: String(room.name),
    format: String(room.format ?? ''),
    total_rows: Number(room.total_rows ?? 0),
    total_columns: Number(room.total_columns ?? 0),
    total_seats: Number(room.total_seats ?? 0),
    status: String(room.status ?? 'active'),
    created_at: String(room.created_at ?? ''),
  }
}

function createAuthHeaders(accessToken?: string) {
  const headers: Record<string, string> = {}
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`
  return headers
}

export const API_GetRooms = async (accessToken?: string): Promise<CinemaRoomDto[]> => {
  const headers = createAuthHeaders(accessToken)
  const res = await axios.get<RoomsListResponse>(`${API_URL}/api/v1/cinemas/rooms`, { headers })
  return parseRoomsResponse(res.data)
}

export const API_CreateRoom = async (
  payload: CreateRoomPayload,
  accessToken?: string,
): Promise<CinemaRoomDto> => {
  const headers = {
    'Content-Type': 'application/json',
    ...createAuthHeaders(accessToken),
  }
  const res = await axios.post(`${API_URL}/api/v1/cinemas/rooms`, payload, { headers })
  const room = parseRoomFromUnknown(res.data)
  if (!room) throw new Error('Phản hồi tạo phòng không hợp lệ')
  return room
}

export const API_GenerateRoomSeats = async (
  payload: GenerateRoomSeatsPayload,
  accessToken?: string,
): Promise<unknown> => {
  const headers = {
    'Content-Type': 'application/json',
    ...createAuthHeaders(accessToken),
  }
  const res = await axios.post(`${API_URL}/api/v1/cinemas/seats/generate`, payload, { headers })
  return res.data
}

export const API_GetRoomDetail = async (roomId: string, accessToken?: string): Promise<CinemaRoomDto & { seats?: CinemaRoomSeatDto[] }> => {
  const headers = createAuthHeaders(accessToken)
  const res = await axios.get<RoomDetailResponse>(
    `${API_URL}/api/v1/cinemas/rooms/${encodeURIComponent(roomId)}`,
    { headers }
  )
  return parseRoomDetailResponse(res.data)
}

export const API_GetRoomsActive = async (accessToken?: string): Promise<CinemaRoomDto[]> => {
  const headers = createAuthHeaders(accessToken)
  const res = await axios.get<RoomsListResponse>(`${API_URL}/api/v1/cinemas/rooms-active`, { headers })
  return parseRoomsResponse(res.data)
}

export const API_GetRoomsMaintenance = async (accessToken?: string): Promise<CinemaRoomDto[]> => {
  const headers = createAuthHeaders(accessToken)
  const res = await axios.get<RoomsListResponse>(`${API_URL}/api/v1/cinemas/rooms-maintenance`, { headers })
  return parseRoomsResponse(res.data)
}

export const API_GetRoomsInactive = async (accessToken?: string): Promise<CinemaRoomDto[]> => {
  const headers = createAuthHeaders(accessToken)
  const res = await axios.get<RoomsListResponse>(`${API_URL}/api/v1/cinemas/rooms-inactive`, { headers })
  return parseRoomsResponse(res.data)
}

export const API_UpdateRoomStatus = async (
  roomId: string,
  status: RoomStatusUpdate,
  accessToken?: string,
): Promise<CinemaRoomDto> => {
  const headers = {
    'Content-Type': 'application/json',
    ...createAuthHeaders(accessToken),
  }
  const encodedRoomId = encodeURIComponent(roomId)
  const res = await axios.patch(
    `${API_URL}/api/v1/cinemas/rooms/${encodedRoomId}/status`,
    { status },
    { headers },
  )
  const room = parseRoomFromUnknown(res.data)
  if (!room) throw new Error('Phản hồi cập nhật trạng thái phòng không hợp lệ')
  return room
}

export const API_DeleteRoom = async (roomId: string, accessToken?: string): Promise<CinemaRoomDto | null> => {
  const headers = createAuthHeaders(accessToken)
  const encodedRoomId = encodeURIComponent(roomId)
  const paths = [
    `${API_URL}/api/v1/cinemas/rooms/${encodedRoomId}`,
  ]
  let lastError: unknown = null

  for (const path of paths) {
    try {
      const res = await axios.delete(path, { headers })
      return parseRoomFromUnknown(res.data)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError
}

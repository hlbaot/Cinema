import axios from 'axios'
import { API_URL } from './url'

export interface CinemaRoomDto {
  id: string
  name: string
  format: string
  total_rows: number
  total_columns: number
  total_seats: number
  status: string
  created_at: string
}

export interface RoomsListResponse {
  success: boolean
  data: {
    message: string
    rooms: CinemaRoomDto[]
  }
}

const parseRoomsResponse = (res: RoomsListResponse): CinemaRoomDto[] => {
  if (!res.success || !res.data?.rooms || !Array.isArray(res.data.rooms)) return []
  return res.data.rooms
}

export const API_GetRoomsActive = async (): Promise<CinemaRoomDto[]> => {
  const res = await axios.get<RoomsListResponse>(`${API_URL}/api/v1/cinemas/rooms-active`)
  return parseRoomsResponse(res.data)
}

export const API_GetRoomsMaintenance = async (): Promise<CinemaRoomDto[]> => {
  const res = await axios.get<RoomsListResponse>(`${API_URL}/api/v1/cinemas/rooms-maintenance`)
  return parseRoomsResponse(res.data)
}

export const API_GetRoomsInactive = async (): Promise<CinemaRoomDto[]> => {
  const res = await axios.get<RoomsListResponse>(`${API_URL}/api/v1/cinemas/rooms-inactive`)
  return parseRoomsResponse(res.data)
}

import axios from 'axios'
import { API_URL } from './url'
import type { CinemaRoomDto, RoomsListResponse } from '@/src/interface/room'

export type { CinemaRoomDto, RoomsListResponse }

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

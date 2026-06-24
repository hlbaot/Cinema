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

export interface CinemaRoomSeatDto {
  id: string
  room_id?: string
  seat_row: string
  seat_number: number
  type?: string
  status?: string
  created_at?: string
}

export interface RoomsListResponse {
  success: boolean
  data: {
    message: string
    rooms: CinemaRoomDto[]
  }
}

export interface RoomDetailResponse {
  success: boolean
  data: {
    message?: string
    room?: CinemaRoomDto & { seats?: CinemaRoomSeatDto[] }
    seats?: CinemaRoomSeatDto[]
  } | (CinemaRoomDto & { seats?: CinemaRoomSeatDto[] })
}

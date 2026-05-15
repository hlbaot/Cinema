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

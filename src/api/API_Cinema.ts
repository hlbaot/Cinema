import axios from 'axios'
import { SeatItem } from '../interface/movie'

/**
 * Lấy danh sách ghế của một suất chiếu từ Backend
 * @param showtimeId ID của suất chiếu cần lấy ghế
 * @returns Mảng các đối tượng SeatItem
 */
export const API_GetShowtimeSeats = async (showtimeId: string): Promise<SeatItem[]> => {
  try {
    const url = `/api/cinema/showtimes/${showtimeId}/seats`
    console.log('Calling API:', url)
    const response = await axios.get(url)
    
    if (Array.isArray(response.data)) {
      return response.data
    }

    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data
    }

    return []
  } catch (error) {
    // Log lỗi để dễ dàng debug nếu API trả về 404 hoặc lỗi khác
    console.error('Error fetching showtime seats:', error)
    return []
  }
}

export const API_GetRoomSeats = API_GetShowtimeSeats

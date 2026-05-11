'use client'

import { useState, useEffect, useCallback } from 'react'
import { SeatItem } from '../interface/movie'
import { API_GetRoomSeats } from '../api/API_Cinema'

/**
 * Hook tùy chỉnh để quản lý việc lấy dữ liệu ghế ngồi của một suất chiếu.
 * @param showtimeId ID của suất chiếu cần lấy dữ liệu.
 * @returns Object chứa danh sách ghế, trạng thái loading và hàm để tải lại dữ liệu.
 */
export const useRoomSeats = (showtimeId?: string) => {
  const [seats, setSeats] = useState<SeatItem[]>([])
  const [loading, setLoading] = useState(false)

  // Hàm gọi API để lấy danh sách ghế
  const fetchSeats = useCallback(async () => {
    // Nếu chưa có showtimeId thì không thực hiện gọi API
    if (!showtimeId) return
    
    setLoading(true)
    try {
      const data = await API_GetRoomSeats(showtimeId)
      setSeats(data)
    } catch (error) {
       console.error("Hook useRoomSeats error:", error)
    } finally {
      setLoading(false)
    }
  }, [showtimeId])

  // Tự động gọi API khi showtimeId thay đổi
  useEffect(() => {
    fetchSeats()
  }, [fetchSeats])

  return { seats, loading, refetch: fetchSeats }
}

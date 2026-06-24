'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import BookingProgressBar from '@/src/component/user/bookingProgressBar'
import SeatSelection from '@/src/component/user/seatSelection'
import { useMovieDetail } from '@/src/hooks/useMovieDetail'

// Trong Next.js 15, 'params' là một Promise và cần được unwrap bằng React.use() trong Client Component
export default function BookingPage({ params }: { params: Promise<{ sessionId: string }> }) {
  // Giải nén params bằng React.use()
  const resolvedParams = React.use(params)
  const sessionId = resolvedParams.sessionId

  const searchParams = useSearchParams()
  const movieId = searchParams.get('movieId')
  const roomId = searchParams.get('roomId')
  
  // Lấy thông tin chi tiết phim để hiển thị ở sidebar
  const { movie, loading } = useMovieDetail(movieId || undefined)

  // Kiểm tra tính hợp lệ của dữ liệu đầu vào
  if (!movieId || !roomId) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <p className="text-xl font-bold">Thông tin không hợp lệ. Vui lòng quay lại trang chủ.</p>
      </div>
    )
  }

  // Hiển thị trạng thái đang tải
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pb-12 pt-16 lg:pt-20">
      {/* Thanh tiến trình đặt vé - Bước 2: Chọn ghế */}
      <BookingProgressBar currentStep={1} />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        {/* Component chọn ghế chính */}
        <SeatSelection 
            sessionId={sessionId} 
            roomId={roomId || ''}
            movie={movie} 
        />
      </div>
    </div>
  )
}

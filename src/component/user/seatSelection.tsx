'use client'

import React, { useState, useEffect, useMemo } from 'react'
import NextImage from 'next/image'
import { Info } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRoomSeats } from '@/src/hooks/useRoomSeats'

interface Seat {
  id: string
  row: string
  col: string
  type: 'standard' | 'vip' | 'couple'
  status: 'available' | 'selected' | 'sold'
  price: number
}

interface SeatSelectionProps {
  sessionId: string
  roomId: string
  movie: {
    id: string
    title: string
    poster: string
    age_rating: string
  } | null
}

export default function SeatSelection({ sessionId, roomId, movie }: SeatSelectionProps) {
  const router = useRouter()
  const { seats: apiSeats, loading: seatsLoading } = useRoomSeats(sessionId)
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([])
  const [showAgeConfirm, setShowAgeConfirm] = useState(false)
  const [countdown, setCountdown] = useState(300)
  const isExpired = countdown === 0

  const seats: Seat[] = useMemo(() => apiSeats.map(s => {
    const id = s.seat_id || s.id
    return {
      id,
      row: s.seat_row,
      col: s.seat_number.toString().padStart(2, '0'),
      type: s.type,
      status: selectedSeatIds.includes(id)
        ? 'selected'
        : s.status === 'available' ? 'available' : 'sold',
      price: s.price
    }
  }), [apiSeats, selectedSeatIds])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  
  const selectedSeats = seats.filter(s => s.status === 'selected')
  const totalPrice = selectedSeats.reduce((acc, s) => acc + s.price, 0)
  const selectedSeatLabels = selectedSeats.map(seat => `${seat.row}${seat.col}`)
  const minimumAge = movie?.age_rating?.match(/\d+/)?.[0] || ''
  const foodHref = `/dat-ve/${sessionId}/food?movieId=${movie?.id}&roomId=${roomId}&seats=${selectedSeatLabels.join(',')}&ticketTotal=${totalPrice}`

  const toggleSeat = (id: string) => {
    if (isExpired) return

    const seat = seats.find(s => s.id === id)
    if (!seat || seat.status === 'sold') return

    setSelectedSeatIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(seatId => seatId !== id)
      }
      if (prev.length >= 10) return prev
      return [...prev, id]
    })
  }

  const handleContinue = () => {
    if (selectedSeats.length === 0 || isExpired) return
    setShowAgeConfirm(true)
  }

  const handleConfirmAge = () => {
    setShowAgeConfirm(false)
    router.push(foodHref)
  }

  const getSeatStyles = (seat: Seat) => {
    if (seat.status === 'selected') return 'bg-yellow-500 border-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]'
    if (seat.status === 'sold') return 'bg-zinc-800 border-zinc-800 text-transparent opacity-20 cursor-not-allowed pointer-events-none'
    
    switch (seat.type) {
      case 'standard': return 'border-zinc-700 text-zinc-500 hover:border-white hover:text-white'
      case 'vip': return 'border-yellow-600/60 text-yellow-600/80 hover:border-yellow-500 hover:text-yellow-500'
      case 'couple': return 'border-pink-500/60 text-pink-500/80 hover:border-pink-500 hover:text-pink-500'
    }
  }

  if (seatsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-zinc-900/30 rounded-[2.5rem] border border-zinc-800/40 p-10">
        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Đang tải sơ đồ ghế...</p>
      </div>
    )
  }

  const seatRows = Array.from(new Set(seats.map(s => s.row))).sort()

  return (
    <div className="flex flex-col xl:flex-row gap-8 bg-black min-h-screen text-white pb-20 justify-center">
      {isExpired && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-timeout-title"
        >
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center shadow-2xl">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-red-400">
              <Info className="h-7 w-7" />
            </div>
            <h2 id="booking-timeout-title" className="mb-3 text-2xl font-black uppercase text-white">
              Hết thời gian giữ ghế
            </h2>
            <p className="mb-7 text-sm font-medium leading-6 text-zinc-400">
              Thời gian giữ chỗ 5 phút đã kết thúc. Vui lòng tải lại trang để chọn ghế và đặt vé lại.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full rounded-xl bg-yellow-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-black transition hover:bg-yellow-400"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      )}

      {showAgeConfirm && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="age-confirm-title"
        >
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center shadow-2xl sm:p-10">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-yellow-500" />
            <div className="mx-auto mb-6 inline-flex rounded-xl bg-yellow-500 px-4 py-2 text-sm font-black text-black">
              {movie?.age_rating || 'PHÂN LOẠI'}
            </div>
            <h2 id="age-confirm-title" className="mb-5 text-3xl font-black leading-tight text-white sm:text-4xl">
              Xác nhận mua vé cho người có độ tuổi phù hợp
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-base font-medium leading-7 text-zinc-400">
              Tôi xác nhận mua vé phim này cho người có độ tuổi {minimumAge ? `từ ${minimumAge} tuổi trở lên` : 'phù hợp với phân loại phim'}.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => setShowAgeConfirm(false)}
                className="rounded-xl border border-zinc-700 bg-zinc-900 px-10 py-4 text-xs font-black uppercase tracking-widest text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
              >
                Từ chối
              </button>
              <button
                type="button"
                onClick={handleConfirmAge}
                className="rounded-xl bg-yellow-500 px-10 py-4 text-xs font-black uppercase tracking-widest text-black shadow-lg shadow-yellow-500/20 transition hover:bg-yellow-400"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KHU VỰC BẢN ĐỒ GHẾ */}
      <div className="flex-1 bg-zinc-950/40 rounded-[3rem] border border-zinc-800/50 p-6 lg:p-10 flex flex-col items-center shadow-2xl backdrop-blur-sm min-w-0 overflow-hidden">
        
        {/* Chú thích các loại ghế */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mb-14 w-full">
          {[
            { label: 'GHẾ THƯỜNG', class: 'border-zinc-700 bg-transparent' },
            { label: 'GHẾ VIP', class: 'border-yellow-600/60 bg-transparent' },
            { label: 'GHẾ COUPLE', class: 'border-pink-500/60 bg-transparent' },
            { label: 'ĐANG CHỌN', class: 'bg-yellow-500 border-yellow-500' },
            { label: 'ĐÃ BÁN', class: 'bg-zinc-800/50 opacity-40 border-zinc-800' }
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2.5">
               <div className={`w-4 h-4 rounded-md border ${item.class} shadow-sm`} />
               <span className="text-[10px] font-black text-zinc-500 tracking-wider uppercase">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Khung chứa Màn hình và Ghế - Hạn chế scroll ngang bằng flex-col items-center */}
        <div className="flex flex-col items-center w-full max-w-full pb-10">
            {/* Màn hình */}
            <div className="w-full max-w-[600px] mb-20 shrink-0">
               <div className="relative h-16 flex flex-col items-center">
                  <div className="absolute inset-x-0 -top-12 h-24 bg-yellow-500/10 blur-[80px] rounded-full pointer-events-none" />
                  <svg className="w-full text-yellow-500/80 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" viewBox="0 0 1000 40" preserveAspectRatio="none">
                     <path d="M0,40 Q500,0 1000,40" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                  </svg>
                  <p className="mt-8 text-[11px] font-black text-zinc-600 uppercase tracking-[1em] pl-[1em]">MÀN HÌNH</p>
               </div>
            </div>

            {/* Lưới ghế ngồi - Scale tự động nếu vượt quá chiều rộng */}
            <div className="select-none scale-[0.9] sm:scale-100 transition-transform origin-top py-4">
               <div className="flex flex-col gap-4">
                {seatRows.map(row => (
                  <div key={row} className="flex items-center gap-6">
                    <span className="w-6 shrink-0 text-center text-[11px] font-black text-zinc-800">{row}</span>
                    <div className="flex gap-2 justify-center">
                      {seats.filter(s => s.row === row).sort((a,b) => parseInt(a.col) - parseInt(b.col)).map(seat => (
                        <button
                          key={seat.id}
                          onClick={() => toggleSeat(seat.id)}
                          disabled={seat.status === 'sold' || isExpired}
                          className={`h-8 relative transition-all duration-200 rounded-lg border-2 text-[10px] font-bold flex items-center justify-center hover:scale-110 active:scale-95 ${getSeatStyles(seat)} ${seat.type === 'couple' ? 'w-[72px]' : 'w-8'}`}
                        >
                          {seat.row}{seat.col}
                        </button>
                      ))}
                    </div>
                    <span className="w-6 shrink-0 text-center text-[11px] font-black text-zinc-800">{row}</span>
                  </div>
                ))}
               </div>
            </div>
        </div>

        {/* Thanh trạng thái dưới cùng */}
        <div className="w-full max-w-[800px] flex flex-col sm:flex-row items-center justify-between gap-6 p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 shadow-xl backdrop-blur-md">
           <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-bold italic opacity-70">
              <Info className="w-4 h-4 text-yellow-500/70" />
              <span>Thời gian giữ ghế của bạn là 5 phút. Vui lòng thanh toán sớm.</span>
           </div>
           <div className="flex items-center gap-8">
              <div className="text-right">
                 <p className="text-[10px] font-black text-zinc-600 tracking-widest mb-1 uppercase">Tổng tiền</p>
                 <p className="text-xl font-black text-yellow-500">{totalPrice.toLocaleString()} đ</p>
              </div>
              <div className="w-px h-10 bg-zinc-800" />
              <div className="text-right">
                 <p className="text-[10px] font-black text-zinc-600 tracking-widest mb-1 uppercase">Còn lại</p>
                 <p className={`text-xl font-black ${countdown < 60 ? 'text-red-500 animate-pulse' : 'text-zinc-300'}`}>{formatTime(countdown)}</p>
              </div>
           </div>
        </div>
      </div>

      {/* SIDEBAR TÓM TẮT */}
      <aside className="w-full xl:w-[380px] shrink-0">
        <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-[2.5rem] overflow-hidden shadow-2xl sticky top-8 backdrop-blur-xl">
           <div className="p-8">
              {/* Thông tin phim */}
              <div className="flex gap-5 mb-8">
                 <div className="w-28 h-40 relative rounded-xl overflow-hidden shadow-2xl border border-zinc-800 shrink-0">
                    {movie && <NextImage fill src={movie.poster} alt={movie.title} className="object-cover" sizes="112px" loading="eager" />}
                 </div>
                 <div className="flex-1 py-1">
                    <h3 className="font-black text-xl text-white tracking-tight leading-tight mb-3 uppercase">{movie?.title}</h3>
                    <div className="space-y-3">
                       <span className="inline-block px-2.5 py-1 bg-yellow-500 text-black text-[9px] font-black rounded-full uppercase">2D Digital</span>
                       <div className="space-y-1.5 text-xs text-zinc-400 font-bold">
                          <p>Suất chiếu: <span className="text-white">15:10 | 11/05/2026</span></p>
                          <p>Rạp: <span className="text-white uppercase">Rạp 03</span></p>
                          <div className="pt-2">
                             <p className="text-zinc-600 font-black text-[10px] uppercase mb-2">Ghế đang chọn:</p>
                             <div className="flex flex-wrap gap-2">
                                {selectedSeats.length > 0 ? selectedSeats.map(s => (
                                   <span key={s.id} className="min-w-[40px] h-7 bg-zinc-800 border border-yellow-500/20 text-yellow-500 font-black rounded-lg flex items-center justify-center text-[10px]">{s.row}{s.col}</span>
                                )) : <span className="text-zinc-700 italic font-medium">Chưa chọn ghế</span>}
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Chi tiết giá vé */}
              <div className="space-y-5 border-t border-zinc-800/80 pt-6 mt-6">
                 <div className="flex justify-between items-center text-zinc-400">
                    <span className="font-black text-[10px] uppercase tracking-widest">Tạm tính ({selectedSeats.length})</span>
                    <span className="font-black text-white text-lg">{totalPrice.toLocaleString()} đ</span>
                 </div>
                 
                 <div className="bg-zinc-950/60 rounded-2xl p-6 border border-zinc-800/50 flex flex-col items-center">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">TỔNG THANH TOÁN</p>
                    <p className="text-3xl font-black text-yellow-500 tracking-tighter">
                       {totalPrice.toLocaleString()} 
                       <span className="text-sm font-bold ml-1.5 uppercase opacity-80">₫</span>
                    </p>
                 </div>
              </div>
           </div>

           {/* Nút điều hướng */}
           <div className="p-8 pt-0 flex gap-3">
              <button 
                onClick={() => window.history.back()} 
                className="w-1/3 py-4 px-4 border border-zinc-700 text-zinc-500 font-black rounded-xl hover:bg-zinc-800 hover:text-white transition-all text-[10px] uppercase tracking-widest"
              >
                QUAY LẠI
              </button>
              <button
                type="button"
                onClick={handleContinue}
                disabled={selectedSeats.length === 0 || isExpired}
                className={`flex-1 py-4 px-4 font-black rounded-xl transition-all shadow-xl text-[10px] uppercase tracking-widest text-center flex items-center justify-center ${
                  selectedSeats.length > 0 && !isExpired
                  ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-yellow-500/20' 
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed shadow-none'
                }`}
              >
                TIẾP TỤC
              </button>
           </div>
        </div>
      </aside>
    </div>
  )
}

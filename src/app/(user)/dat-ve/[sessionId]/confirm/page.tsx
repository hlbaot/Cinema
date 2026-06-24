'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { CheckCircle2, Home, ReceiptText } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

import BookingProgressBar from '@/src/component/user/bookingProgressBar'
import { formatVnd } from '@/src/lib/utils'

export default function BookingConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(10)
  const bookingId = searchParams.get('bookingId') || ''
  const movie = searchParams.get('movie') || 'Vé xem phim'
  const poster = searchParams.get('poster') || ''
  const seats = searchParams.get('seats')?.split(',').filter(Boolean) || []
  const room = searchParams.get('room') || 'Chưa rõ'
  const time = searchParams.get('time') || 'Chưa rõ'
  const age = searchParams.get('age') || 'P'
  const total = Number(searchParams.get('total') || 0)

  useEffect(() => {
    const redirectTimer = window.setTimeout(() => {
      router.push('/trangChu')
    }, 10000)
    const countdownTimer = window.setInterval(() => {
      setCountdown(value => Math.max(0, value - 1))
    }, 1000)

    return () => {
      window.clearTimeout(redirectTimer)
      window.clearInterval(countdownTimer)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-black pb-16 pt-16 text-white lg:pt-20">
      <BookingProgressBar currentStep={4} />

      <main className="mx-auto mt-10 max-w-4xl px-4 sm:px-6">
        <section className="overflow-hidden rounded-3xl border border-emerald-500/30 bg-zinc-950 shadow-[0_0_50px_rgba(16,185,129,0.12)]">
          <div className="border-b border-zinc-800 bg-emerald-500/10 px-6 py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-black">
                <CheckCircle2 className="h-7 w-7" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-emerald-300">Thanh toán thành công</p>
                <h1 className="mt-1 text-2xl font-black uppercase">Vé của bạn đã được xác nhận</h1>
                <p className="mt-2 text-sm font-medium text-zinc-400">Tự động quay về trang chủ sau {countdown} giây.</p>
              </div>
              </div>
              <button
                type="button"
                onClick={() => router.push('/trangChu')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 text-xs font-black uppercase tracking-widest text-black transition hover:bg-yellow-400"
              >
                <Home className="h-4 w-4" />
                Quay lại trang chủ
              </button>
            </div>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-[160px_1fr]">
            <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-zinc-900">
              {poster ? (
                <Image src={poster} alt={movie} fill sizes="160px" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs font-black uppercase text-zinc-600">Poster</div>
              )}
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Phim</p>
                <h2 className="mt-1 text-2xl font-black uppercase">{movie}</h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Suất chiếu</p>
                  <p className="mt-2 font-black text-white">{time}</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Phòng</p>
                  <p className="mt-2 font-black text-white">{room}</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Phân loại</p>
                  <p className="mt-2 font-black text-yellow-500">{age}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-zinc-600">Ghế</p>
                <div className="flex flex-wrap gap-2">
                  {seats.length ? seats.map(seat => (
                    <span key={seat} className="rounded-lg border border-yellow-500/20 bg-zinc-900 px-3 py-2 text-xs font-black text-yellow-500">{seat}</span>
                  )) : <span className="text-sm text-zinc-600">Không có dữ liệu ghế</span>}
                </div>
              </div>

              <div className="flex items-end justify-between border-t border-zinc-800 pt-5">
                <div className="flex items-center gap-3 text-zinc-500">
                  <ReceiptText className="h-5 w-5" />
                  <span className="text-xs font-black uppercase tracking-widest">Booking</span>
                </div>
                <span className="max-w-[220px] truncate text-right text-sm font-black text-white">{bookingId}</span>
              </div>

              <div className="flex items-end justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-zinc-600">Đã thanh toán</span>
                <span className="text-3xl font-black text-emerald-400">{formatVnd(total)}</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

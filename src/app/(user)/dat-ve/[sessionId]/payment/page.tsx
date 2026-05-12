'use client'

import Cookies from 'js-cookie'
import { useMemo, useState } from 'react'
import axios from 'axios'
import { QrCode, ReceiptText, ShieldCheck } from 'lucide-react'
import { useParams, useSearchParams } from 'next/navigation'

import { API_CreateBooking } from '@/src/api/API_Booking'
import { API_CreatePayosPayment, API_GetBookingPaymentStatus } from '@/src/api/API_Payment'
import { API_LockShowtimeSeats } from '@/src/api/API_Showtime'
import BookingProgressBar from '@/src/component/user/bookingProgressBar'
import { decodeJwtPayload, getApiErrorMessage } from '@/src/lib/auth-client'
import { formatVnd } from '@/src/lib/utils'

type SelectedFoodItem = {
  id: string
  name: string
  price: number
  quantity: number
}

const PAYOS_METHOD = 'payos'

/** Gom thông báo lỗi từ body tạo booking (message / error / data / class-validator). */
function extractCreateBookingErrorMessage(payload: unknown): string | null {
  if (payload == null || typeof payload !== 'object') return null
  const r = payload as Record<string, unknown>

  const pick = (v: unknown): string | null => {
    if (typeof v === 'string' && v.trim()) return v.trim()
    if (Array.isArray(v)) {
      const joined = v
        .map((x) => (typeof x === 'string' ? x : JSON.stringify(x)))
        .join(' ')
      return joined.trim() || null
    }
    return null
  }

  const fromConstraints = (items: unknown): string | null => {
    if (!Array.isArray(items)) return null
    const parts: string[] = []
    for (const item of items) {
      if (typeof item === 'string') parts.push(item)
      else if (item && typeof item === 'object' && 'constraints' in item) {
        const c = (item as { constraints?: Record<string, string> }).constraints
        if (c && typeof c === 'object') parts.push(...Object.values(c))
      }
    }
    return parts.length ? parts.join(' ') : null
  }

  const data = r.data

  return (
    pick(r.message) ??
    pick(r.error) ??
    pick(r.reason) ??
    (data && typeof data === 'object'
      ? pick((data as Record<string, unknown>).message) ??
        pick((data as Record<string, unknown>).error) ??
        pick((data as Record<string, unknown>).reason)
      : null) ??
    fromConstraints(r.errors)
  )
}

function parseFoodParam(value: string | null): SelectedFoodItem[] {
  if (!value) return []

  try {
    const parsed = JSON.parse(value)

    if (!Array.isArray(parsed)) return []

    return parsed.filter((item): item is SelectedFoodItem => (
      typeof item?.id === 'string' &&
      typeof item?.name === 'string' &&
      typeof item?.price === 'number' &&
      typeof item?.quantity === 'number'
    ))
  } catch {
    return []
  }
}

export default function PaymentPage() {
  const routeParams = useParams<{ sessionId: string }>()
  const searchParams = useSearchParams()
  const [submitting, setSubmitting] = useState(false)
  const seats = useMemo(
    () => searchParams.get('seats')?.split(',').filter(Boolean) || [],
    [searchParams],
  )
  const foodItems = useMemo(
    () => parseFoodParam(searchParams.get('food')),
    [searchParams],
  )
  const seatIds = useMemo(
    () => searchParams.get('seatIds')?.split(',').filter(Boolean) || [],
    [searchParams],
  )
  const bookingIdInQuery = searchParams.get('bookingId')
  const ticketTotal = Number(searchParams.get('ticketTotal') || 0)
  const foodTotal = Number(searchParams.get('foodTotal') || 0)
  const total = Number(searchParams.get('total') || ticketTotal + foodTotal)

  function coerceBookingId(value: unknown): string | null {
    if (typeof value === 'string') {
      const t = value.trim()
      return t || null
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value)
    }
    return null
  }

  /** Lấy id booking từ body tạo booking — BE có thể trả envelope, camelCase hoặc id kiểu số. */
  function extractBookingId(payload: unknown): string | null {
    if (payload == null) return null
    if (typeof payload === 'string') return coerceBookingId(payload)
    if (typeof payload !== 'object') return null
    const raw = payload as Record<string, unknown>

    const direct =
      coerceBookingId(raw.booking_id) ??
      coerceBookingId(raw.bookingId) ??
      coerceBookingId(raw.id) ??
      coerceBookingId(raw.uuid) ??
      coerceBookingId(raw.booking_uuid)
    if (direct) return direct

    if (raw.booking && typeof raw.booking === 'object') {
      const b = raw.booking as Record<string, unknown>
      const nested =
        coerceBookingId(b.id) ??
        coerceBookingId(b.booking_id) ??
        coerceBookingId(b.bookingId) ??
        coerceBookingId(b.uuid) ??
        coerceBookingId(b.booking_uuid)
      if (nested) return nested
    }

    if (raw.data !== undefined) return extractBookingId(raw.data)

    return null
  }

  async function handleConfirmPayment() {
    const showtimeId = routeParams.sessionId
    if (!showtimeId) {
      alert('Thiếu thông tin suất chiếu.')
      return
    }
    if (seatIds.length === 0) {
      alert('Không có ghế để thanh toán. Vui lòng chọn lại ghế.')
      return
    }

    setSubmitting(true)
    try {
      const accessToken = Cookies.get('ACCESS_TOKEN')
      const customerName = Cookies.get('USER_NAME') || 'Khách hàng'
      let customerEmail = Cookies.get('USER_EMAIL') || ''
      if (customerEmail === 'undefined' || customerEmail === 'null') {
        customerEmail = ''
      }
      const customerPhone = Cookies.get('USER_PHONE') || ''

      // Nếu cookie USER_EMAIL không có, thử lấy từ payload của ACCESS_TOKEN
      if (!customerEmail && accessToken) {
        const payload = decodeJwtPayload(accessToken)
        if (payload?.email) {
          customerEmail = payload.email
        }
      }

      if (!customerEmail) {
        throw new Error('Thiếu email tài khoản để tạo booking.')
      }

      const locked = await API_LockShowtimeSeats(
        showtimeId,
        { showtime_seat_ids: seatIds },
        accessToken,
      )
      if (!locked) {
        throw new Error('Không thể giữ ghế, vui lòng chọn lại.')
      }

      const bookingRes = await API_CreateBooking(
        {
          showtime_id: showtimeId,
          showtime_seat_ids: seatIds,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone || undefined,
          notes: PAYOS_METHOD,
        },
        accessToken,
      )

      const bookingId = extractBookingId(bookingRes)
      if (bookingId) {
        if (bookingRes.success === false) {
          console.warn(
            '[payment] Create booking: success is false but a booking id was parsed; continuing to PayOS.',
            bookingRes,
          )
        }
      } else {
        console.error('Create booking: response had no parsable booking id', bookingRes)
        const apiErr = extractCreateBookingErrorMessage(bookingRes)
        if (apiErr) {
          throw new Error(apiErr)
        }
        if (bookingRes.success === false) {
          throw new Error(
            'Tạo booking thất bại. Phản hồi từ server không có mã booking và không có mô tả lỗi — mở Network → POST /api/v1/bookings để xem chi tiết.',
          )
        }
        throw new Error('Không lấy được mã booking từ hệ thống.')
      }

      const payRes = await API_CreatePayosPayment({ booking_id: bookingId }, accessToken)
      if (!payRes.checkoutUrl) {
        throw new Error('Không lấy được đường dẫn thanh toán PayOS.')
      }
      window.location.href = payRes.checkoutUrl
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Log chi tiết để debug nhanh trong DevTools.
        console.error('PayOS flow failed:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        })
      } else {
        console.error('PayOS flow failed:', error)
      }

      const fallback =
        error instanceof Error && error.message.trim()
          ? error.message
          : 'Không thể tạo thanh toán PayOS.'
      alert(getApiErrorMessage(error, fallback))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCheckPaymentStatus() {
    if (!bookingIdInQuery) {
      alert('Thiếu bookingId để kiểm tra trạng thái.')
      return
    }
    try {
      const accessToken = Cookies.get('ACCESS_TOKEN')
      const statusRes = await API_GetBookingPaymentStatus(bookingIdInQuery, accessToken)
      alert(statusRes.data?.message || `Trạng thái thanh toán: ${statusRes.data?.status || 'không rõ'}`)
    } catch (error) {
      alert(getApiErrorMessage(error, 'Không kiểm tra được trạng thái thanh toán.'))
    }
  }

  return (
    <div className="min-h-screen bg-black pb-16 text-white">
      <BookingProgressBar currentStep={3} />

      <div className="mx-auto mt-10 grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
        <section>
          <div className="mb-8">
            <p className="mb-2 text-xs font-black uppercase tracking-widest text-yellow-500">Thanh toán</p>
            <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">Thanh toán với PayOS</h1>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-yellow-500 bg-yellow-500/10 p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-500 text-black">
              <QrCode className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-black uppercase text-white">PayOS</span>
              <span className="mt-1 block text-sm font-medium text-zinc-500">Chuyển hướng đến cổng thanh toán PayOS để hoàn tất giao dịch</span>
            </span>
          </div>

          <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="mb-5 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-yellow-500" />
              <h2 className="font-black uppercase">Thông tin bảo mật</h2>
            </div>
            <p className="text-sm font-medium leading-7 text-zinc-500">
              Giao dịch được mã hóa và chỉ được xác nhận sau khi hệ thống nhận thanh toán thành công.
            </p>
          </div>
        </section>

        <aside>
          <div className="sticky top-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500 text-black">
                <ReceiptText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-black uppercase">Chi tiết thanh toán</h2>
                <p className="text-xs font-medium text-zinc-500">Kiểm tra đơn trước khi trả tiền</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-zinc-600">Ghế</p>
                <div className="flex flex-wrap gap-2">
                  {seats.length > 0 ? seats.map(seat => (
                    <span key={seat} className="rounded-lg border border-yellow-500/20 bg-zinc-900 px-3 py-2 text-xs font-black text-yellow-500">
                      {seat}
                    </span>
                  )) : (
                    <span className="text-sm text-zinc-600">Chưa có ghế</span>
                  )}
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-5">
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-zinc-600">Bắp nước</p>
                <div className="space-y-3">
                  {foodItems.length > 0 ? foodItems.map(item => (
                    <div key={item.id} className="flex justify-between gap-4 text-sm text-zinc-400">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-bold text-white">{formatVnd(item.price * item.quantity)}</span>
                    </div>
                  )) : (
                    <span className="text-sm text-zinc-600">Không chọn bắp nước</span>
                  )}
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-5 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Tiền vé</span>
                  <span className="font-bold text-white">{formatVnd(ticketTotal)}</span>
                </div>
                <div className="mt-3 flex justify-between text-zinc-400">
                  <span>Bắp nước</span>
                  <span className="font-bold text-white">{formatVnd(foodTotal)}</span>
                </div>
                <div className="mt-5 flex items-end justify-between border-t border-zinc-800 pt-5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Cần thanh toán</span>
                  <span className="text-3xl font-black text-yellow-500">{formatVnd(total)}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleConfirmPayment()}
              disabled={submitting}
              className="mt-7 w-full rounded-xl bg-yellow-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-black transition hover:bg-yellow-400"
            >
              {submitting ? 'Đang tạo thanh toán...' : 'Xác nhận thanh toán'}
            </button>
            {bookingIdInQuery ? (
              <button
                type="button"
                onClick={() => void handleCheckPaymentStatus()}
                className="mt-3 w-full rounded-xl border border-zinc-700 px-6 py-3 text-[11px] font-black uppercase tracking-widest text-zinc-300 transition hover:border-zinc-500 hover:text-white"
              >
                Kiểm tra trạng thái thanh toán
              </button>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  )
}

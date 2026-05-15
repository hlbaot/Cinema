'use client'

import Cookies from 'js-cookie'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { QrCode, ReceiptText } from 'lucide-react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import QRCode from 'qrcode'

import { API_CreateBooking } from '@/src/api/API_Booking'
import { API_CreatePayosPayment, API_GetBookingPaymentStatus, type CreatePayosPaymentResponse } from '@/src/api/API_Payment'
import { API_LockShowtimeSeats } from '@/src/api/API_Showtime'
import BookingProgressBar from '@/src/component/user/bookingProgressBar'
import { useMovieDetail } from '@/src/hooks/useMovieDetail'
import { decodeJwtPayload, getApiErrorMessage } from '@/src/lib/auth-client'
import { formatVnd } from '@/src/lib/utils'

type SelectedFoodItem = {
  id: string
  name: string
  price: number
  quantity: number
}

type PayosDisplayInfo = CreatePayosPaymentResponse & {
  bookingId: string
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

function getRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null
}

function getText(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function getNumberValue(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value)
  return null
}

function getSeatLabel(value: unknown, index: number) {
  if (typeof value === 'string') return value
  const seat = getRecord(value)
  return getText(seat?.seat_label ?? seat?.label ?? seat?.code ?? seat?.seat_number ?? seat?.name, `Ghế ${index + 1}`)
}

function getProductInfo(value: unknown, index: number): SelectedFoodItem {
  const product = getRecord(value)
  const quantity = getNumberValue(product?.quantity ?? product?.qty) ?? 1
  const price = getNumberValue(product?.price ?? product?.unit_price ?? product?.amount) ?? 0

  return {
    id: getText(product?.id, `product-${index}`),
    name: getText(product?.name ?? product?.title ?? product?.product_name, `Sản phẩm ${index + 1}`),
    price,
    quantity,
  }
}

const BANK_BY_BIN: Record<string, { code: string; name: string }> = {
  '970448': { code: 'OCB', name: 'Ngân hàng TMCP Phương Đông' },
  '970436': { code: 'VIETCOMBANK', name: 'Ngân hàng TMCP Ngoại thương Việt Nam' },
  '970418': { code: 'BIDV', name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam' },
  '970415': { code: 'VIETINBANK', name: 'Ngân hàng TMCP Công thương Việt Nam' },
  '970405': { code: 'AGRIBANK', name: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam' },
  '970407': { code: 'TECHCOMBANK', name: 'Ngân hàng TMCP Kỹ thương Việt Nam' },
  '970422': { code: 'MB', name: 'Ngân hàng TMCP Quân đội' },
  '970432': { code: 'VPBANK', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng' },
  '970423': { code: 'TPBANK', name: 'Ngân hàng TMCP Tiên Phong' },
  '970403': { code: 'SACOMBANK', name: 'Ngân hàng TMCP Sài Gòn Thương Tín' },
  '970416': { code: 'ACB', name: 'Ngân hàng TMCP Á Châu' },
  '970441': { code: 'VIB', name: 'Ngân hàng TMCP Quốc tế Việt Nam' },
  '970440': { code: 'SEABANK', name: 'Ngân hàng TMCP Đông Nam Á' },
  '970426': { code: 'MSB', name: 'Ngân hàng TMCP Hàng Hải Việt Nam' },
  '970443': { code: 'SHB', name: 'Ngân hàng TMCP Sài Gòn Hà Nội' },
}

function getBankDisplay(bankBin?: string) {
  const bank = bankBin ? BANK_BY_BIN[bankBin] : undefined
  return {
    code: bank?.code || bankBin || 'PayOS',
    name: bank?.name || 'Ngân hàng liên kết VietQR',
  }
}

function PayosQrImage({ imageDataUrl, value }: { imageDataUrl?: string; value: string }) {
  const [qrDataUrl, setQrDataUrl] = useState('')

  useEffect(() => {
    if (imageDataUrl) {
      return
    }

    let cancelled = false

    QRCode.toDataURL(value, {
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 280,
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url)
      })
      .catch((error: unknown) => {
        console.error('Generate PayOS QR failed:', error)
        if (!cancelled) setQrDataUrl('')
      })

    return () => {
      cancelled = true
    }
  }, [imageDataUrl, value])

  if (imageDataUrl) {
    return (
      <div className="inline-flex rounded-2xl bg-white p-3 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
        {/* BE trả sẵn VietQR image data URL nên render trực tiếp để app ngân hàng đọc đúng. */}
        <img src={imageDataUrl} alt="VietQR" className="h-72 w-72 rounded-xl" />
      </div>
    )
  }

  if (!qrDataUrl) {
    return (
      <div className="flex h-72 w-72 items-center justify-center rounded-2xl bg-white text-center text-xs font-black uppercase tracking-widest text-zinc-500">
        Đang tạo QR
      </div>
    )
  }

  return (
    <div className="inline-flex rounded-2xl bg-white p-3 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
      <Image unoptimized src={qrDataUrl} alt="VietQR" width={280} height={280} className="h-72 w-72 rounded-xl" />
    </div>
  )
}

function normalizeStatusText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim().toUpperCase() : ''
}

function isFinalPaidStatus(status: string, paid?: boolean) {
  return paid === true || ['PAID', 'SUCCESS', 'COMPLETED', 'CONFIRMED'].includes(status)
}

export default function PaymentPage() {
  const router = useRouter()
  const routeParams = useParams<{ sessionId: string }>()
  const searchParams = useSearchParams()
  const [submitting, setSubmitting] = useState(false)
  const [payosInfo, setPayosInfo] = useState<PayosDisplayInfo | null>(null)
  const [paymentStatus, setPaymentStatus] = useState('')
  const [paymentPaid, setPaymentPaid] = useState(false)
  const [pollingError, setPollingError] = useState('')
  const movieId = searchParams.get('movieId') || ''
  const roomId = searchParams.get('roomId') || ''
  const { movie } = useMovieDetail(movieId || undefined)
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
  const serverBooking = payosInfo?.booking
  const serverMovie = getRecord(serverBooking?.movie) || getRecord(payosInfo?.movie)
  const serverShowtime = getRecord(serverBooking?.showtime)
  const serverPaymentStatus = normalizeStatusText(paymentStatus || payosInfo?.payment_status || payosInfo?.payos_status)
  const qrPayload = payosInfo?.qrCode || payosInfo?.checkoutUrl || ''
  const selectedSession = useMemo(() => {
    if (!movie?.showtimes) return null

    for (const showtime of movie.showtimes) {
      for (const room of showtime.rooms) {
        const session = room.sessions.find(item => item.id === routeParams.sessionId)
        if (session) {
          return {
            date: showtime.date,
            format: room.format,
            roomName: room.room_name,
            time: session.time,
          }
        }
      }
    }

    return null
  }, [movie, routeParams.sessionId])
  const serverProducts = useMemo(
    () => {
      if (Array.isArray(serverBooking?.products)) return serverBooking.products.map(getProductInfo)
      if (Array.isArray(payosInfo?.products)) return payosInfo.products.map(getProductInfo)
      return []
    },
    [payosInfo, serverBooking],
  )
  const displayFoodItems = serverProducts.length > 0 ? serverProducts : foodItems
  const displayFoodTotal = serverProducts.length > 0
    ? serverProducts.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : foodTotal
  const displaySeats = useMemo(
    () => (Array.isArray(serverBooking?.seats) && serverBooking.seats.length > 0
      ? serverBooking.seats.map(getSeatLabel)
      : seats),
    [seats, serverBooking],
  )
  const displayMovieTitle = getText(serverMovie?.title, movie?.title || 'Đang tải thông tin phim...')
  const displayMoviePoster = getText(serverMovie?.poster_url ?? serverMovie?.poster, movie?.poster || '')
  const displayAgeRating = getText(serverMovie?.age_rating, movie?.age_rating || '')
  const displayShowtimeTime = getText(
    serverShowtime?.time ?? serverShowtime?.start_time ?? serverShowtime?.startTime,
    selectedSession?.time || '',
  )
  const displayRoomName = getText(serverShowtime?.room_name, selectedSession?.roomName || roomId || 'Chưa rõ')
  const displayAmount = payosInfo?.total_price ?? payosInfo?.amount ?? total
  const bankDisplay = getBankDisplay(payosInfo?.bank_bin)

  const goToConfirm = useCallback((bookingId: string) => {
    const confirmParams = new URLSearchParams({
      bookingId,
      movie: displayMovieTitle,
      poster: displayMoviePoster,
      seats: displaySeats.join(','),
      room: displayRoomName,
      time: displayShowtimeTime,
      age: displayAgeRating,
      total: String(displayAmount),
    })

    router.push(`/dat-ve/${routeParams.sessionId}/confirm?${confirmParams.toString()}`)
  }, [displayAgeRating, displayAmount, displayMoviePoster, displayMovieTitle, displayRoomName, displaySeats, displayShowtimeTime, routeParams.sessionId, router])

  useEffect(() => {
    const pollingBookingId = payosInfo?.bookingId
    if (typeof pollingBookingId !== 'string' || !pollingBookingId || paymentPaid) return
    const bookingIdForPolling = pollingBookingId

    let cancelled = false

    async function pollStatus() {
      try {
        const accessToken = Cookies.get('ACCESS_TOKEN')
        const statusRes = await API_GetBookingPaymentStatus(bookingIdForPolling, accessToken)
        if (cancelled) return

        const rawStatus = normalizeStatusText(
          statusRes.status ??
          statusRes.payment_status ??
          statusRes.payos_status ??
          statusRes.data?.status ??
          statusRes.data?.payment_status ??
          statusRes.data?.payos_status,
        )
        const paid = Boolean(statusRes.is_paid ?? statusRes.data?.is_paid ?? statusRes.data?.paid)

        if (rawStatus) setPaymentStatus(rawStatus)
        const isPaid = isFinalPaidStatus(rawStatus, paid)
        setPaymentPaid(isPaid)
        setPollingError('')

        if (isPaid) {
          goToConfirm(bookingIdForPolling)
        }
      } catch (error) {
        if (!cancelled) {
          setPollingError(getApiErrorMessage(error, 'Chưa kiểm tra được trạng thái thanh toán.'))
        }
      }
    }

    void pollStatus()
    const timer = window.setInterval(() => void pollStatus(), 3000)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [goToConfirm, paymentPaid, payosInfo?.bookingId])

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
    const visited = new Set<unknown>()
    const idKeys = new Set(['booking_id', 'bookingId', 'id', 'uuid', 'booking_uuid'])

    function scan(value: unknown): string | null {
      if (value == null) return null
      if (typeof value === 'string' || typeof value === 'number') return null
      if (typeof value !== 'object') return null
      if (visited.has(value)) return null
      visited.add(value)

      if (Array.isArray(value)) {
        for (const item of value) {
          const found = scan(item)
          if (found) return found
        }
        return null
      }

      const record = value as Record<string, unknown>
      for (const key of idKeys) {
        const found = coerceBookingId(record[key])
        if (found) return found
      }

      for (const [key, child] of Object.entries(record)) {
        if (key.toLowerCase().includes('booking')) {
          const found = scan(child)
          if (found) return found
        }
      }

      for (const child of Object.values(record)) {
        const found = scan(child)
        if (found) return found
      }

      return null
    }

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

    return scan(payload)
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
        console.error('Create PayOS payment: response had no checkoutUrl', payRes)
        throw new Error('Không lấy được checkoutUrl để tạo QR PayOS.')
      }
      if (!payRes.payment_code && !payRes.order_code && !payRes.payment_id) {
        console.error('Create PayOS payment: response had no displayable code', payRes)
        throw new Error('Không lấy được mã thanh toán PayOS.')
      }
      setPayosInfo({ ...payRes, bookingId })
      setPaymentStatus(normalizeStatusText(payRes.payment_status || payRes.payos_status))
      setPaymentPaid(false)
      setPollingError('')
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
    const bookingId = payosInfo?.bookingId || bookingIdInQuery
    if (!bookingId) {
      alert('Thiếu bookingId để kiểm tra trạng thái.')
      return
    }
    try {
      const accessToken = Cookies.get('ACCESS_TOKEN')
      const statusRes = await API_GetBookingPaymentStatus(bookingId, accessToken)
      const rawStatus = normalizeStatusText(statusRes.status ?? statusRes.payment_status ?? statusRes.payos_status ?? statusRes.data?.status ?? statusRes.data?.payment_status ?? statusRes.data?.payos_status)
      const isPaid = isFinalPaidStatus(rawStatus, Boolean(statusRes.is_paid ?? statusRes.data?.is_paid ?? statusRes.data?.paid))
      setPaymentStatus(rawStatus)
      setPaymentPaid(isPaid)
      if (isPaid) {
        goToConfirm(bookingId)
        return
      }
      alert(statusRes.data?.message || `Trạng thái thanh toán: ${rawStatus || 'không rõ'}`)
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

          {payosInfo ? (
            <div className="mt-8 rounded-3xl border border-yellow-400/70 bg-zinc-950 p-6 text-white shadow-[0_0_45px_rgba(250,204,21,0.18)]">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400 text-black shadow-lg shadow-yellow-500/25">
                    <QrCode className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-black uppercase">Thanh toán PayOS</h2>
                    <p className="mt-1 text-xs font-bold text-zinc-500">Quét QR và chuyển đúng số tiền hiển thị</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${paymentPaid ? 'bg-emerald-500/15 text-emerald-300' : 'bg-yellow-500/15 text-yellow-300'}`}>
                  {paymentPaid ? 'Đã thanh toán' : serverPaymentStatus || 'Đang chờ thanh toán'}
                </span>
              </div>
              {qrPayload ? (
                <div className="rounded-2xl border border-yellow-400/30 bg-black/35 p-5 shadow-inner">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                    <PayosQrImage imageDataUrl={payosInfo.qr_image_data_url} value={qrPayload} />
                    <div className="min-w-0 flex-1 space-y-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Số tiền</p>
                        <p className="mt-1 text-4xl font-black text-yellow-400">{formatVnd(displayAmount)}</p>
                      </div>
                      <div className="rounded-2xl border border-yellow-400/20 bg-zinc-900/80 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Ngân hàng</p>
                            <p className="mt-1 text-2xl font-black text-emerald-300">{bankDisplay.code}</p>
                            <p className="mt-1 text-xs font-bold text-zinc-500">{bankDisplay.name}</p>
                          </div>
                          <span className="rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-black text-emerald-300">VIETQR</span>
                        </div>
                        <div className="pt-4">
                          <p className="text-xl font-black text-white">{payosInfo.account_name || 'PayOS'}</p>
                          <p className="mt-1 break-all text-3xl font-black tracking-wide text-white">{payosInfo.account_number || 'Theo mã QR'}</p>
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-yellow-400/20 bg-zinc-900/80 p-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Trạng thái</p>
                          <p className={`mt-2 text-base font-black ${paymentPaid ? 'text-emerald-300' : 'text-yellow-300'}`}>
                            {paymentPaid ? 'Đã thanh toán' : serverPaymentStatus || 'Đang chờ'}
                          </p>
                        </div>
                      </div>
                      {!paymentPaid ? <p className="text-xs font-bold text-zinc-500">Hệ thống tự kiểm tra trạng thái mỗi 3 giây.</p> : null}
                      {pollingError ? <p className="text-xs font-bold text-red-300">{pollingError}</p> : null}
                    </div>
                  </div>
                </div>
              ) : null}
              {payosInfo.description ? (
                <p className="mt-4 text-sm font-medium text-zinc-400">{payosInfo.description}</p>
              ) : null}
            </div>
          ) : null}

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
              <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
                <div className="flex gap-4">
                  <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-900">
                    {displayMoviePoster ? (
                      <Image src={displayMoviePoster} alt={displayMovieTitle} fill sizes="96px" className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] font-black uppercase text-zinc-600">Poster</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-zinc-600">Thông tin phim</p>
                    <h3 className="line-clamp-2 text-base font-black uppercase leading-snug text-white">{displayMovieTitle}</h3>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between gap-3 text-zinc-400">
                        <span>Suất chiếu</span>
                        <span className="font-bold text-white">{displayShowtimeTime || 'Chưa rõ'}</span>
                      </div>
                      <div className="flex justify-between gap-3 text-zinc-400">
                        <span>Phòng</span>
                        <span className="font-bold text-white">{displayRoomName}</span>
                      </div>
                      <div className="flex justify-between gap-3 text-zinc-400">
                        <span>Phân loại</span>
                        <span className="rounded bg-yellow-500/15 px-2 py-0.5 text-xs font-black text-yellow-500">{displayAgeRating || 'P'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-zinc-600">Ghế</p>
                <div className="flex flex-wrap gap-2">
                  {displaySeats.length > 0 ? displaySeats.map(seat => (
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
              {displayFoodItems.length > 0 ? displayFoodItems.map(item => (
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
                  <span className="font-bold text-white">{formatVnd(displayFoodTotal)}</span>
                </div>
                <div className="mt-5 flex items-end justify-between border-t border-zinc-800 pt-5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Cần thanh toán</span>
                  <span className="text-3xl font-black text-yellow-500">{formatVnd(displayAmount)}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleConfirmPayment()}
              disabled={submitting || Boolean(payosInfo)}
              className="mt-7 w-full rounded-xl bg-yellow-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-black transition hover:bg-yellow-400"
            >
              {payosInfo ? 'Đã tạo mã thanh toán' : submitting ? 'Đang tạo thanh toán...' : 'Xác nhận thanh toán'}
            </button>
            {bookingIdInQuery || payosInfo ? (
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

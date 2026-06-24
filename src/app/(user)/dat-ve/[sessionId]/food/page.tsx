'use client'

/**
 * Bước đặt vé: chọn đồ ăn/nước. Query giữ movieId, roomId, seats, ticketTotal từ bước chọn ghế.
 * Tải sản phẩm ACTIVE, cộng tiền → đẩy sang /payment kèm food JSON + tổng.
 */
import { useEffect, useMemo, useState } from 'react'
import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

import { API_GetProducts, displayCategory, type ProductDto } from '@/src/api/API_Product'
import BookingProgressBar from '@/src/component/user/bookingProgressBar'
import { formatVnd } from '@/src/lib/utils'

function categoryBadge(category: string) {
  return displayCategory(category).toUpperCase()
}

export default function FoodPage() {
  const router = useRouter()
  const routeParams = useParams<{ sessionId: string }>()
  const searchParams = useSearchParams()
  const movieId = searchParams.get('movieId') || ''
  const roomId = searchParams.get('roomId') || ''
  const selectedSeats = useMemo(
    () => searchParams.get('seats')?.split(',').filter(Boolean) || [],
    [searchParams],
  )
  const selectedSeatIds = useMemo(
    () => searchParams.get('seatIds')?.split(',').filter(Boolean) || [],
    [searchParams],
  )
  const ticketTotal = Number(searchParams.get('ticketTotal') || 0)
  /** Số lượng theo product id (local state, chưa gọi API giữ giỏ). */
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [foodItems, setFoodItems] = useState<ProductDto[]>([])
  const [loadState, setLoadState] = useState<'loading' | 'error' | 'ready'>('loading')
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoadState('loading')
        setLoadError(null)
        const all = await API_GetProducts()
        if (cancelled) return
        // Chỉ hiển thị món đang bán; backend có thể trả cả INACTIVE.
        const active = all.filter(p => p.status === 'ACTIVE')
        setFoodItems(active)
        setLoadState('ready')
      } catch {
        if (cancelled) return
        setFoodItems([])
        setLoadError('Không tải được thực đơn. Thử lại sau.')
        setLoadState('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const foodTotal = foodItems.reduce((total, item) => total + (quantities[item.id] || 0) * item.price, 0)
  const orderTotal = ticketTotal + foodTotal
  const selectedFood = foodItems
    .map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: quantities[item.id] || 0,
    }))
    .filter(item => item.quantity > 0)

  const updateQuantity = (id: string, nextQuantity: number, maxStock: number) => {
    const capped = Math.min(Math.max(0, nextQuantity), maxStock)
    setQuantities(prev => ({
      ...prev,
      [id]: capped,
    }))
  }

  // Truyền tiếp context đặt vé + chi tiết đồ ăn (JSON trong query — đủ cho demo; production có thể dùng session/store).
  const goToPayment = () => {
    const paymentParams = new URLSearchParams({
      movieId,
      roomId,
      seats: selectedSeats.join(','),
      seatIds: selectedSeatIds.join(','),
      ticketTotal: String(ticketTotal),
      foodTotal: String(foodTotal),
      total: String(orderTotal),
      food: JSON.stringify(selectedFood),
    })

    router.push(`/dat-ve/${routeParams.sessionId}/payment?${paymentParams.toString()}`)
  }

  return (
    <div className="min-h-screen bg-black pb-16 pt-16 text-white lg:pt-20">
      <BookingProgressBar currentStep={2} />
      
      <div className="mx-auto mt-10 grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <section>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-yellow-500">Bước tiếp theo</p>
              <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">Chọn bắp nước</h1>
            </div>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="rounded-xl border border-zinc-700 px-5 py-3 text-xs font-black uppercase tracking-widest text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
            >
              Quay lại
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {loadState === 'loading' && (
              <p className="col-span-full py-16 text-center text-sm font-medium text-zinc-500">Đang tải thực đơn…</p>
            )}
            {loadState === 'error' && (
              <p className="col-span-full py-16 text-center text-sm font-medium text-red-400">{loadError}</p>
            )}
            {loadState === 'ready' && foodItems.length === 0 && (
              <p className="col-span-full py-16 text-center text-sm font-medium text-zinc-500">Hiện chưa có món đang bán.</p>
            )}
            {loadState === 'ready' &&
              foodItems.map(item => {
                const quantity = quantities[item.id] || 0
                const maxQty = Math.max(0, item.stock)
                const outOfStock = maxQty === 0
                const description = outOfStock ? 'Tạm hết hàng' : `Còn ${item.stock} phần`

                return (
                  <article key={item.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <span className="mb-3 inline-flex rounded-full bg-yellow-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-yellow-500">
                          {categoryBadge(item.category)}
                        </span>
                        <h2 className="text-xl font-black uppercase text-white">{item.name}</h2>
                        <p className="mt-2 text-sm font-medium leading-6 text-zinc-500">{description}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <p className="whitespace-nowrap text-lg font-black text-yellow-500">{formatVnd(item.price)}</p>
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt=""
                            className="h-14 w-14 rounded-lg border border-zinc-800 object-cover"
                          />
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-zinc-900 p-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, quantity - 1, maxQty)}
                        disabled={quantity === 0}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label={`Giảm ${item.name}`}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-10 text-center text-lg font-black">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, quantity + 1, maxQty)}
                        disabled={outOfStock || quantity >= maxQty}
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500 text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label={`Tăng ${item.name}`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                )
              })}
          </div>
        </section>

        <aside className="lg:pt-[84px]">
          <div className="sticky top-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500 text-black">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-black uppercase">Tóm tắt đơn</h2>
                <p className="text-xs font-medium text-zinc-500">Ghế và bắp nước đã chọn</p>
              </div>
            </div>

            <div className="mb-6 border-b border-zinc-800 pb-6">
              <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-zinc-600">Ghế</p>
              <div className="flex flex-wrap gap-2">
                {selectedSeats.length > 0 ? selectedSeats.map(seat => (
                  <span key={seat} className="rounded-lg border border-yellow-500/20 bg-zinc-900 px-3 py-2 text-xs font-black text-yellow-500">
                    {seat}
                  </span>
                )) : (
                  <span className="text-sm text-zinc-600">Chưa có ghế</span>
                )}
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Tiền vé</span>
                <span className="font-bold text-white">{formatVnd(ticketTotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Bắp nước</span>
                <span className="font-bold text-white">{formatVnd(foodTotal)}</span>
              </div>
              <div className="mt-5 border-t border-zinc-800 pt-5">
                <div className="flex items-end justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Tổng cộng</span>
                  <span className="text-2xl font-black text-yellow-500">{formatVnd(orderTotal)}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={goToPayment}
              className="mt-7 w-full rounded-xl bg-yellow-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-black transition hover:bg-yellow-400"
            >
              Tiếp tục
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

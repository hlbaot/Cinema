'use client'

import { useMemo, useState } from 'react'
import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import BookingProgressBar from '@/src/component/user/bookingProgressBar'

type FoodItem = {
  id: string
  name: string
  description: string
  price: number
  badge: string
}

const foodItems: FoodItem[] = [
  {
    id: 'combo-1',
    name: 'Combo Solo',
    description: '1 bắp rang bơ vừa và 1 nước ngọt vừa',
    price: 69000,
    badge: '1 người',
  },
  {
    id: 'combo-2',
    name: 'Combo Couple',
    description: '1 bắp rang bơ lớn và 2 nước ngọt vừa',
    price: 119000,
    badge: '2 người',
  },
  {
    id: 'combo-family',
    name: 'Combo Family',
    description: '2 bắp rang bơ lớn và 4 nước ngọt vừa',
    price: 219000,
    badge: 'Nhóm',
  },
  {
    id: 'popcorn-caramel',
    name: 'Bắp Caramel',
    description: 'Bắp rang phủ caramel giòn ngọt',
    price: 59000,
    badge: 'Món lẻ',
  },
  {
    id: 'coke',
    name: 'Nước Ngọt',
    description: 'Coca-Cola, Sprite hoặc Fanta size vừa',
    price: 39000,
    badge: 'Món lẻ',
  },
]

export default function FoodPage() {
  const searchParams = useSearchParams()
  const selectedSeats = useMemo(
    () => searchParams.get('seats')?.split(',').filter(Boolean) || [],
    [searchParams],
  )
  const ticketTotal = Number(searchParams.get('ticketTotal') || 0)
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const foodTotal = foodItems.reduce((total, item) => total + (quantities[item.id] || 0) * item.price, 0)
  const orderTotal = ticketTotal + foodTotal

  const updateQuantity = (id: string, nextQuantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, nextQuantity),
    }))
  }

  return (
    <div className="min-h-screen bg-black pb-16 text-white">
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
            {foodItems.map(item => {
              const quantity = quantities[item.id] || 0

              return (
                <article key={item.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <span className="mb-3 inline-flex rounded-full bg-yellow-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-yellow-500">
                        {item.badge}
                      </span>
                      <h2 className="text-xl font-black uppercase text-white">{item.name}</h2>
                      <p className="mt-2 text-sm font-medium leading-6 text-zinc-500">{item.description}</p>
                    </div>
                    <p className="whitespace-nowrap text-lg font-black text-yellow-500">{item.price.toLocaleString()} đ</p>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-zinc-900 p-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, quantity - 1)}
                      disabled={quantity === 0}
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label={`Giảm ${item.name}`}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-10 text-center text-lg font-black">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, quantity + 1)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500 text-black transition hover:bg-yellow-400"
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
                <span className="font-bold text-white">{ticketTotal.toLocaleString()} đ</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Bắp nước</span>
                <span className="font-bold text-white">{foodTotal.toLocaleString()} đ</span>
              </div>
              <div className="mt-5 border-t border-zinc-800 pt-5">
                <div className="flex items-end justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Tổng cộng</span>
                  <span className="text-2xl font-black text-yellow-500">{orderTotal.toLocaleString()} đ</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="mt-7 w-full rounded-xl bg-yellow-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-black transition hover:bg-yellow-400"
            >
              Tiếp tục thanh toán
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

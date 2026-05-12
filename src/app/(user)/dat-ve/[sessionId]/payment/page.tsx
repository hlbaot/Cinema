'use client'

import { useMemo, useState } from 'react'
import { CreditCard, Landmark, QrCode, ReceiptText, ShieldCheck } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import BookingProgressBar from '@/src/component/user/bookingProgressBar'
import { formatVnd } from '@/src/lib/utils'

type SelectedFoodItem = {
  id: string
  name: string
  price: number
  quantity: number
}

const paymentMethods = [
  {
    id: 'momo',
    label: 'Ví MoMo',
    description: 'Quét QR hoặc xác nhận trong ứng dụng',
    icon: QrCode,
  },
  {
    id: 'card',
    label: 'Thẻ ngân hàng',
    description: 'Visa, Mastercard, Napas',
    icon: CreditCard,
  },
  {
    id: 'bank',
    label: 'Chuyển khoản',
    description: 'Thanh toán qua tài khoản ngân hàng',
    icon: Landmark,
  },
]

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
  const searchParams = useSearchParams()
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0].id)
  const seats = useMemo(
    () => searchParams.get('seats')?.split(',').filter(Boolean) || [],
    [searchParams],
  )
  const foodItems = useMemo(
    () => parseFoodParam(searchParams.get('food')),
    [searchParams],
  )
  const ticketTotal = Number(searchParams.get('ticketTotal') || 0)
  const foodTotal = Number(searchParams.get('foodTotal') || 0)
  const total = Number(searchParams.get('total') || ticketTotal + foodTotal)

  return (
    <div className="min-h-screen bg-black pb-16 text-white">
      <BookingProgressBar currentStep={3} />

      <div className="mx-auto mt-10 grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
        <section>
          <div className="mb-8">
            <p className="mb-2 text-xs font-black uppercase tracking-widest text-yellow-500">Thanh toán</p>
            <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">Chọn phương thức thanh toán</h1>
          </div>

          <div className="grid gap-4">
            {paymentMethods.map(method => {
              const Icon = method.icon
              const isSelected = selectedMethod === method.id

              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method.id)}
                  className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition ${
                    isSelected
                      ? 'border-yellow-500 bg-yellow-500/10'
                      : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                  }`}
                >
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    isSelected ? 'bg-yellow-500 text-black' : 'bg-zinc-900 text-zinc-400'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-black uppercase text-white">{method.label}</span>
                    <span className="mt-1 block text-sm font-medium text-zinc-500">{method.description}</span>
                  </span>
                  <span className={`h-4 w-4 rounded-full border ${
                    isSelected ? 'border-yellow-500 bg-yellow-500' : 'border-zinc-700'
                  }`} />
                </button>
              )
            })}
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
              className="mt-7 w-full rounded-xl bg-yellow-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-black transition hover:bg-yellow-400"
            >
              Xác nhận thanh toán
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

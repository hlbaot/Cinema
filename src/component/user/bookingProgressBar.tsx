'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'

/**
 * Thanh 5 bước đặt vé. currentStep là index 0-based khớp thứ tự trong mảng steps
 * (vd: trang chọn ghế dùng 1, trang food dùng 2 — xem từng page).
 */
interface ProgressBarProps {
  currentStep: number
}

const steps = [
  'Chọn phim/ suất',
  'Chọn ghế',
  'Chọn Bắp Nước',
  'Thanh toán',
  'Xác nhận'
]

export default function BookingProgressBar({ currentStep }: ProgressBarProps) {
  const router = useRouter()
  const params = useParams<{ sessionId?: string }>()
  const searchParams = useSearchParams()

  const getStepHref = (stepIndex: number) => {
    const query = searchParams.toString()
    const suffix = query ? `?${query}` : ''
    const sessionId = params.sessionId

    if (stepIndex === 0) return '/lichChieu'
    if (!sessionId) return null

    if (stepIndex === 1) return `/dat-ve/${sessionId}${suffix}`
    if (stepIndex === 2) return `/dat-ve/${sessionId}/food${suffix}`
    if (stepIndex === 3) return `/dat-ve/${sessionId}/payment${suffix}`
    if (stepIndex === 4) return `/dat-ve/${sessionId}/confirm${suffix}`

    return null
  }

  return (
    <div className="w-full bg-zinc-950 border-b border-zinc-800/60 py-4 shadow-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-6 sm:gap-14 overflow-x-auto no-scrollbar">
          {steps.map((step, index) => {
            const isActive = index === currentStep
            const isCompleted = index < currentStep
            const href = isCompleted ? getStepHref(index) : null

            return (
              <button
                key={step}
                type="button"
                disabled={!href}
                onClick={() => {
                  if (href) router.push(href)
                }}
                className={`flex items-center gap-2 whitespace-nowrap ${href ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span className={`text-[11px] font-black tracking-[0.1em] transition-all pb-1.5 border-b-2 uppercase ${
                  isActive ? 'text-yellow-500 border-yellow-500' : 
                  isCompleted ? 'text-zinc-500 border-transparent hover:text-yellow-400' : 'text-zinc-700 border-transparent'
                }`}>
                  {step}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

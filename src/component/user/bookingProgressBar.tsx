'use client'

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
  return (
    <div className="w-full bg-zinc-950 border-b border-zinc-800/60 py-4 shadow-xl sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-6 sm:gap-14 overflow-x-auto no-scrollbar">
          {steps.map((step, index) => {
            const isActive = index === currentStep
            const isCompleted = index < currentStep

            return (
              <div key={step} className="flex items-center gap-2 whitespace-nowrap">
                <span className={`text-[11px] font-black tracking-[0.1em] transition-all pb-1.5 border-b-2 uppercase ${
                  isActive ? 'text-yellow-500 border-yellow-500' : 
                  isCompleted ? 'text-zinc-500 border-transparent' : 'text-zinc-700 border-transparent'
                }`}>
                  {step}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

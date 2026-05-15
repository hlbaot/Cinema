'use client'

/**
 * Quét QR vé bằng html5-qrcode (luôn mở).
 * Luồng: Tự động bật camera khi mount → đọc mã liên tục (có cooldown) → gọi onScan(text).
 */
import { useEffect, useId, useRef, useState } from 'react'
import type { Html5Qrcode } from 'html5-qrcode'
import { Loader2 } from 'lucide-react'

type Props = {
  /** Gọi khi đọc được QR (đã trim). */
  onScan: (decodedText: string) => void | Promise<void>
  /** Khóa việc nhận diện khi đang gọi API verify */
  disabled?: boolean
}

export default function QrTicketScanner({ onScan, disabled }: Props) {
  const rawId = useId()
  const readerId = `staff-qr-${rawId.replace(/:/g, '')}`
  const scannerRef = useRef<Html5Qrcode | null>(null)
  
  const onScanRef = useRef(onScan)
  const disabledRef = useRef(disabled)
  const lastScanTimeRef = useRef(0)

  onScanRef.current = onScan
  disabledRef.current = disabled

  const [starting, setStarting] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Khởi tạo scanner ngay khi mount
  useEffect(() => {
    let cancelled = false
    let scannerInstance: Html5Qrcode | null = null

    ;(async () => {
      setStarting(true)
      setError(null)
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        if (cancelled) return

        // Đảm bảo element đã tồn tại trong DOM
        if (!document.getElementById(readerId)) {
          await new Promise(r => setTimeout(r, 100))
          if (cancelled) return
          if (!document.getElementById(readerId)) {
            setError('Không tìm thấy vùng hiển thị camera.')
            setStarting(false)
            return
          }
        }

        const scanner = new Html5Qrcode(readerId, { verbose: false })
        scannerInstance = scanner
        scannerRef.current = scanner

        const config = { fps: 10, qrbox: { width: 260, height: 260 } as const }

        const onOk = (decodedText: string) => {
          // Bỏ qua nếu đang bận hoặc trong thời gian cooldown (3 giây)
          if (cancelled || disabledRef.current) return
          
          const now = Date.now()
          if (now - lastScanTimeRef.current < 3000) return
          
          const t = decodedText.trim()
          if (t) {
            lastScanTimeRef.current = now
            onScanRef.current(t)
          }
        }

        try {
          // Ưu tiên camera sau (điện thoại); thất bại thì thử camera đầu tiên.
          await scanner.start({ facingMode: 'environment' }, config, onOk, () => {})
        } catch {
          const cams = await Html5Qrcode.getCameras()
          if (cancelled) return
          if (!cams.length) throw new Error('Không tìm thấy camera hoặc thiếu quyền truy cập.')
          await scanner.start({ deviceId: { exact: cams[0].id } }, config, onOk, () => {})
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Không mở được camera (Yêu cầu HTTPS + quyền camera).')
        }
      } finally {
        if (!cancelled) setStarting(false)
      }
    })()

    return () => {
      cancelled = true
      if (scannerInstance) {
        void scannerInstance.stop().catch(() => {}).then(() => {
          try {
            scannerInstance?.clear()
          } catch {
            /* */
          }
        })
      }
      scannerRef.current = null
    }
  }, [readerId])

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-5">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-white">Quét mã QR</h2>
        <p className="mt-0.5 text-xs text-zinc-500">
          Camera luôn bật. Vui lòng đưa mã QR trên vé vào khung hình bên dưới.
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-900/50 bg-red-950/20 p-4 text-sm text-red-400">
          {error}
        </div>
      ) : null}

      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-black">
        {starting && !error && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/70 text-sm text-zinc-300">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            Đang bật camera…
          </div>
        )}
        <div 
          id={readerId} 
          className="min-h-[240px] w-full [&_video]:max-h-[min(55vh,420px)]" 
        />
      </div>
      
      {disabled && !starting && (
        <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-emerald-500 animate-pulse">
          <Loader2 className="h-3 w-3 animate-spin" />
          Đang xử lý mã vừa quét...
        </div>
      )}
    </div>
  )
}

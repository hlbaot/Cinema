'use client'

import { useEffect, useId, useRef, useState } from 'react'
import type { Html5Qrcode } from 'html5-qrcode'
import { Camera, CameraOff, Loader2 } from 'lucide-react'

type Props = {
  /** Gọi khi đọc được QR (đã trim). Camera sẽ tắt trước khi gọi. */
  onScan: (decodedText: string) => void | Promise<void>
  /** Khóa nút khi đang gọi API verify */
  disabled?: boolean
}

export default function QrTicketScanner({ onScan, disabled }: Props) {
  const rawId = useId()
  const readerId = `staff-qr-${rawId.replace(/:/g, '')}`
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const onScanRef = useRef(onScan)
  const doneRef = useRef(false)

  onScanRef.current = onScan

  const [open, setOpen] = useState(false)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    doneRef.current = false
    let cancelled = false

    ;(async () => {
      setStarting(true)
      setError(null)
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        if (cancelled) return

        if (!document.getElementById(readerId)) {
          setError('Không tìm thấy vùng hiển thị camera.')
          setStarting(false)
          return
        }

        const scanner = new Html5Qrcode(readerId, { verbose: false })
        scannerRef.current = scanner

        const config = { fps: 8, qrbox: { width: 260, height: 260 } as const }

        const finish = async (text: string) => {
          if (doneRef.current) return
          doneRef.current = true
          const t = text.trim()
          if (!t) {
            doneRef.current = false
            return
          }
          try {
            await scanner.stop()
            scanner.clear()
          } catch {
            /* */
          }
          scannerRef.current = null
          if (!cancelled) {
            setOpen(false)
            setStarting(false)
            onScanRef.current(t)
          }
        }

        const onOk = (decodedText: string) => {
          void finish(decodedText)
        }

        try {
          await scanner.start({ facingMode: 'environment' }, config, onOk, () => {})
        } catch {
          const cams = await Html5Qrcode.getCameras()
          if (cancelled || !cams.length) throw new Error('Không có camera.')
          await scanner.start({ deviceId: { exact: cams[0].id } }, config, onOk, () => {})
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Không mở được camera (HTTPS + quyền camera).')
          const s = scannerRef.current
          scannerRef.current = null
          if (s) {
            try {
              await s.stop()
              s.clear()
            } catch {
              /* */
            }
          }
          setOpen(false)
        }
      } finally {
        if (!cancelled) setStarting(false)
      }
    })()

    return () => {
      cancelled = true
      const s = scannerRef.current
      scannerRef.current = null
      if (s) {
        void s.stop().catch(() => {})
        try {
          s.clear()
        } catch {
          /* */
        }
      }
      setStarting(false)
    }
  }, [open, readerId])

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white">Quét mã QR</h2>
          <p className="mt-0.5 text-xs text-zinc-500">Camera sau nếu có. Cho phép quyền camera trên trình duyệt.</p>
        </div>
        {!open ? (
          <button
            type="button"
            disabled={disabled || starting}
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/25 transition hover:bg-emerald-500 disabled:opacity-45"
          >
            <Camera className="h-4 w-4" />
            Mở camera
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-700"
          >
            <CameraOff className="h-4 w-4" />
            Tắt camera
          </button>
        )}
      </div>

      {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}

      {open ? (
        <div className="relative mt-4 overflow-hidden rounded-xl border border-zinc-800 bg-black">
          {starting && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/70 text-sm text-zinc-300">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
              Đang bật camera…
            </div>
          )}
          <div id={readerId} className="min-h-[240px] w-full [&_video]:max-h-[min(55vh,420px)]" />
        </div>
      ) : null}
    </div>
  )
}

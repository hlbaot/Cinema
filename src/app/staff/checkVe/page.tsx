'use client'

import { useCallback, useState } from 'react'
import { API_VerifyTicket, type TicketVerifyDetail } from '@/src/api/API_Staff'
import QrTicketScanner from '@/src/component/staff/QrTicketScanner'

function DetailBlock({ detail }: { detail: TicketVerifyDetail }) {
  return (
    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
      {detail.movieTitle ? (
        <>
          <dt className="font-semibold text-zinc-500">Phim</dt>
          <dd className="text-zinc-100">{detail.movieTitle}</dd>
        </>
      ) : null}
      {detail.showtime ? (
        <>
          <dt className="font-semibold text-zinc-500">Suất</dt>
          <dd className="text-zinc-100">
            {Number.isNaN(Date.parse(detail.showtime)) ? detail.showtime : new Date(detail.showtime).toLocaleString('vi-VN')}
          </dd>
        </>
      ) : null}
      {detail.roomName ? (
        <>
          <dt className="font-semibold text-zinc-500">Phòng</dt>
          <dd className="text-zinc-100">{detail.roomName}</dd>
        </>
      ) : null}
      {detail.seats && detail.seats.length > 0 ? (
        <>
          <dt className="font-semibold text-zinc-500">Ghế</dt>
          <dd className="text-zinc-100">{detail.seats.join(', ')}</dd>
        </>
      ) : null}
      {detail.status ? (
        <>
          <dt className="font-semibold text-zinc-500">Trạng thái</dt>
          <dd className="text-zinc-100">{detail.status}</dd>
        </>
      ) : null}
    </dl>
  )
}

export default function StaffCheckTicketPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Awaited<ReturnType<typeof API_VerifyTicket>> | null>(null)

  const runVerify = useCallback(async (rawCode: string) => {
    const c = rawCode.trim()
    if (!c) return
    setLoading(true)
    setResult(null)
    try {
      const out = await API_VerifyTicket(c)
      setResult(out)
      setCode(c)
    } finally {
      setLoading(false)
    }
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    void runVerify(code)
  }

  return (
    <section className="mx-auto max-w-5xl rounded-[2rem] border border-zinc-800 bg-zinc-900/60 p-8 shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-sm">
      <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-500">Nhân viên</p>
      <h1 className="text-3xl font-bold tracking-tight text-white">Check vé</h1>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
        Nhập mã thủ công hoặc quét <strong className="text-zinc-200">QR trên vé</strong> (nội dung QR thường là mã vé / URL — hệ thống sẽ gửi nguyên chuỗi đọc được tới API). Mặc định:{' '}
        <code className="rounded-md border border-zinc-700 bg-zinc-950 px-1.5 py-0.5 text-xs text-emerald-400">POST …/tickets/verify</code> — chỉnh trong{' '}
        <code className="rounded-md border border-zinc-700 bg-zinc-950 px-1.5 py-0.5 text-xs text-emerald-400">API_Staff.ts</code>. Mã <strong className="text-emerald-400">DEMO…</strong> luôn hợp lệ.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-start">
        <div>
          <h2 className="mb-3 text-sm font-bold text-zinc-200">Nhập tay</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-semibold text-zinc-300">Mã vé</label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="VD: ABC123 hoặc DEMO-001"
                className="min-h-12 flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white placeholder-zinc-600 outline-none ring-emerald-500/30 focus:border-emerald-500/50 focus:ring-2"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={loading}
                className="min-h-12 shrink-0 rounded-xl bg-emerald-600 px-8 text-sm font-bold text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-500 disabled:opacity-50"
              >
                {loading ? 'Đang kiểm tra…' : 'Kiểm tra'}
              </button>
            </div>
          </form>
        </div>

        <QrTicketScanner onScan={runVerify} disabled={loading} />
      </div>

      {result ? (
        <div
          className={`mt-8 rounded-2xl border p-6 ${
            result.valid
              ? 'border-emerald-500/35 bg-emerald-950/30 text-emerald-50'
              : 'border-red-500/35 bg-red-950/25 text-red-50'
          }`}
        >
          <p className={`text-lg font-bold ${result.valid ? 'text-emerald-300' : 'text-red-300'}`}>
            {result.valid ? 'Cho phép vào rạp' : 'Không hợp lệ'}
          </p>
          <p className={`mt-1 text-sm ${result.valid ? 'text-emerald-200/85' : 'text-red-200/85'}`}>{result.message}</p>
          {result.valid && result.detail ? <DetailBlock detail={result.detail} /> : null}
          <p className={`mt-4 text-xs ${result.valid ? 'text-emerald-500/80' : 'text-red-400/70'}`}>
            Nguồn: {result.source === 'api' ? 'Máy chủ' : 'Demo / cục bộ'}
          </p>
        </div>
      ) : null}

      <div className="mt-10 rounded-xl border border-dashed border-zinc-700 bg-zinc-950/50 p-4 text-xs leading-relaxed text-zinc-500">
        Quét QR cần HTTPS (hoặc localhost) và quyền camera. Nếu QR là URL, backend cần chấp nhận chuỗi đó hoặc bạn tách mã phía server.
      </div>
    </section>
  )
}

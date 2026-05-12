'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { API_GetStaffTicketSales, type StaffTicketSaleDto } from '@/src/api/API_Staff'
import { appendLocalTicketSale, loadLocalTicketSales, type StaffTicketSaleLocal } from '@/src/lib/staff-sales-storage'
import { formatVnd } from '@/src/lib/utils'

function localToDto(row: StaffTicketSaleLocal): StaffTicketSaleDto {
  return {
    id: row.id,
    code: row.code,
    movieTitle: row.movieInfo,
    showtime: undefined,
    seats: row.seats
      .split(',')
      .map(s => s.trim())
      .filter(Boolean),
    amountVnd: row.amountVnd,
    status: 'Ghi tay',
    createdAt: row.createdAt,
  }
}

function formatTime(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('vi-VN')
}

const card =
  'rounded-[2rem] border border-zinc-800 bg-zinc-900/60 p-8 shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-sm'

export default function StaffTicketsPage() {
  const [apiRows, setApiRows] = useState<StaffTicketSaleDto[]>([])
  const [localVersion, setLocalVersion] = useState(0)
  const [loading, setLoading] = useState(true)
  const [hint, setHint] = useState<string | null>(null)

  const [form, setForm] = useState({ code: '', movieInfo: '', seats: '', amountVnd: '' })

  const refresh = useCallback(async () => {
    setLoading(true)
    setHint(null)
    try {
      const fromApi = await API_GetStaffTicketSales(1, 100)
      setApiRows(fromApi)
      if (fromApi.length === 0) {
        setHint('Chưa có dữ liệu từ API (GET …/staff/ticket-sales). Có thể ghi bán thủ công bên dưới — lưu trên trình duyệt.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const merged = useMemo(() => {
    const local = loadLocalTicketSales().map(localToDto)
    const apiIds = new Set(apiRows.map(r => r.id))
    const extraLocal = local.filter(l => !apiIds.has(l.id))
    return [...apiRows, ...extraLocal].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [apiRows, localVersion])

  function addManual(e: React.FormEvent) {
    e.preventDefault()
    const amount = Number(form.amountVnd.trim().replace(/\s/g, '').replace(/\./g, ''))
    if (!form.code.trim() || !Number.isFinite(amount) || amount < 0) return
    appendLocalTicketSale({
      code: form.code.trim(),
      movieInfo: form.movieInfo.trim() || '—',
      seats: form.seats.trim() || '—',
      amountVnd: amount,
    })
    setForm({ code: '', movieInfo: '', seats: '', amountVnd: '' })
    setLocalVersion(v => v + 1)
  }

  const inputClass =
    'rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500/45 focus:ring-1 focus:ring-emerald-500/30'

  return (
    <div className="space-y-8">
      <section className={card}>
        <h1 className="text-3xl font-bold tracking-tight text-white">Quản lý bán vé</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
          Danh sách giao dịch: ưu tiên từ API, đồng thời hiển thị các lần <strong className="text-zinc-200">ghi tay</strong> lưu trên trình duyệt (cùng máy).
        </p>
        {hint ? (
          <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-950/35 px-4 py-3 text-sm text-amber-200/95">{hint}</p>
        ) : null}
      </section>

      <section className={card}>
        <h2 className="text-lg font-bold text-white">Ghi bán thủ công</h2>
        <p className="mt-1 text-sm text-zinc-500">Dùng khi chưa có API hoặc bán tại quầy.</p>
        <form onSubmit={addManual} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <input required placeholder="Mã / mã đặt chỗ" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} className={inputClass} />
          <input placeholder="Phim / suất (mô tả)" value={form.movieInfo} onChange={e => setForm(f => ({ ...f, movieInfo: e.target.value }))} className={inputClass} />
          <input placeholder="Ghế (VD: D07, D08)" value={form.seats} onChange={e => setForm(f => ({ ...f, seats: e.target.value }))} className={inputClass} />
          <div className="flex gap-2">
            <input
              required
              type="number"
              min={0}
              placeholder="Tiền (đ)"
              value={form.amountVnd}
              onChange={e => setForm(f => ({ ...f, amountVnd: e.target.value }))}
              className={`min-w-0 flex-1 ${inputClass}`}
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-900/25 hover:bg-emerald-500"
            >
              Lưu
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900/60 shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-sm">
        <div className="border-b border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-bold text-white">Danh sách</h2>
        </div>
        {loading ? (
          <p className="p-8 text-sm text-zinc-500">Đang tải…</p>
        ) : merged.length === 0 ? (
          <p className="p-8 text-sm text-zinc-500">Chưa có giao dịch.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/80 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Mã</th>
                  <th className="px-4 py-3">Phim / mô tả</th>
                  <th className="px-4 py-3">Ghế</th>
                  <th className="px-4 py-3 text-right">Tiền</th>
                  <th className="px-4 py-3">TT</th>
                </tr>
              </thead>
              <tbody>
                {merged.map(row => (
                  <tr key={row.id} className="border-b border-zinc-800/80 transition hover:bg-zinc-800/40">
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-500">{formatTime(row.createdAt)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-emerald-400/90">{row.code || row.id.slice(0, 8)}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-zinc-200">{row.movieTitle || row.showtime || '—'}</td>
                    <td className="px-4 py-3 text-zinc-300">{row.seats?.length ? row.seats.join(', ') : '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-white">{formatVnd(row.amountVnd)}</td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{row.status || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

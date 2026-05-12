
'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { API_GetRoomsActive, API_GetRoomsInactive, API_GetRoomsMaintenance, type CinemaRoomDto } from '@/src/api/API_Room'

type RoomStatus = 'active' | 'maintenance' | 'inactive'

interface AdminRoom extends CinemaRoomDto {
  status: RoomStatus
}

export type CinemaInfo = {
  address: string
  rooms: number
  seats: string
  status: string
  title: string
}

const STATUS_CONFIG: Record<RoomStatus, { label: string; color: string; bg: string; dot: string }> = {
  active: { label: 'Hoạt động', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400' },
  maintenance: { label: 'Bảo trì', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', dot: 'bg-amber-400' },
  inactive: { label: 'Ngưng dùng', color: 'text-slate-500', bg: 'bg-slate-500/10 border-slate-500/20', dot: 'bg-slate-500' },
}

function withStatus(rooms: CinemaRoomDto[], status: RoomStatus): AdminRoom[] {
  return rooms.map(r => ({ ...r, status }))
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M21 21v-5h-5" />
    </svg>
  )
}

function DoorMiniIcon() {
  return (
    <svg className="h-5 w-5 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
      <path d="M3 21h18M10 12h4M14 21v-3a2 2 0 0 0-4 0v3" />
    </svg>
  )
}

function FilterTab({
  active,
  count,
  label,
  onClick,
}: {
  active: boolean
  count: number
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 items-center gap-2 rounded-lg border px-3 text-xs font-black uppercase tracking-wide transition-all ${
        active
          ? 'border-violet-500/40 bg-violet-500/15 text-violet-300'
          : 'border-white/10 bg-white/[0.03] text-slate-500 hover:border-white/20 hover:text-white'
      }`}
    >
      {label}
      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${active ? 'bg-violet-500/30 text-violet-300' : 'bg-white/10 text-slate-500'}`}>
        {count}
      </span>
    </button>
  )
}

function formatRoomFormat(format: string) {
  return format?.trim() ? format.trim().toUpperCase() : '—'
}

function formatCreatedAt(iso: string) {
  try {
    return new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<AdminRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | RoomStatus>('all')
  const searchRef = useRef<HTMLInputElement>(null)

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true)
      setLoadError(null)
      const [active, maintenance, inactive] = await Promise.all([
        API_GetRoomsActive(),
        API_GetRoomsMaintenance(),
        API_GetRoomsInactive(),
      ])
      const merged: AdminRoom[] = [
        ...withStatus(active, 'active'),
        ...withStatus(maintenance, 'maintenance'),
        ...withStatus(inactive, 'inactive'),
      ]
      setRooms(merged)
    } catch (e: unknown) {
      console.error('Failed to load rooms:', e)
      setLoadError(e instanceof Error ? e.message : 'Không thể tải danh sách phòng')
      setRooms([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  const filtered = useMemo(() => {
    return rooms.filter(r => {
      const q = search.toLowerCase()
      const matchSearch =
        r.name.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.format.toLowerCase().includes(q)
      const matchStatus = filterStatus === 'all' || r.status === filterStatus
      return matchSearch && matchStatus
    })
  }, [rooms, search, filterStatus])

  const counts = useMemo(
    () => ({
      all: rooms.length,
      active: rooms.filter(r => r.status === 'active').length,
      maintenance: rooms.filter(r => r.status === 'maintenance').length,
      inactive: rooms.filter(r => r.status === 'inactive').length,
    }),
    [rooms]
  )

  const totalSeats = useMemo(() => rooms.reduce((sum, r) => sum + (r.total_seats ?? 0), 0), [rooms])

  return (
    <section className="space-y-6 text-white">
      <div className="rounded-2xl border border-white/10 bg-[#0b1019] px-6 py-6 shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Quản lý phòng</h1>
            <div className="mt-2 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-violet-400">Phòng chiếu</span>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchRooms}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-5 text-sm font-black text-white transition-all hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshIcon />
            Tải lại
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[
            { label: 'Tổng phòng', value: counts.all, tone: 'text-white' },
            { label: 'Hoạt động', value: counts.active, tone: 'text-emerald-300' },
            { label: 'Bảo trì', value: counts.maintenance, tone: 'text-amber-300' },
            { label: 'Ngưng dùng', value: counts.inactive, tone: 'text-slate-400' },
            { label: 'Tổng ghế', value: totalSeats, tone: 'text-violet-300' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className={`text-2xl font-black ${s.tone}`}>{s.value}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0b1019] p-4 shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:w-96">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
              <SearchIcon />
            </span>
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên, ID, định dạng..."
              className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-11 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-violet-500/40 focus:bg-white/[0.06]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterTab active={filterStatus === 'all'} label="Tất cả" count={counts.all} onClick={() => setFilterStatus('all')} />
            <FilterTab active={filterStatus === 'active'} label="Hoạt động" count={counts.active} onClick={() => setFilterStatus('active')} />
            <FilterTab active={filterStatus === 'maintenance'} label="Bảo trì" count={counts.maintenance} onClick={() => setFilterStatus('maintenance')} />
            <FilterTab active={filterStatus === 'inactive'} label="Ngưng dùng" count={counts.inactive} onClick={() => setFilterStatus('inactive')} />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1019] shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 text-5xl opacity-30">⏳</div>
            <p className="text-xl font-bold text-slate-400">Đang tải danh sách phòng...</p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 text-5xl opacity-30">⚠️</div>
            <p className="text-xl font-bold text-red-300">Tải danh sách phòng thất bại</p>
            <p className="mt-2 text-sm text-slate-500">{loadError}</p>
            <button
              type="button"
              onClick={fetchRooms}
              className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/10 px-4 text-sm font-bold text-violet-300 hover:bg-violet-500/20 transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 text-6xl opacity-20">🚪</div>
            <p className="text-xl font-bold text-slate-500">Không có phòng nào</p>
            <p className="mt-2 text-sm text-slate-600">Thử đổi từ khóa hoặc bộ lọc</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid min-w-[980px] grid-cols-[1.5fr_1fr_.55fr_.45fr_.45fr_.5fr_1fr] gap-4 border-b border-white/10 bg-white/[0.03] px-5 py-3">
              {['Phòng', 'ID', 'Định dạng', 'Hàng', 'Cột', 'Ghế', 'Trạng thái'].map(h => (
                <span key={h} className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {h}
                </span>
              ))}
            </div>
            {filtered.map(r => {
              const sc = STATUS_CONFIG[r.status]
              return (
                <div
                  key={`${r.status}-${r.id}`}
                  className="grid min-w-[980px] grid-cols-[1.5fr_1fr_.55fr_.45fr_.45fr_.5fr_1fr] items-center gap-4 border-b border-white/5 px-5 py-4 transition-colors last:border-b-0 hover:bg-white/[0.03]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
                      <DoorMiniIcon />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{r.name}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{formatCreatedAt(r.created_at)}</p>
                    </div>
                  </div>
                  <p className="truncate font-mono text-xs text-violet-300" title={r.id}>
                    {r.id}
                  </p>
                  <span className="w-fit rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-black text-slate-400">
                    {formatRoomFormat(r.format)}
                  </span>
                  <p className="text-sm text-slate-400">{r.total_rows}</p>
                  <p className="text-sm text-slate-400">{r.total_columns}</p>
                  <p className="text-sm font-bold text-slate-300">{r.total_seats}</p>
                  <div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black ${sc.bg} ${sc.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <div className="flex items-center justify-between border-t border-white/5 px-5 py-4">
          <p className="text-xs font-bold text-slate-600">
            Hiển thị <span className="text-slate-400">{filtered.length}</span> / {rooms.length} phòng
          </p>
        </div>
      </div>
    </section>
  )

}

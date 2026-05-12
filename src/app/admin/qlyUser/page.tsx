'use client'

import React, { useMemo, useRef, useState } from 'react'

type UserStatus = 'active' | 'blocked'

interface AdminUserRow {
  id: string
  full_name: string
  email: string
  phone: string
  role: 'user' | 'admin'
  points: number
  membership: string
  status: UserStatus
  joined_at: string
}

const STATUS_CONFIG: Record<UserStatus, { label: string; color: string; bg: string; dot: string }> = {
  active: { label: 'Hoạt động', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400' },
  blocked: { label: 'Đã khóa', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', dot: 'bg-red-400' },
}

const MOCK: AdminUserRow[] = [
  { id: '1', full_name: 'Nguyễn Văn A', email: 'a@gmail.com', phone: '0901234567', role: 'user', points: 1200, membership: 'Gold', status: 'active', joined_at: '2025-01-10' },
  { id: '2', full_name: 'Trần Thị B', email: 'b@gmail.com', phone: '0912345678', role: 'user', points: 340, membership: 'Silver', status: 'active', joined_at: '2025-06-22' },
  { id: '3', full_name: 'Admin Hệ thống', email: 'admin@cinema.local', phone: '—', role: 'admin', points: 0, membership: '—', status: 'active', joined_at: '2024-03-01' },
  { id: '4', full_name: 'Lê Văn C', email: 'c@gmail.com', phone: '0933444555', role: 'user', points: 50, membership: 'Bronze', status: 'blocked', joined_at: '2026-02-01' },
]

function SearchIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function FilterTab({ active, count, label, onClick }: { active: boolean; count: number; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 items-center gap-2 rounded-lg border px-3 text-xs font-black uppercase tracking-wide transition-all ${
        active ? 'border-violet-500/40 bg-violet-500/15 text-violet-300' : 'border-white/10 bg-white/[0.03] text-slate-500 hover:border-white/20 hover:text-white'
      }`}
    >
      {label}
      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${active ? 'bg-violet-500/30 text-violet-300' : 'bg-white/10 text-slate-500'}`}>{count}</span>
    </button>
  )
}

export default function AdminUsersPage() {
  const [rows] = useState<AdminUserRow[]>(MOCK)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | UserStatus | 'admin' | 'user'>('all')
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return rows.filter(r => {
      const match =
        r.full_name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q)
      let roleOk = true
      if (filter === 'admin') roleOk = r.role === 'admin'
      if (filter === 'user') roleOk = r.role === 'user'
      const stOk = filter === 'all' || filter === 'admin' || filter === 'user' ? true : r.status === filter
      return match && roleOk && stOk
    })
  }, [rows, search, filter])

  const counts = useMemo(
    () => ({
      all: rows.length,
      active: rows.filter(r => r.status === 'active').length,
      blocked: rows.filter(r => r.status === 'blocked').length,
      admin: rows.filter(r => r.role === 'admin').length,
      user: rows.filter(r => r.role === 'user').length,
    }),
    [rows]
  )

  return (
    <section className="space-y-6 text-white">
      <div className="rounded-2xl border border-white/10 bg-[#0b1019] px-6 py-6 shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Quản lý người dùng</h1>
          <div className="mt-2 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-violet-400">Người dùng</span>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-slate-500">Thành viên và quyền truy cập. Dữ liệu mẫu — nối API khi backend sẵn sàng.</p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[
            { label: 'Tổng tài khoản', value: counts.all, tone: 'text-white' },
            { label: 'Hoạt động', value: counts.active, tone: 'text-emerald-300' },
            { label: 'Đã khóa', value: counts.blocked, tone: 'text-red-300' },
            { label: 'Khách', value: counts.user, tone: 'text-slate-300' },
            { label: 'Admin', value: counts.admin, tone: 'text-violet-300' },
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
          <div className="relative w-full xl:w-[28rem]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"><SearchIcon /></span>
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên, email, số điện thoại..."
              className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-11 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/40"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterTab active={filter === 'all'} label="Tất cả" count={counts.all} onClick={() => setFilter('all')} />
            <FilterTab active={filter === 'active'} label="Hoạt động" count={counts.active} onClick={() => setFilter('active')} />
            <FilterTab active={filter === 'blocked'} label="Đã khóa" count={counts.blocked} onClick={() => setFilter('blocked')} />
            <FilterTab active={filter === 'user'} label="Khách" count={counts.user} onClick={() => setFilter('user')} />
            <FilterTab active={filter === 'admin'} label="Admin" count={counts.admin} onClick={() => setFilter('admin')} />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1019] shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
        <div className="overflow-x-auto">
          <div className="grid min-w-[960px] grid-cols-[1.2fr_1.2fr_.85fr_.55fr_.5fr_.55fr_.75fr_.9fr] gap-3 border-b border-white/10 bg-white/[0.03] px-5 py-3">
            {['Họ tên', 'Email', 'SĐT', 'Vai trò', 'Điểm', 'Hạng', 'Tham gia', 'Trạng thái'].map(h => (
              <span key={h} className="text-[10px] font-black uppercase tracking-widest text-slate-500">{h}</span>
            ))}
          </div>
          {filtered.map(r => {
            const sc = STATUS_CONFIG[r.status]
            return (
              <div key={r.id} className="grid min-w-[960px] grid-cols-[1.2fr_1.2fr_.85fr_.55fr_.5fr_.55fr_.75fr_.9fr] items-center gap-3 border-b border-white/5 px-5 py-3.5 text-sm hover:bg-white/[0.03]">
                <p className="truncate font-bold text-white">{r.full_name}</p>
                <p className="truncate text-slate-400">{r.email}</p>
                <p className="text-slate-400">{r.phone}</p>
                <span className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-black ${r.role === 'admin' ? 'bg-violet-500/20 text-violet-300' : 'bg-white/10 text-slate-400'}`}>
                  {r.role === 'admin' ? 'Admin' : 'Khách'}
                </span>
                <p className="text-violet-300/90">{r.points}</p>
                <p className="text-slate-400">{r.membership}</p>
                <p className="font-mono text-xs text-slate-500">{r.joined_at}</p>
                <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black ${sc.bg} ${sc.color}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                  {sc.label}
                </span>
              </div>
            )
          })}
        </div>
        <div className="border-t border-white/5 px-5 py-3 text-xs font-bold text-slate-600">
          Hiển thị {filtered.length} / {rows.length} người dùng
        </div>
      </div>
    </section>
  )
}

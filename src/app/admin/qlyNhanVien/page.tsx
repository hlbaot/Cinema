'use client'

import React, { useMemo, useRef, useState } from 'react'

type StaffDept = 'Thu ngân' | 'Bán vé' | 'Kỹ thuật' | 'Quản lý' | 'Vệ sinh'
type StaffStatus = 'working' | 'leave' | 'inactive'

interface StaffRow {
  id: string
  full_name: string
  employee_code: string
  department: StaffDept
  phone: string
  shift: string
  status: StaffStatus
  joined_at: string
}

const STATUS_CONFIG: Record<StaffStatus, { label: string; color: string; bg: string; dot: string }> = {
  working: { label: 'Đang làm', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400' },
  leave: { label: 'Nghỉ phép', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', dot: 'bg-amber-400' },
  inactive: { label: 'Đã nghỉ', color: 'text-slate-500', bg: 'bg-slate-500/10 border-slate-500/20', dot: 'bg-slate-500' },
}

const MOCK: StaffRow[] = [
  { id: '1', full_name: 'Phạm Minh Tuấn', employee_code: 'NV-001', department: 'Bán vé', phone: '0901111222', shift: 'Ca 1 (8h–16h)', status: 'working', joined_at: '2024-08-01' },
  { id: '2', full_name: 'Hoàng Thị Lan', employee_code: 'NV-014', department: 'Thu ngân', phone: '0903333444', shift: 'Ca 2 (14h–22h)', status: 'working', joined_at: '2025-01-15' },
  { id: '3', full_name: 'Đỗ Văn Hùng', employee_code: 'NV-022', department: 'Kỹ thuật', phone: '0915555666', shift: 'Ca linh hoạt', status: 'leave', joined_at: '2023-11-20' },
  { id: '4', full_name: 'Vũ Thị Mai', employee_code: 'NV-008', department: 'Quản lý', phone: '0987777888', shift: 'Hành chính', status: 'working', joined_at: '2022-05-10' },
  { id: '5', full_name: 'Trịnh Văn Khoa', employee_code: 'NV-031', department: 'Vệ sinh', phone: '—', shift: 'Ca 3', status: 'inactive', joined_at: '2021-03-01' },
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

export default function AdminStaffPage() {
  const [rows] = useState<StaffRow[]>(MOCK)
  const [search, setSearch] = useState('')
  const [filterDept, setFilterDept] = useState<'all' | StaffDept>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | StaffStatus>('all')
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return rows.filter(r => {
      const match =
        r.full_name.toLowerCase().includes(q) ||
        r.employee_code.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q)
      const d = filterDept === 'all' || r.department === filterDept
      const s = filterStatus === 'all' || r.status === filterStatus
      return match && d && s
    })
  }, [rows, search, filterDept, filterStatus])

  const counts = useMemo(() => {
    const dept = (d: StaffDept) => rows.filter(r => r.department === d).length
    return {
      all: rows.length,
      working: rows.filter(r => r.status === 'working').length,
      leave: rows.filter(r => r.status === 'leave').length,
      inactive: rows.filter(r => r.status === 'inactive').length,
      banve: dept('Bán vé'),
      thungan: dept('Thu ngân'),
      kythuat: dept('Kỹ thuật'),
      quanly: dept('Quản lý'),
      vesinh: dept('Vệ sinh'),
    }
  }, [rows])

  return (
    <section className="space-y-6 text-white">
      <div className="rounded-2xl border border-white/10 bg-[#0b1019] px-6 py-6 shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Quản lý nhân viên</h1>
          <div className="mt-2 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-violet-400">Nhân viên</span>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-slate-500">Danh sách nhân sự theo bộ phận và ca làm việc. Dữ liệu mẫu — nối API khi backend sẵn sàng.</p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: 'Tổng NV', value: counts.all, tone: 'text-white' },
            { label: 'Đang làm', value: counts.working, tone: 'text-emerald-300' },
            { label: 'Nghỉ phép', value: counts.leave, tone: 'text-amber-300' },
            { label: 'Đã nghỉ', value: counts.inactive, tone: 'text-slate-400' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className={`text-2xl font-black ${s.tone}`}>{s.value}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0b1019] p-4 shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-4">
          <div className="relative w-full max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"><SearchIcon /></span>
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên, mã NV, SĐT..."
              className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-11 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/40"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="mr-1 self-center text-[10px] font-black uppercase tracking-widest text-slate-600">Bộ phận</span>
            <FilterTab active={filterDept === 'all'} label="Tất cả" count={counts.all} onClick={() => setFilterDept('all')} />
            <FilterTab active={filterDept === 'Bán vé'} label="Bán vé" count={counts.banve} onClick={() => setFilterDept('Bán vé')} />
            <FilterTab active={filterDept === 'Thu ngân'} label="Thu ngân" count={counts.thungan} onClick={() => setFilterDept('Thu ngân')} />
            <FilterTab active={filterDept === 'Kỹ thuật'} label="Kỹ thuật" count={counts.kythuat} onClick={() => setFilterDept('Kỹ thuật')} />
            <FilterTab active={filterDept === 'Quản lý'} label="Quản lý" count={counts.quanly} onClick={() => setFilterDept('Quản lý')} />
            <FilterTab active={filterDept === 'Vệ sinh'} label="Vệ sinh" count={counts.vesinh} onClick={() => setFilterDept('Vệ sinh')} />
          </div>
          <div className="flex flex-wrap gap-2 border-t border-white/5 pt-3">
            <span className="mr-1 self-center text-[10px] font-black uppercase tracking-widest text-slate-600">Trạng thái</span>
            <FilterTab active={filterStatus === 'all'} label="Tất cả" count={counts.all} onClick={() => setFilterStatus('all')} />
            <FilterTab active={filterStatus === 'working'} label="Đang làm" count={counts.working} onClick={() => setFilterStatus('working')} />
            <FilterTab active={filterStatus === 'leave'} label="Nghỉ phép" count={counts.leave} onClick={() => setFilterStatus('leave')} />
            <FilterTab active={filterStatus === 'inactive'} label="Đã nghỉ" count={counts.inactive} onClick={() => setFilterStatus('inactive')} />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1019] shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
        <div className="overflow-x-auto">
          <div className="grid min-w-[920px] grid-cols-[1.2fr_.65fr_1fr_.85fr_1.1fr_.75fr_1fr] gap-3 border-b border-white/10 bg-white/[0.03] px-5 py-3">
            {['Họ tên', 'Mã NV', 'Bộ phận', 'SĐT', 'Ca làm việc', 'Vào làm', 'Trạng thái'].map(h => (
              <span key={h} className="text-[10px] font-black uppercase tracking-widest text-slate-500">{h}</span>
            ))}
          </div>
          {filtered.map(r => {
            const sc = STATUS_CONFIG[r.status]
            return (
              <div key={r.id} className="grid min-w-[920px] grid-cols-[1.2fr_.65fr_1fr_.85fr_1.1fr_.75fr_1fr] items-center gap-3 border-b border-white/5 px-5 py-3.5 text-sm hover:bg-white/[0.03]">
                <p className="truncate font-bold text-white">{r.full_name}</p>
                <p className="font-mono text-xs text-violet-300">{r.employee_code}</p>
                <p className="text-slate-400">{r.department}</p>
                <p className="text-slate-400">{r.phone}</p>
                <p className="truncate text-xs text-slate-500">{r.shift}</p>
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
          Hiển thị {filtered.length} / {rows.length} nhân viên
        </div>
      </div>
    </section>
  )
}

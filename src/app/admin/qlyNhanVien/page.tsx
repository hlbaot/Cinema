'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Cookies from 'js-cookie'
import Image from 'next/image'
import {
  API_AdminGetStaffs,
  type UserItemDto,
  type UserStatus,
} from '@/src/api/API_Admin'
import ModalThemNV from '@/src/component/admin/modalThemNV'

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  active:   { label: 'Hoạt động', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400' },
  blocked:  { label: 'Bị khóa',   color: 'text-red-400',     bg: 'bg-red-400/10 border-red-400/20',         dot: 'bg-red-400'     },
  inactive: { label: 'Không HĐ',  color: 'text-slate-500',   bg: 'bg-slate-500/10 border-slate-500/20',     dot: 'bg-slate-500'   },
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function SearchIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
    </svg>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminStaffPage() {
  const [staffs, setStaffs] = useState<UserItemDto[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | UserStatus>('all')
  const [showModal, setShowModal] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const LIMIT = 20
  const searchRef = useRef<HTMLInputElement>(null)

  const fetchStaffs = useCallback(async (p = 1) => {
    setLoading(true)
    setFetchError(null)
    try {
      const token = Cookies.get('ACCESS_TOKEN')
      const res = await API_AdminGetStaffs(p, LIMIT, token)
      if (res.success) {
        setStaffs(res.data.users)
        setTotal(res.data.total)
        setPage(p)
      } else {
        setFetchError('Không thể tải danh sách nhân viên.')
      }
    } catch {
      setFetchError('Lỗi kết nối server. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStaffs(1) }, [fetchStaffs])

  function handleCreated(staff: UserItemDto) {
    setStaffs(prev => [staff, ...prev])
    setTotal(prev => prev + 1)
  }

  const filtered = staffs.filter(r => {
    const q = search.toLowerCase()
    const matchSearch =
      r.full_name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      (r.phone ?? '').toLowerCase().includes(q)
    const matchStatus = filterStatus === 'all' || r.status === filterStatus
    return matchSearch && matchStatus
  })

  const counts = {
    all: staffs.length,
    active: staffs.filter(r => r.status === 'active').length,
    blocked: staffs.filter(r => r.status === 'blocked').length,
    inactive: staffs.filter(r => r.status === 'inactive').length,
  }

  return (
    <section className="space-y-6 text-white">
      {showModal && (
        <ModalThemNV
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}

      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-[#0b1019] px-6 py-6 shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Quản lý nhân viên</h1>
            <div className="mt-2 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <span>Dashboard</span><span>/</span>
              <span className="text-violet-400">Nhân viên</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => fetchStaffs(page)}
              className="flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 text-xs font-bold text-slate-400 hover:text-white hover:border-white/20 transition-colors">
              <RefreshIcon /> Làm mới
            </button>
            <button type="button" onClick={() => setShowModal(true)}
              className="flex h-10 items-center gap-2 rounded-lg bg-violet-600 px-4 text-xs font-bold text-white hover:bg-violet-500 transition-colors">
              <PlusIcon /> Thêm nhân viên
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: 'Tổng NV', value: total || counts.all, tone: 'text-white' },
            { label: 'Hoạt động', value: counts.active, tone: 'text-emerald-300' },
            { label: 'Bị khóa', value: counts.blocked, tone: 'text-red-300' },
            { label: 'Không HĐ', value: counts.inactive, tone: 'text-slate-400' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className={`text-2xl font-black ${s.tone}`}>{s.value}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter bar */}
      <div className="rounded-2xl border border-white/10 bg-[#0b1019] p-4 shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-4">
          <div className="relative w-full max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"><SearchIcon /></span>
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên, email, SĐT..."
              className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-11 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/40"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="mr-1 self-center text-[10px] font-black uppercase tracking-widest text-slate-600">Trạng thái</span>
            {([['all', 'Tất cả', counts.all], ['active', 'Hoạt động', counts.active], ['blocked', 'Bị khóa', counts.blocked], ['inactive', 'Không HĐ', counts.inactive]] as [string, string, number][]).map(([val, label, count]) => (
              <button key={val} type="button" onClick={() => setFilterStatus(val as 'all' | UserStatus)}
                className={`flex h-10 items-center gap-2 rounded-lg border px-3 text-xs font-black uppercase tracking-wide transition-all ${
                  filterStatus === val
                    ? 'border-violet-500/40 bg-violet-500/15 text-violet-300'
                    : 'border-white/10 bg-white/[0.03] text-slate-500 hover:border-white/20 hover:text-white'
                }`}>
                {label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${filterStatus === val ? 'bg-violet-500/30 text-violet-300' : 'bg-white/10 text-slate-500'}`}>{count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1019] shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
        <div className="overflow-x-auto">
          {/* Header */}
          <div className="grid min-w-[960px] grid-cols-[1.4fr_1.6fr_.9fr_.8fr_.8fr_.9fr_1fr] gap-3 border-b border-white/10 bg-white/[0.03] px-5 py-3">
            {['Họ và tên', 'Email', 'SĐT', 'Vai trò', 'Nguồn ĐN', 'Trạng thái', 'Ngày tạo'].map(h => (
              <span key={h} className="text-[10px] font-black uppercase tracking-widest text-slate-500">{h}</span>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
            </div>
          ) : fetchError ? (
            <div className="px-5 py-10 text-center text-sm text-red-400">{fetchError}</div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-500">
              {search || filterStatus !== 'all' ? 'Không tìm thấy nhân viên phù hợp.' : 'Chưa có nhân viên nào.'}
            </div>
          ) : (
            filtered.map(r => {
              const sc = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.inactive
              const date = r.created_at ? new Date(r.created_at).toLocaleDateString('vi-VN') : '—'
              return (
                <div key={r.id} className="grid min-w-[960px] grid-cols-[1.4fr_1.6fr_.9fr_.8fr_.8fr_.9fr_1fr] items-center gap-3 border-b border-white/5 px-5 py-3.5 text-sm hover:bg-white/[0.03]">
                  <div className="flex items-center gap-3 min-w-0">
                    {r.avatar_url ? (
                      <Image
                        src={r.avatar_url}
                        alt=""
                        width={32}
                        height={32}
                        unoptimized
                        className="h-8 w-8 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600/30 text-xs font-black text-violet-300">
                        {r.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <p className="truncate font-bold text-white">{r.full_name}</p>
                  </div>
                  <p className="truncate text-slate-400">{r.email}</p>
                  <p className="text-slate-400">{r.phone ?? '—'}</p>
                  <p className="text-slate-400 uppercase text-[10px] font-bold">{r.role}</p>
                  <p className="text-slate-400 uppercase text-[10px] font-bold">{r.auth_provider}</p>
                  <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black ${sc.bg} ${sc.color}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                    {sc.label}
                  </span>
                  <p className="font-mono text-xs text-slate-500">{date}</p>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/5 px-5 py-3 text-xs font-bold text-slate-600">
          <span>Hiển thị {filtered.length} / {total || staffs.length} nhân viên</span>
          {total > LIMIT && (
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => fetchStaffs(page - 1)}
                className="rounded border border-white/10 px-3 py-1 text-slate-400 hover:text-white disabled:opacity-30">← Trước</button>
              <span className="self-center text-slate-500">Trang {page}</span>
              <button disabled={page * LIMIT >= total} onClick={() => fetchStaffs(page + 1)}
                className="rounded border border-white/10 px-3 py-1 text-slate-400 hover:text-white disabled:opacity-30">Sau →</button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

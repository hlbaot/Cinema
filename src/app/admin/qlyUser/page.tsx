
'use client'

import Cookies from 'js-cookie'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { API_CreateStaff, API_GetCustomers, API_GetStaffs, type UserItemDto } from '@/src/api/API_Staff'
import { getApiErrorMessage } from '@/src/lib/auth-client'

type UserStatus = 'active' | 'blocked'

interface AdminUserRow {
  id: string
  full_name: string
  email: string
  phone: string
  role: 'user' | 'admin' | 'staff'
  points: number
  membership: string
  status: UserStatus
  joined_at: string
}

type CreateStaffForm = {
  full_name: string
  email: string
  password: string
  phone: string
  avatar_url: string
}

export type AdminUserInfo = {
  email: string
  id: number
  memberRank: 'GOLD' | 'SILVER' | 'VIP'
  name: string
  phone: string
  points: string
  role: 'admin' | 'staff' | 'customer'
  status: string
}

const STATUS_CONFIG: Record<UserStatus, { label: string; color: string; bg: string; dot: string }> = {
  active: { label: 'Hoạt động', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400' },
  blocked: { label: 'Đã khóa', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', dot: 'bg-red-400' },
}

function mapApiUserToRow(user: UserItemDto): AdminUserRow {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone ?? '—',
    role: user.role === 'admin' || user.role === 'staff' ? user.role : 'user',
    points: 0,
    membership: '—',
    status: user.status === 'active' ? 'active' : 'blocked',
    joined_at: typeof user.created_at === 'string' ? user.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
  }
}

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
  const [rows, setRows] = useState<AdminUserRow[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | UserStatus | 'admin' | 'staff' | 'user'>('all')
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [creatingStaff, setCreatingStaff] = useState(false)
  const [staffForm, setStaffForm] = useState<CreateStaffForm>({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    avatar_url: '',
  })
  const searchRef = useRef<HTMLInputElement>(null)

  async function fetchStaffs() {
    setLoadingUsers(true)
    try {
      const accessToken = Cookies.get('ACCESS_TOKEN')
      const [staffsResult, customersResult] = await Promise.allSettled([
        API_GetStaffs(1, 200, accessToken),
        API_GetCustomers(1, 200, '', accessToken),
      ])
      const staffsRes = staffsResult.status === 'fulfilled' ? staffsResult.value : null
      const customersRes = customersResult.status === 'fulfilled' ? customersResult.value : null

      if (staffsResult.status === 'rejected' && customersResult.status === 'rejected') {
        throw customersResult.reason
      }

      setRows([
        ...(customersRes?.data.users ?? []).map(mapApiUserToRow),
        ...(staffsRes?.data.users ?? []).map(mapApiUserToRow),
      ])
    } catch (error) {
      alert(getApiErrorMessage(error, 'Không thể tải danh sách người dùng.'))
      setRows([])
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    void fetchStaffs()
  }, [])

  async function handleCreateStaff(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const full_name = staffForm.full_name.trim()
    const email = staffForm.email.trim()
    const password = staffForm.password
    const phone = staffForm.phone.trim()
    const avatar_url = staffForm.avatar_url.trim()

    if (!full_name) return alert('Vui lòng nhập họ tên nhân viên.')
    if (!email) return alert('Vui lòng nhập email nhân viên.')
    if (password.length < 6) return alert('Mật khẩu tối thiểu 6 ký tự.')

    setCreatingStaff(true)
    try {
      const accessToken = Cookies.get('ACCESS_TOKEN')
      const res = await API_CreateStaff(
        {
          full_name,
          email,
          password,
          phone: phone || undefined,
          avatar_url: avatar_url || undefined,
        },
        accessToken,
      )

      const staff = res.data.staff
      setRows(prev => [
        {
          id: staff.id,
          full_name: staff.full_name,
          email: staff.email,
          phone: staff.phone ?? '—',
          role: 'staff',
          points: 0,
          membership: '—',
          status: staff.status === 'active' ? 'active' : 'blocked',
          joined_at: typeof staff.created_at === 'string' ? staff.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ])
      setStaffForm({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        avatar_url: '',
      })
      alert(res.data.message || 'Tạo tài khoản staff thành công.')
    } catch (error) {
      alert(getApiErrorMessage(error, 'Tạo tài khoản staff thất bại.'))
    } finally {
      setCreatingStaff(false)
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return rows.filter(r => {
      const match =
        r.full_name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q)
      let roleOk = true
      if (filter === 'admin') roleOk = r.role === 'admin'
      if (filter === 'staff') roleOk = r.role === 'staff'
      if (filter === 'user') roleOk = r.role === 'user'
      const stOk = filter === 'all' || filter === 'admin' || filter === 'staff' || filter === 'user' ? true : r.status === filter
      return match && roleOk && stOk
    })
  }, [rows, search, filter])

  const counts = useMemo(
    () => ({
      all: rows.length,
      active: rows.filter(r => r.status === 'active').length,
      blocked: rows.filter(r => r.status === 'blocked').length,
      admin: rows.filter(r => r.role === 'admin').length,
      staff: rows.filter(r => r.role === 'staff').length,
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
          <p className="mt-3 max-w-2xl text-sm text-slate-500">Danh sách người dùng lấy trực tiếp từ backend. Admin có thể tạo thêm tài khoản staff.</p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-6">
          {[
            { label: 'Tổng tài khoản', value: counts.all, tone: 'text-white' },
            { label: 'Hoạt động', value: counts.active, tone: 'text-emerald-300' },
            { label: 'Đã khóa', value: counts.blocked, tone: 'text-red-300' },
            { label: 'Khách', value: counts.user, tone: 'text-slate-300' },
            { label: 'Staff', value: counts.staff, tone: 'text-cyan-300' },
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
        <form onSubmit={handleCreateStaff} className="mb-4 grid grid-cols-1 gap-2 border-b border-white/10 pb-4 lg:grid-cols-6">
          <input
            value={staffForm.full_name}
            onChange={e => setStaffForm(prev => ({ ...prev, full_name: e.target.value }))}
            placeholder="Họ tên staff *"
            className="h-10 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm outline-none focus:border-violet-500/40"
          />
          <input
            value={staffForm.email}
            onChange={e => setStaffForm(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Email *"
            className="h-10 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm outline-none focus:border-violet-500/40"
          />
          <input
            value={staffForm.password}
            onChange={e => setStaffForm(prev => ({ ...prev, password: e.target.value }))}
            placeholder="Mật khẩu *"
            type="password"
            className="h-10 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm outline-none focus:border-violet-500/40"
          />
          <input
            value={staffForm.phone}
            onChange={e => setStaffForm(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="Số điện thoại"
            className="h-10 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm outline-none focus:border-violet-500/40"
          />
          <input
            value={staffForm.avatar_url}
            onChange={e => setStaffForm(prev => ({ ...prev, avatar_url: e.target.value }))}
            placeholder="Avatar URL"
            className="h-10 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm outline-none focus:border-violet-500/40"
          />
          <button
            type="submit"
            disabled={creatingStaff}
            className="h-10 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 text-xs font-black uppercase tracking-wide text-white disabled:opacity-60"
          >
            {creatingStaff ? 'Đang tạo...' : 'Tạo staff'}
          </button>
        </form>
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={() => void fetchStaffs()}
            disabled={loadingUsers}
            className="rounded-lg border border-cyan-500/35 bg-cyan-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-cyan-300 disabled:opacity-60"
          >
            {loadingUsers ? 'Đang tải...' : 'Reload người dùng'}
          </button>
        </div>
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
            <FilterTab active={filter === 'staff'} label="Staff" count={counts.staff} onClick={() => setFilter('staff')} />
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
                <span className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-black ${r.role === 'admin' ? 'bg-violet-500/20 text-violet-300' : r.role === 'staff' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/10 text-slate-400'}`}>
                  {r.role === 'admin' ? 'Admin' : r.role === 'staff' ? 'Staff' : 'Khách'}
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

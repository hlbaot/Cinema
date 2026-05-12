
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

"use client";

import { useState } from "react";
import ModalChinhSuaUser from "@/src/component/admin/modalChinhSuaUser";
import ModalThemNguoiDung from "@/src/component/admin/modalThemNguoiDung";
import UserRoleDropdown from "@/src/component/admin/userRoleDropdown";

export type AdminUserInfo = {
  email: string;
  id: number;
  memberRank: "GOLD" | "SILVER" | "VIP";
  name: string;
  phone: string;
  points: string;
  role: "admin" | "customer" | "staff";
  status: string;
};

const users: AdminUserInfo[] = [
  {
    email: "an.nguyen@gmail.com",
    id: 1,
    memberRank: "VIP",
    name: "Nguyễn Văn An",
    phone: "0901234567",
    points: "15.000",
    role: "customer",
    status: "Hoạt động",
  },
  {
    email: "binh.tran@gmail.com",
    id: 2,
    memberRank: "GOLD",
    name: "Trần Thị Bình",
    phone: "0912345678",
    points: "8.500",
    role: "customer",
    status: "Hoạt động",
  },
  {
    email: "cuong.staff@cinepro.vn",
    id: 3,
    memberRank: "SILVER",
    name: "Lê Văn Cường",
    phone: "0923456789",
    points: "0",
    role: "staff",
    status: "Hoạt động",
  },
  {
    email: "dung.admin@cinepro.vn",
    id: 4,
    memberRank: "VIP",
    name: "Phạm Thị Dung",
    phone: "0934567890",
    points: "0",
    role: "admin",
    status: "Hoạt động",
  },
];

const roleLabel: Record<AdminUserInfo["role"], string> = {
  admin: "Admin",
  customer: "Khách hàng",
  staff: "Staff",
};

const roleBadgeClass: Record<AdminUserInfo["role"], string> = {
  admin: "bg-purple-500/20 text-purple-400",
  customer: "bg-gray-500/20 text-gray-400",
  staff: "bg-blue-500/20 text-blue-400",
};

const rankBadgeClass: Record<AdminUserInfo["memberRank"], string> = {
  GOLD: "bg-orange-500/20 text-orange-400",
  SILVER: "bg-gray-500/20 text-gray-400",
  VIP: "bg-yellow-500/20 text-yellow-400",
};

const roleFilterOptions = [
  { label: "Tất cả vai trò", value: "" },
  { label: "Admin", value: "admin" },
  { label: "Staff", value: "staff" },
  { label: "Customer", value: "customer" },
];

function normalize(value: string) {
  return value.toLowerCase().trim();
}

export default function AdminUsersPage() {
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserInfo | null>(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const visibleUsers = users.filter((user) => {
    const normalizedQuery = normalize(query);
    const matchesQuery =
      !normalizedQuery ||
      normalize(user.name).includes(normalizedQuery) ||
      normalize(user.email).includes(normalizedQuery) ||
      user.phone.includes(normalizedQuery);
    const matchesRole = !roleFilter || user.role === roleFilter;

    return matchesQuery && matchesRole;
  });

  return (
    <>
      <div className="flex h-full min-w-0 flex-1 flex-col bg-black text-white">
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-gray-800/50 bg-gray-900/20 px-4 py-4 md:px-8">
            <div>
              <h3 className="text-lg font-bold text-white">Người dùng</h3>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-[10px] uppercase text-gray-500">Dashboard</span>
                <span className="text-[10px] text-gray-600">/</span>
                <span className="text-[10px] font-bold uppercase text-purple-400">Người dùng</span>
              </div>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-xs text-gray-500">Hôm nay, 10/05/2026</p>
            </div>
          </div>

          <div className="p-4 md:p-8">
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold">Quản lý Người dùng</h2>
                <button
                  type="button"
                  onClick={() => setAddUserModalOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 font-medium transition hover:opacity-90"
                >
                  <span>➕</span> Thêm người dùng
                </button>
              </div>

              <div className="mb-4 flex flex-col gap-4 lg:flex-row">
                <div className="relative flex-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                    aria-hidden="true"
                  >
                    <path d="m21 21-4.34-4.34" />
                    <circle cx="11" cy="11" r="8" />
                  </svg>
                  <input
                    placeholder="Tìm theo tên, email, SĐT..."
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2 pl-10 pr-4 outline-none transition focus:border-purple-500"
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
                <UserRoleDropdown
                  className="w-full lg:w-52"
                  options={roleFilterOptions}
                  value={roleFilter}
                  onChange={setRoleFilter}
                />
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur">
                <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <table className="w-full min-w-[56rem]">
                    <thead>
                      <tr className="bg-gray-800/50 text-left text-sm text-gray-400">
                        <th className="px-4 py-3 font-medium">Người dùng</th>
                        <th className="px-4 py-3 font-medium">Liên hệ</th>
                        <th className="px-4 py-3 font-medium">Vai trò</th>
                        <th className="px-4 py-3 font-medium">Hạng TV</th>
                        <th className="px-4 py-3 font-medium">Điểm</th>
                        <th className="px-4 py-3 font-medium">Trạng thái</th>
                        <th className="px-4 py-3 font-medium">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {visibleUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-800/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 font-bold">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-xs text-gray-400">ID: {user.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm">{user.email}</p>
                            <p className="text-xs text-gray-400">{user.phone}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-1 text-xs ${roleBadgeClass[user.role]}`}>
                              {roleLabel[user.role]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-1 text-xs ${rankBadgeClass[user.memberRank]}`}>
                              {user.memberRank}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-yellow-500">{user.points}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-400">
                              {user.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingUser(user)}
                                className="rounded p-1 transition hover:bg-gray-700"
                              >
                                ✏️
                              </button>
                              <button type="button" className="rounded p-1 transition hover:bg-yellow-600">
                                🔒
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {visibleUsers.length === 0 ? (
                        <tr>
                          <td className="px-4 py-8 text-center text-sm text-gray-500" colSpan={7}>
                            Không tìm thấy người dùng phù hợp.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ModalThemNguoiDung open={addUserModalOpen} onClose={() => setAddUserModalOpen(false)} />
      <ModalChinhSuaUser
        key={editingUser?.id ?? "closed"}
        user={editingUser}
        open={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
      />
    </>
  );
}

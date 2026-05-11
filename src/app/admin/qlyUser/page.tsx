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

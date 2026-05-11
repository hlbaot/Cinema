"use client";

import { useState } from "react";
import type { AdminUserInfo } from "@/src/app/admin/qlyUser/page";
import UserRoleDropdown from "@/src/component/admin/userRoleDropdown";

type ModalChinhSuaUserProps = {
  onClose: () => void;
  open: boolean;
  user: AdminUserInfo | null;
};

const userRoleOptions = [
  { label: "Khách hàng", value: "customer" },
  { label: "Nhân viên", value: "staff" },
  { label: "Admin", value: "admin" },
];

export default function ModalChinhSuaUser({ onClose, open, user }: ModalChinhSuaUserProps) {
  const [role, setRole] = useState(user?.role ?? "customer");

  if (!open || !user) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black/80 p-3 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-user-title"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-gray-900 p-5 text-white shadow-2xl sm:p-6"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h3 id="edit-user-title" className="mb-4 text-xl font-bold">
          Sửa người dùng
        </h3>
        <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Họ tên</label>
            <input
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-purple-500"
              type="text"
              defaultValue={user.name}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Email</label>
            <input
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-purple-500"
              type="email"
              defaultValue={user.email}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Số điện thoại</label>
            <input
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-purple-500"
              type="tel"
              defaultValue={user.phone}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Vai trò</label>
            <UserRoleDropdown options={userRoleOptions} value={role} onChange={setRole} />
          </div>
          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg bg-gray-700 py-2 transition hover:bg-gray-600"
            >
              Hủy
            </button>
            <button
              type="button"
              className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 py-2 transition hover:opacity-90"
            >
              Cập nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

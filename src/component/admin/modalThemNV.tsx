"use client";

import Cookies from "js-cookie";
import { useState } from "react";
import {
  API_AdminCreateStaff,
  type CreateStaffRequestDto,
  type UserItemDto,
} from "@/src/api/API_Admin";
import { getApiErrorMessage } from "@/src/lib/auth-client";

type ModalThemNVProps = {
  onClose: () => void;
  onCreated: (staff: UserItemDto) => void;
};

const EMPTY_FORM: CreateStaffRequestDto = {
  email: "",
  full_name: "",
  phone: "",
};

function XIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export default function ModalThemNV({ onClose, onCreated }: ModalThemNVProps) {
  const [form, setForm] = useState<CreateStaffRequestDto>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ staff: UserItemDto; tempPassword: string | null } | null>(null);

  function setField(key: keyof CreateStaffRequestDto) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = Cookies.get("ACCESS_TOKEN");
      const payload: CreateStaffRequestDto = {
        email: form.email.trim(),
        full_name: form.full_name.trim(),
        ...(form.phone?.trim() ? { phone: form.phone.trim() } : {}),
      };
      const res = await API_AdminCreateStaff(payload, token);

      if (res.success && res.data?.staff) {
        setCreated({
          staff: res.data.staff,
          tempPassword: res.data.temporary_password ?? null,
        });
        return;
      }

      setError("Tạo nhân viên thất bại. Kiểm tra lại thông tin.");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, err instanceof Error ? err.message : "Lỗi kết nối server."));
    } finally {
      setLoading(false);
    }
  }

  function handleCloseSuccess() {
    if (created) {
      onCreated(created.staff);
    }

    onClose();
  }

  const inputClassName =
    "w-full rounded-2xl border border-slate-600/70 bg-slate-800/70 px-5 py-3.5 text-base text-white placeholder:text-slate-500 outline-none transition focus:border-fuchsia-400/70 focus:ring-2 focus:ring-fuchsia-500/20";
  const labelClassName = "mb-2 block text-sm font-medium text-slate-400";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-staff-title"
      onMouseDown={created ? undefined : onClose}
    >
      <div
        className="w-full max-w-4xl rounded-[2rem] border border-white/10 bg-[#111827] p-6 text-white shadow-2xl shadow-black/50 sm:p-8"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h2 id="create-staff-title" className="text-3xl font-black tracking-tight">
              Thêm nhân viên mới
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Chỉ nhập thông tin cơ bản, mật khẩu tạm sẽ được backend trả về sau khi tạo.
            </p>
          </div>
          <button
            type="button"
            onClick={created ? handleCloseSuccess : onClose}
            className="rounded-full p-2 text-slate-500 transition hover:cursor-pointer hover:bg-white/10 hover:text-white"
            aria-label="Đóng modal"
          >
            <XIcon />
          </button>
        </div>

        {created ? (
          <div className="space-y-5">
            <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
              <p className="text-base font-bold text-emerald-300">Tạo nhân viên thành công!</p>
              <p className="mt-1 text-sm text-slate-400">{created.staff.full_name} đã được thêm vào danh sách.</p>
              {created.tempPassword ? (
                <div className="mt-4 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-yellow-400">Mật khẩu tạm thời</p>
                  <p className="mt-2 select-all font-mono text-xl font-black text-yellow-200">{created.tempPassword}</p>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={handleCloseSuccess}
              className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 font-bold text-white transition hover:cursor-pointer hover:opacity-90"
            >
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClassName}>
                    Họ tên <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    value={form.full_name}
                    onChange={setField("full_name")}
                    placeholder="Nhập họ tên"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className={labelClassName}>
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={setField("email")}
                    placeholder="email@cinepro.vn"
                    className={inputClassName}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClassName}>Số điện thoại</label>
                  <input
                    value={form.phone ?? ""}
                    onChange={setField("phone")}
                    placeholder="090..."
                    className={inputClassName}
                  />
                </div>
            </div>

            {error ? (
              <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
                {error}
              </p>
            ) : null}

            <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl bg-slate-700 px-6 py-3.5 text-base font-semibold text-white transition hover:cursor-pointer hover:bg-slate-600"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3.5 text-base font-semibold text-white transition hover:cursor-pointer hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Đang thêm..." : "Thêm mới"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

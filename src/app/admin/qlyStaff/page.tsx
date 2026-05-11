"use client";

import { Pen, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import UserRoleDropdown, { type UserRoleOption } from "@/src/component/admin/userRoleDropdown";

type StaffPosition = "manager" | "cashier" | "projectionist" | "service" | "security";
type PositionFilter = StaffPosition | "";

export type AdminStaffInfo = {
  branch: string;
  email: string;
  employeeCode: string;
  id: number;
  name: string;
  phone: string;
  position: StaffPosition;
  salary: string;
  shift: string;
  status: "Đang làm" | "Nghỉ phép" | "Tạm nghỉ";
};

const staffList: AdminStaffInfo[] = [
  {
    branch: "CINEPRO Landmark 81",
    email: "minh.le@cinepro.vn",
    employeeCode: "NV001",
    id: 1,
    name: "Lê Hoàng Minh",
    phone: "0908123456",
    position: "manager",
    salary: "15.000.000",
    shift: "Ca hành chính",
    status: "Đang làm",
  },
  {
    branch: "CINEPRO Nguyễn Du",
    email: "linh.tran@cinepro.vn",
    employeeCode: "NV002",
    id: 2,
    name: "Trần Ngọc Linh",
    phone: "0919234567",
    position: "cashier",
    salary: "8.500.000",
    shift: "Ca tối",
    status: "Đang làm",
  },
  {
    branch: "CINEPRO Gò Vấp",
    email: "khoa.pham@cinepro.vn",
    employeeCode: "NV003",
    id: 3,
    name: "Phạm Anh Khoa",
    phone: "0927345678",
    position: "projectionist",
    salary: "10.500.000",
    shift: "Ca chiều",
    status: "Nghỉ phép",
  },
  {
    branch: "CINEPRO Landmark 81",
    email: "thao.nguyen@cinepro.vn",
    employeeCode: "NV004",
    id: 4,
    name: "Nguyễn Minh Thảo",
    phone: "0938456789",
    position: "service",
    salary: "8.000.000",
    shift: "Ca sáng",
    status: "Đang làm",
  },
  {
    branch: "CINEPRO Nguyễn Du",
    email: "son.vo@cinepro.vn",
    employeeCode: "NV005",
    id: 5,
    name: "Võ Thanh Sơn",
    phone: "0949567890",
    position: "security",
    salary: "7.500.000",
    shift: "Ca đêm",
    status: "Tạm nghỉ",
  },
];

const positionLabel: Record<StaffPosition, string> = {
  cashier: "Thu ngân",
  manager: "Quản lý rạp",
  projectionist: "Kỹ thuật chiếu",
  security: "Bảo vệ",
  service: "Dịch vụ khách hàng",
};

const positionBadgeClass: Record<StaffPosition, string> = {
  cashier: "bg-blue-500/20 text-blue-400",
  manager: "bg-purple-500/20 text-purple-400",
  projectionist: "bg-yellow-500/20 text-yellow-400",
  security: "bg-gray-500/20 text-gray-400",
  service: "bg-pink-500/20 text-pink-400",
};

const statusBadgeClass: Record<AdminStaffInfo["status"], string> = {
  "Đang làm": "bg-green-500/20 text-green-400",
  "Nghỉ phép": "bg-orange-500/20 text-orange-400",
  "Tạm nghỉ": "bg-red-500/20 text-red-400",
};

const positionFilterOptions = [
  { label: "Tất cả chức vụ", value: "" },
  { label: "Quản lý rạp", value: "manager" },
  { label: "Thu ngân", value: "cashier" },
  { label: "Kỹ thuật chiếu", value: "projectionist" },
  { label: "Dịch vụ khách hàng", value: "service" },
  { label: "Bảo vệ", value: "security" },
] satisfies UserRoleOption<PositionFilter>[];

function normalize(value: string) {
  return value.toLowerCase().trim();
}

type StaffFormModalProps = {
  mode: "add" | "edit";
  onClose: () => void;
  open: boolean;
  staff?: AdminStaffInfo | null;
};

function StaffFormModal({ mode, onClose, open, staff }: StaffFormModalProps) {
  if (!open) {
    return null;
  }

  const title = mode === "add" ? "Thêm nhân viên mới" : "Chỉnh sửa nhân viên";
  const submitText = mode === "add" ? "Thêm mới" : "Cập nhật";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black/80 p-3 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="staff-form-title"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-gray-900 p-5 text-white shadow-2xl sm:p-6"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h3 id="staff-form-title" className="mb-4 text-xl font-bold">
          {title}
        </h3>
        <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-gray-400">Mã nhân viên</label>
              <input
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-purple-500"
                defaultValue={staff?.employeeCode}
                placeholder="VD: NV006"
                type="text"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-400">Họ tên</label>
              <input
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-purple-500"
                defaultValue={staff?.name}
                placeholder="Nhập họ tên"
                type="text"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-gray-400">Email</label>
              <input
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-purple-500"
                defaultValue={staff?.email}
                placeholder="email@cinepro.vn"
                type="email"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-400">Số điện thoại</label>
              <input
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-purple-500"
                defaultValue={staff?.phone}
                placeholder="090..."
                type="tel"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-gray-400">Chức vụ</label>
              <select
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-purple-500"
                defaultValue={staff?.position ?? "cashier"}
              >
                <option value="manager">Quản lý rạp</option>
                <option value="cashier">Thu ngân</option>
                <option value="projectionist">Kỹ thuật chiếu</option>
                <option value="service">Dịch vụ khách hàng</option>
                <option value="security">Bảo vệ</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-400">Ca làm</label>
              <select
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-purple-500"
                defaultValue={staff?.shift ?? "Ca sáng"}
              >
                <option>Ca sáng</option>
                <option>Ca chiều</option>
                <option>Ca tối</option>
                <option>Ca đêm</option>
                <option>Ca hành chính</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-gray-400">Rạp làm việc</label>
              <input
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-purple-500"
                defaultValue={staff?.branch}
                placeholder="VD: CINEPRO Landmark 81"
                type="text"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-400">Lương cơ bản</label>
              <input
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-purple-500"
                defaultValue={staff?.salary}
                placeholder="8.500.000"
                type="text"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-400">Trạng thái</label>
            <select
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-purple-500"
              defaultValue={staff?.status ?? "Đang làm"}
            >
              <option>Đang làm</option>
              <option>Nghỉ phép</option>
              <option>Tạm nghỉ</option>
            </select>
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
              onClick={onClose}
              className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 py-2 transition hover:opacity-90"
            >
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminStaffPage() {
  const [addStaffModalOpen, setAddStaffModalOpen] = useState(false);
  const [deletingStaff, setDeletingStaff] = useState<AdminStaffInfo | null>(null);
  const [editingStaff, setEditingStaff] = useState<AdminStaffInfo | null>(null);
  const [positionFilter, setPositionFilter] = useState<PositionFilter>("");
  const [query, setQuery] = useState("");

  const visibleStaff = staffList.filter((staff) => {
    const normalizedQuery = normalize(query);
    const matchesQuery =
      !normalizedQuery ||
      normalize(staff.name).includes(normalizedQuery) ||
      normalize(staff.email).includes(normalizedQuery) ||
      normalize(staff.employeeCode).includes(normalizedQuery) ||
      staff.phone.includes(normalizedQuery);
    const matchesPosition = !positionFilter || staff.position === positionFilter;

    return matchesQuery && matchesPosition;
  });

  return (
    <>
      <div className="flex h-full min-w-0 flex-1 flex-col bg-black text-white">
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-gray-800/50 bg-gray-900/20 px-4 py-4 md:px-8">
            <div>
              <h3 className="text-lg font-bold text-white">Nhân viên</h3>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-[10px] uppercase text-gray-500">Dashboard</span>
                <span className="text-[10px] text-gray-600">/</span>
                <span className="text-[10px] font-bold uppercase text-purple-400">Nhân viên</span>
              </div>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-xs text-gray-500">Hôm nay, 11/05/2026</p>
            </div>
          </div>

          <div className="p-4 md:p-8">
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold">Quản lý nhân viên</h2>
                <button
                  type="button"
                  onClick={() => setAddStaffModalOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 font-medium transition hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  Thêm nhân viên
                </button>
              </div>

              <div className="mb-4 flex flex-col gap-4 lg:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <input
                    placeholder="Tìm theo tên, mã nhân viên, email, SĐT..."
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2 pl-10 pr-4 outline-none transition focus:border-purple-500"
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
                <UserRoleDropdown
                  className="w-full lg:w-60"
                  options={positionFilterOptions}
                  value={positionFilter}
                  onChange={setPositionFilter}
                />
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur">
                <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <table className="w-full min-w-[68rem]">
                    <thead>
                      <tr className="bg-gray-800/50 text-left text-sm text-gray-400">
                        <th className="px-4 py-3 font-medium">Nhân viên</th>
                        <th className="px-4 py-3 font-medium">Liên hệ</th>
                        <th className="px-4 py-3 font-medium">Chức vụ</th>
                        <th className="px-4 py-3 font-medium">Rạp làm việc</th>
                        <th className="px-4 py-3 font-medium">Ca làm</th>
                        <th className="px-4 py-3 font-medium">Lương</th>
                        <th className="px-4 py-3 font-medium">Trạng thái</th>
                        <th className="px-4 py-3 font-medium">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {visibleStaff.map((staff) => (
                        <tr key={staff.id} className="hover:bg-gray-800/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 font-bold">
                                {staff.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium">{staff.name}</p>
                                <p className="text-xs text-gray-400">{staff.employeeCode}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm">{staff.email}</p>
                            <p className="text-xs text-gray-400">{staff.phone}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-1 text-xs ${positionBadgeClass[staff.position]}`}>
                              {positionLabel[staff.position]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300">{staff.branch}</td>
                          <td className="px-4 py-3 text-sm text-gray-300">{staff.shift}</td>
                          <td className="px-4 py-3 font-medium text-yellow-500">{staff.salary} đ</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-1 text-xs ${statusBadgeClass[staff.status]}`}>
                              {staff.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingStaff(staff)}
                                className="rounded-lg bg-gray-800 p-2 text-blue-300 transition hover:bg-blue-600 hover:text-white"
                                aria-label={`Chỉnh sửa ${staff.name}`}
                                title="Chỉnh sửa"
                              >
                                <Pen className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingStaff(staff)}
                                className="rounded-lg bg-gray-800 p-2 text-red-300 transition hover:bg-red-600 hover:text-white"
                                aria-label={`Xóa ${staff.name}`}
                                title="Xóa"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {visibleStaff.length === 0 ? (
                        <tr>
                          <td className="px-4 py-8 text-center text-sm text-gray-500" colSpan={8}>
                            Không tìm thấy nhân viên phù hợp.
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

      <StaffFormModal mode="add" open={addStaffModalOpen} onClose={() => setAddStaffModalOpen(false)} />
      <StaffFormModal
        key={editingStaff?.id ?? "closed"}
        mode="edit"
        open={Boolean(editingStaff)}
        staff={editingStaff}
        onClose={() => setEditingStaff(null)}
      />

      {deletingStaff ? (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-staff-title"
          onMouseDown={() => setDeletingStaff(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-gray-200 bg-gray-100 p-6 text-gray-950 shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h3 id="delete-staff-title" className="text-xl font-bold">
              Xác nhận xóa nhân viên
            </h3>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Bạn có chắc muốn xóa <span className="font-semibold text-gray-950">{deletingStaff.name}</span> không?
              Thao tác này không thể hoàn tác.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeletingStaff(null)}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2 font-medium text-gray-700 transition hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => setDeletingStaff(null)}
                className="rounded-lg bg-red-600 px-5 py-2 font-semibold text-white transition hover:bg-red-500"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

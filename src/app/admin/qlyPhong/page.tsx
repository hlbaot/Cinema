"use client";

import { useState } from "react";
import ModalSuaThongTinPhong from "@/src/component/admin/modalSuaThongTinPhong";
import ModalThemPhong from "@/src/component/admin/modalThemPhong";

export type CinemaInfo = {
  address: string;
  rooms: number;
  seats: string;
  status: string;
  title: string;
};

const cinemas: CinemaInfo[] = [
  {
    address: "Tầng 3, TTTM Landmark 81, Q. Bình Thạnh",
    rooms: 8,
    seats: "1.200",
    status: "Hoạt động",
    title: "CINEPRO Landmark 81",
  },
  {
    address: "116 Nguyễn Du, Q.1, TP.HCM",
    rooms: 6,
    seats: "850",
    status: "Hoạt động",
    title: "CINEPRO Nguyễn Du",
  },
  {
    address: "242 Nguyễn Văn Lượng, Gò Vấp",
    rooms: 5,
    seats: "720",
    status: "Hoạt động",
    title: "CINEPRO Gò Vấp",
  },
];

export default function AdminRoomsPage() {
  const [addCinemaModalOpen, setAddCinemaModalOpen] = useState(false);
  const [editingCinema, setEditingCinema] = useState<CinemaInfo | null>(null);
  const [deletingCinema, setDeletingCinema] = useState<CinemaInfo | null>(null);

  return (
    <>
      <main className="flex h-full min-w-0 flex-1 flex-col bg-black">
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-gray-800/50 bg-gray-900/20 px-4 py-4 md:px-8">
            <div>
              <h3 className="text-lg font-bold text-white">Quản lý Rạp</h3>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-[10px] uppercase text-gray-500">Dashboard</span>
                <span className="text-[10px] text-gray-600">/</span>
                <span className="text-[10px] font-bold uppercase text-purple-400">Quản lý Rạp</span>
              </div>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-xs text-gray-500">Hôm nay, 10/05/2026</p>
            </div>
          </div>

          <div className="p-4 md:p-8">
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold">Quản lý Rạp</h2>
                <button
                  type="button"
                  onClick={() => setAddCinemaModalOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 font-medium transition hover:opacity-90"
                >
                  <span>➕</span> Thêm rạp mới
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {cinemas.map((cinema) => (
                  <div
                    key={cinema.title}
                    className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur transition hover:border-purple-500/50"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-2xl">
                        🏢
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingCinema(cinema)}
                          className="rounded-lg bg-gray-800 p-2 transition hover:bg-gray-700"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingCinema(cinema)}
                          className="rounded-lg bg-gray-800 p-2 transition hover:bg-red-600"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <h3 className="mb-2 text-lg font-bold">{cinema.title}</h3>
                    <p className="mb-4 text-sm text-gray-400">📍 {cinema.address}</p>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="rounded-full bg-purple-500/20 px-3 py-1 text-purple-400">
                        {cinema.rooms} phòng
                      </span>
                      <span className="rounded-full bg-blue-500/20 px-3 py-1 text-blue-400">
                        {cinema.seats} ghế
                      </span>
                      <span className="rounded-full bg-green-500/20 px-3 py-1 text-green-400">{cinema.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <ModalThemPhong open={addCinemaModalOpen} onClose={() => setAddCinemaModalOpen(false)} />
      <ModalSuaThongTinPhong cinema={editingCinema} open={Boolean(editingCinema)} onClose={() => setEditingCinema(null)} />

      {deletingCinema ? (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-cinema-title"
          onMouseDown={() => setDeletingCinema(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-gray-200 bg-gray-100 p-6 text-gray-950 shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h3 id="delete-cinema-title" className="text-xl font-bold">
              Xác nhận xóa rạp
            </h3>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Bạn có chắc muốn xóa <span className="font-semibold text-gray-950">{deletingCinema.title}</span> không?
              Thao tác này không thể hoàn tác.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeletingCinema(null)}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2 font-medium text-gray-700 transition hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => setDeletingCinema(null)}
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

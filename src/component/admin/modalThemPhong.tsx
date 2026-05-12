"use client";

type ModalThemPhongProps = {
  open: boolean;
  onClose: () => void;
};

export default function ModalThemPhong({ open, onClose }: ModalThemPhongProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black/80 p-3 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-cinema-title"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-gray-900 p-5 shadow-2xl sm:p-6"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h3 id="add-cinema-title" className="mb-4 text-xl font-bold">
          Thêm rạp mới
        </h3>
        <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Tên rạp</label>
            <input
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-purple-500"
              placeholder="Nhập tên rạp"
              type="text"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Địa chỉ</label>
            <input
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-purple-500"
              placeholder="Nhập địa chỉ"
              type="text"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-gray-400">Số phòng</label>
              <input
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-purple-500"
                type="number"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-400">Tổng số ghế</label>
              <input
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-purple-500"
                type="number"
              />
            </div>
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
              Thêm mới
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

type ModalThemSuatChieuProps = {
  open: boolean;
  onClose: () => void;
};

const movieOptions = ["DUNE: PART TWO", "KUNG FU PANDA 4", "GODZILLA x KONG", "OPPENHEIMER"];
const cinemaOptions = ["CINEPRO Landmark 81", "CINEPRO Nguyễn Du", "CINEPRO Gò Vấp"];
const roomOptions = ["IMAX 1", "Phòng 3", "Gold Class", "Phòng 1"];
const formatOptions = ["IMAX", "2D", "Gold Class"];

export default function ModalThemSuatChieu({ open, onClose }: ModalThemSuatChieuProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black/80 p-3 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-show-title"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 p-5 text-white shadow-2xl sm:p-6"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 id="add-show-title" className="text-xl font-bold">
              Thêm suất chiếu
            </h3>
            <p className="mt-1 text-sm text-gray-400">Thiết lập phim, rạp, phòng và số ghế cho suất chiếu mới</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-gray-300 transition hover:bg-gray-700 hover:text-white"
          >
            Đóng
          </button>
        </div>

        <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-gray-400">Phim</label>
              <select
                defaultValue="DUNE: PART TWO"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-purple-500"
              >
                {movieOptions.map((movie) => (
                  <option key={movie} value={movie}>
                    {movie}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">Rạp</label>
              <select
                defaultValue="CINEPRO Landmark 81"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-purple-500"
              >
                {cinemaOptions.map((cinema) => (
                  <option key={cinema} value={cinema}>
                    {cinema}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">Phòng</label>
              <select
                defaultValue="IMAX 1"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-purple-500"
              >
                {roomOptions.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">Định dạng</label>
              <select
                defaultValue="IMAX"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-purple-500"
              >
                {formatOptions.map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">Ngày chiếu</label>
              <input
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-purple-500"
                type="date"
                defaultValue="2026-05-10"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">Giờ chiếu</label>
              <input
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-purple-500"
                type="time"
                defaultValue="10:00"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">Tổng số ghế</label>
              <input
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-purple-500"
                type="number"
                defaultValue="120"
                min="0"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">Ghế trống</label>
              <input
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-purple-500"
                type="number"
                defaultValue="45"
                min="0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg bg-gray-700 py-2 font-medium transition hover:bg-gray-600"
            >
              Hủy
            </button>
            <button
              type="button"
              className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 py-2 font-medium transition hover:opacity-90"
            >
              Thêm suất chiếu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

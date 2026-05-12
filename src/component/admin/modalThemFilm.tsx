"use client";

import {
  Calendar,
  Clock,
  Film,
  Info,
  Link2,
  Save,
  ShieldAlert,
  Tag,
  Type,
  Upload,
  User,
  Users,
  X,
} from "lucide-react";

type ModalThemFilmProps = {
  open: boolean;
  onClose: () => void;
};

const genres = ["Sci-Fi", "Adventure", "Drama", "Action"];

export default function ModalThemFilm({ open, onClose }: ModalThemFilmProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-2 backdrop-blur-md sm:p-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-movie-title"
      onMouseDown={onClose}
    >
      <div
        className="animate-in fade-in zoom-in flex max-h-[96vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl duration-300"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-800 bg-gray-900/50 p-3 backdrop-blur-md sm:p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/20">
              <Film className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <h3 id="add-movie-title" className="text-lg font-bold text-white">
                Thêm Phim Mới
              </h3>
              <p className="text-xs text-gray-400">Vui lòng điền đầy đủ thông tin phim bên dưới</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
            aria-label="Đóng modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 [scrollbar-width:none] sm:p-4 [&::-webkit-scrollbar]:hidden">
          <form className="grid grid-cols-1 gap-4 lg:grid-cols-12" onSubmit={(event) => event.preventDefault()}>
            <div className="space-y-3 lg:col-span-4">
              <div className="group relative">
                <div className="mx-auto flex aspect-[2/3] w-full max-w-[13rem] flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-700 bg-gray-800 p-3 text-center transition-colors group-hover:border-purple-500/50 lg:max-w-none">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-700/50">
                    <Upload className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-300">Tải lên Poster</p>
                  <p className="mt-2 text-xs text-gray-500">Dạng ảnh .jpg, .png (Tỷ lệ 2:3)</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <label className="mb-1 block px-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Độ tuổi được xem
                  </label>
                  <div className="relative">
                    <ShieldAlert className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400" />
                    <select
                      defaultValue="p"
                      className="w-full appearance-none rounded-xl border border-gray-700 bg-gray-800/50 py-2.5 pl-10 pr-4 text-sm text-white transition-all focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="p">P - Phổ biến</option>
                      <option value="k">K - Cần phụ huynh (dưới 13)</option>
                      <option value="13 tuổi">T13 - Cấm dưới 13 tuổi</option>
                      <option value="16 tuổi">T16 - Cấm dưới 16 tuổi</option>
                      <option value="18 tuổi">T18 - Cấm dưới 18 tuổi</option>
                    </select>
                  </div>
                </div>

                <div className="relative">
                  <label className="mb-1 block px-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Thời lượng (phút)
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400" />
                    <input
                      placeholder="120"
                      className="w-full rounded-xl border border-gray-700 bg-gray-800/50 py-2.5 pl-10 pr-4 text-sm font-medium text-white transition-all focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      type="number"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 lg:col-span-8">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block px-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Tên phim
                  </label>
                  <div className="relative">
                    <Type className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400" />
                    <input
                      placeholder="Nhập tên phim chính xác"
                      className="w-full rounded-xl border border-gray-700 bg-gray-800/50 py-2.5 pl-10 pr-4 text-sm font-medium italic text-white transition-all focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      type="text"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block px-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Thể loại
                  </label>
                  <div className="group/genres relative">
                    <Tag className="absolute left-3 top-3 h-4 w-4 text-pink-400" />
                    <div className="min-h-10 rounded-xl border border-gray-700 bg-gray-800/50 py-1.5 pl-10 pr-4 transition-all focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500">
                      <div className="flex flex-wrap gap-2">
                        <span className="mt-1 text-sm text-gray-500">Chọn thể loại...</span>
                      </div>
                    </div>
                    <div className="absolute left-0 top-full z-20 mt-2 hidden max-h-60 w-full overflow-y-auto rounded-xl border border-gray-800 bg-gray-900 shadow-2xl [scrollbar-width:none] hover:block group-focus-within/genres:block [&::-webkit-scrollbar]:hidden">
                      <div className="grid grid-cols-2 gap-1 p-2">
                        {genres.map((genre) => (
                          <button
                            key={genre}
                            type="button"
                            className="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-gray-400 transition-colors hover:bg-gray-800"
                          >
                            {genre}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block px-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Trạng thái
                  </label>
                  <div className="relative">
                    <Info className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
                    <select
                      defaultValue="showing"
                      className="w-full appearance-none rounded-xl border border-gray-700 bg-gray-800/50 py-2.5 pl-10 pr-4 text-sm text-white transition-all focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="showing">🎬 Đang chiếu</option>
                      <option value="coming">⏳ Sắp chiếu</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block px-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Đạo diễn
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-400" />
                    <input
                      placeholder="Tên đạo diễn"
                      className="w-full rounded-xl border border-gray-700 bg-gray-800/50 py-2.5 pl-10 pr-4 text-sm text-white transition-all focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      type="text"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block px-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Diễn viên
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-400" />
                    <input
                      placeholder="Tên các diễn viên (cách nhau bởi dấu phẩy)"
                      className="w-full rounded-xl border border-gray-700 bg-gray-800/50 py-2.5 pl-10 pr-4 text-sm text-white transition-all focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      type="text"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block px-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Link Trailer (YouTube)
                  </label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
                    <input
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full rounded-xl border border-gray-700 bg-gray-800/50 py-2.5 pl-10 pr-4 text-sm text-white transition-all focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      type="url"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block px-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Link Poster Image
                  </label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
                    <input
                      placeholder="URL hình ảnh poster"
                      className="w-full rounded-xl border border-gray-700 bg-gray-800/50 py-2.5 pl-10 pr-4 text-sm text-white transition-all focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      type="text"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block px-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Ngày công chiếu
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-400" />
                    <input
                      className="w-full rounded-xl border border-gray-700 bg-gray-800/50 py-2.5 pl-10 pr-4 text-sm text-white transition-all focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      type="date"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block px-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Ngày kết thúc
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-400" />
                    <input
                      className="w-full rounded-xl border border-gray-700 bg-gray-800/50 py-2.5 pl-10 pr-4 text-sm text-white transition-all focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      type="date"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="sticky bottom-0 flex flex-col-reverse items-stretch gap-3 border-t border-gray-800 bg-gray-900/50 p-3 backdrop-blur-md sm:flex-row sm:items-center sm:justify-end sm:p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gray-800 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-gray-700"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-7 py-2 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition-all hover:from-purple-500 hover:to-pink-500 active:scale-95"
          >
            <Save className="h-4 w-4" />
            Thêm Phim Mới
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { ChevronDown, Pen, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import ModalThemFilm from "@/src/component/admin/modalThemFilm";
import { dataMovie, type Movie } from "@/src/data/movie";

type StatusFilter = "all" | "showing" | "coming";

const statusOptions: Array<{ label: string; value: StatusFilter }> = [
  { label: "Tất cả trạng thái", value: "all" },
  { label: "Đang chiếu", value: "showing" },
  { label: "Sắp chiếu", value: "coming" },
];

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isShowingMovie(movie: Movie) {
  const rawStatus = movie.status.toLowerCase();
  const status = normalizeText(movie.status);

  return status.includes("dang") || (rawStatus.includes("ang") && rawStatus.includes("chi"));
}

function isComingMovie(movie: Movie) {
  return !isShowingMovie(movie);
}

function getStatusLabel(movie: Movie) {
  return isShowingMovie(movie) ? "Đang chiếu" : "Sắp ra mắt";
}

function getStatusClass(movie: Movie) {
  return isShowingMovie(movie) ? "bg-green-500 text-white" : "bg-yellow-500 text-black";
}

function getAgeRatingClass(ageRating: string) {
  if (ageRating.includes("18")) {
    return "border-red-500/50 bg-red-500/10 text-red-500";
  }

  if (ageRating.includes("16")) {
    return "border-orange-500/50 bg-orange-500/10 text-orange-500";
  }

  return "border-yellow-500/50 bg-yellow-500/10 text-yellow-500";
}

function matchesStatus(movie: Movie, statusFilter: StatusFilter) {
  if (statusFilter === "showing") {
    return isShowingMovie(movie);
  }

  if (statusFilter === "coming") {
    return isComingMovie(movie);
  }

  return true;
}

export default function AdminMoviesPage() {
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [addMovieModalOpen, setAddMovieModalOpen] = useState(false);
  const currentStatus = statusOptions.find((option) => option.value === statusFilter) ?? statusOptions[0];
  const filteredMovies = useMemo(() => {
    const normalizedSearch = normalizeText(searchValue.trim());

    return dataMovie.filter((movie) => {
      const matchesSearch = normalizedSearch.length === 0 || normalizeText(movie.title).includes(normalizedSearch);

      return matchesSearch && matchesStatus(movie, statusFilter);
    });
  }, [searchValue, statusFilter]);

  return (
    <>
      <div className="h-full flex-1 overflow-y-auto">
      <div className="flex items-center justify-between border-b border-gray-800/50 bg-gray-900/20 px-4 py-4 md:px-8">
        <div>
          <h3 className="text-lg font-bold text-white">Quản lý Phim</h3>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="text-[10px] uppercase text-gray-500">Dashboard</span>
            <span className="text-[10px] text-gray-600">/</span>
            <span className="text-[10px] font-bold uppercase text-purple-400">Quản lý Phim</span>
          </div>
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-xs text-gray-500">Hôm nay, 09/05/2026</p>
        </div>
      </div>

      <div className="p-4 md:p-8">
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold text-white">Quản lý Phim</h2>
            <button
              type="button"
              onClick={() => setAddMovieModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 font-medium shadow-lg shadow-purple-500/20 transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Thêm phim mới
            </button>
          </div>

          <div className="mb-4 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                placeholder="Tìm kiếm phim..."
                className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2 pl-10 pr-4 text-white outline-none transition placeholder:text-gray-500 focus:border-purple-500"
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
            </div>

            <div
              className="relative w-full md:w-56"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setStatusMenuOpen(false);
                }
              }}
            >
              <button
                type="button"
                onClick={() => setStatusMenuOpen((open) => !open)}
                className={`flex w-full items-center justify-between border bg-gray-800 px-4 py-2 text-left text-white outline-none transition hover:border-purple-500 ${
                  statusMenuOpen ? "rounded-t-lg border-purple-500" : "rounded-lg border-gray-700"
                }`}
              >
                <span>{currentStatus.label}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${statusMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {statusMenuOpen ? (
                <div className="absolute left-0 right-0 top-[calc(100%-1px)] z-20 overflow-hidden rounded-b-lg border border-t-0 border-purple-500 bg-gray-800 shadow-xl shadow-black/30">
                  {statusOptions.map((option) => {
                    const selected = option.value === statusFilter;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setStatusFilter(option.value);
                          setStatusMenuOpen(false);
                        }}
                        className={`block w-full px-4 py-2 text-left transition ${
                          selected ? "bg-blue-600 text-white" : "text-white hover:bg-gray-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMovies.map((movie) => (
              <div
                key={movie.id}
                className="group overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur transition hover:border-purple-500/50"
              >
                <div className="relative h-64">
                  <Image
                    alt={movie.title}
                    className="object-cover"
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    src={movie.poster}
                  />
                  <div className="absolute right-2 top-2">
                    <span className={`rounded-full px-2 py-1 text-xs ${getStatusClass(movie)}`}>
                      {getStatusLabel(movie)}
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition group-hover:opacity-100">
                    <button className="rounded-lg bg-blue-500/80 p-2 shadow-lg backdrop-blur transition hover:bg-blue-600" title="Sửa">
                      <Pen className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg bg-red-500/80 p-2 shadow-lg backdrop-blur transition hover:bg-red-600" title="Xóa">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="mb-2 line-clamp-1 text-lg font-bold text-white">{movie.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${getAgeRatingClass(
                        movie.age_rating,
                      )}`}
                    >
                      {movie.age_rating}
                    </span>
                    <span>🎫 0 vé</span>
                  </div>
                  <p className="mt-2 font-medium text-purple-400">0&nbsp;₫</p>
                </div>
              </div>
            ))}
          </div>

          {filteredMovies.length === 0 ? (
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-8 text-center text-gray-400">
              Không tìm thấy phim phù hợp.
            </div>
          ) : null}
        </div>
      </div>
      </div>

      <ModalThemFilm open={addMovieModalOpen} onClose={() => setAddMovieModalOpen(false)} />
    </>
  );
}

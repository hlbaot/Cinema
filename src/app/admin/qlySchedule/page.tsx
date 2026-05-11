"use client";

import { useState } from "react";
import ModalThemSuatChieu from "@/src/component/admin/modalThemSuatChieu";

type ScheduleRow = {
  availableSeats: number;
  cinema: string;
  format: "2D" | "Gold Class" | "IMAX";
  movie: string;
  room: string;
  time: string;
  totalSeats: number;
};

type DropdownOption = {
  label: string;
  value: string;
};

const cinemas = ["CINEPRO Landmark 81", "CINEPRO Nguyễn Du", "CINEPRO Gò Vấp"];
const movies = ["DUNE: PART TWO", "OPPENHEIMER", "GODZILLA x KONG"];

const cinemaOptions: DropdownOption[] = [
  { label: "Tất cả rạp", value: "" },
  ...cinemas.map((cinema) => ({ label: cinema, value: cinema })),
];

const movieOptions: DropdownOption[] = [
  { label: "Tất cả phim", value: "" },
  ...movies.map((movie) => ({ label: movie, value: movie })),
];

const scheduleRows: ScheduleRow[] = [
  {
    availableSeats: 45,
    cinema: "CINEPRO Landmark 81",
    format: "IMAX",
    movie: "Dune: Part Two",
    room: "IMAX 1",
    time: "10:00",
    totalSeats: 120,
  },
  {
    availableSeats: 80,
    cinema: "CINEPRO Landmark 81",
    format: "2D",
    movie: "Kung Fu Panda 4",
    room: "Phòng 3",
    time: "12:30",
    totalSeats: 150,
  },
  {
    availableSeats: 12,
    cinema: "CINEPRO Nguyễn Du",
    format: "Gold Class",
    movie: "Godzilla x Kong",
    room: "Gold Class",
    time: "14:00",
    totalSeats: 40,
  },
  {
    availableSeats: 0,
    cinema: "CINEPRO Landmark 81",
    format: "IMAX",
    movie: "Dune: Part Two",
    room: "IMAX 1",
    time: "16:30",
    totalSeats: 120,
  },
  {
    availableSeats: 65,
    cinema: "CINEPRO Gò Vấp",
    format: "2D",
    movie: "Oppenheimer",
    room: "Phòng 1",
    time: "19:00",
    totalSeats: 100,
  },
];

const formatBadgeClass: Record<ScheduleRow["format"], string> = {
  "2D": "bg-gray-500/20 text-gray-400",
  "Gold Class": "bg-yellow-500/20 text-yellow-400",
  IMAX: "bg-blue-500/20 text-blue-400",
};

function normalizeFilter(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function FilterSelect({
  onChange,
  options,
  value,
}: {
  onChange: (value: string) => void;
  options: DropdownOption[];
  value: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <div
      className="relative min-w-0"
      onBlur={(event) => {
        const nextFocus = event.relatedTarget;

        if (!(nextFocus instanceof Node) || !event.currentTarget.contains(nextFocus)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full min-w-0 items-center justify-between gap-2 rounded-lg border bg-gray-800 px-4 py-2 text-left text-white outline-none transition ${
          open ? "border-purple-500 ring-2 ring-purple-500/20" : "border-gray-700 hover:border-purple-500/70"
        }`}
        aria-expanded={open}
      >
        <span className="truncate">{selected.label}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180 text-purple-400" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div
        className={`absolute left-0 top-full z-30 mt-2 w-full origin-top overflow-hidden rounded-xl border border-purple-500/40 bg-gray-900 shadow-2xl shadow-black/40 transition-all duration-200 ${
          open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-1 scale-95 opacity-0"
        }`}
      >
        <div className="p-1.5">
          {options.map((option) => {
            const active = option.value === selected.value;

            return (
              <button
                key={option.value || option.label}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition ${
                  active ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <span className="truncate">{option.label}</span>
                {active ? <span className="shrink-0 text-xs">✓</span> : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AdminSchedulePage() {
  const [addShowModalOpen, setAddShowModalOpen] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState(cinemaOptions[0].value);
  const [selectedMovie, setSelectedMovie] = useState(movieOptions[0].value);

  const visibleRows = scheduleRows.filter((show) => {
    const matchesCinema = !selectedCinema || show.cinema === selectedCinema;
    const matchesMovie = !selectedMovie || normalizeFilter(show.movie) === normalizeFilter(selectedMovie);

    return matchesCinema && matchesMovie;
  });

  return (
    <>
      <div className="flex h-full min-w-0 flex-1 flex-col bg-black text-white">
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-gray-800/50 bg-gray-900/20 px-4 py-4 md:px-8">
            <div>
              <h3 className="text-lg font-bold text-white">Lịch chiếu</h3>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-[10px] uppercase text-gray-500">Dashboard</span>
                <span className="text-[10px] text-gray-600">/</span>
                <span className="text-[10px] font-bold uppercase text-purple-400">Lịch chiếu</span>
              </div>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-xs text-gray-500">Hôm nay, 10/05/2026</p>
            </div>
          </div>

          <div className="p-4 md:p-8">
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold">Quản lý Lịch chiếu</h2>
                <button
                  type="button"
                  onClick={() => setAddShowModalOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 font-medium transition hover:opacity-90"
                >
                  <span>➕</span> Thêm suất chiếu
                </button>
              </div>

              <div className="mb-4 grid grid-cols-3 gap-3 md:gap-4">
                <input
                  className="min-w-0 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white shadow-lg shadow-black/10 outline-none transition [color-scheme:dark] hover:border-purple-500/70 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:rounded-md [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:transition"
                  type="date"
                  defaultValue="2026-05-10"
                />
                <FilterSelect options={cinemaOptions} value={selectedCinema} onChange={setSelectedCinema} />
                <FilterSelect options={movieOptions} value={selectedMovie} onChange={setSelectedMovie} />
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur">
                <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <table className="w-full min-w-[58rem]">
                    <thead>
                      <tr className="bg-gray-800/50 text-left text-sm text-gray-400">
                        <th className="px-4 py-3 font-medium">Phim</th>
                        <th className="px-4 py-3 font-medium">Rạp</th>
                        <th className="px-4 py-3 font-medium">Phòng</th>
                        <th className="px-4 py-3 font-medium">Giờ chiếu</th>
                        <th className="px-4 py-3 font-medium">Định dạng</th>
                        <th className="px-4 py-3 font-medium">Ghế trống</th>
                        <th className="px-4 py-3 font-medium">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {visibleRows.map((show) => {
                        const percent = (show.availableSeats / show.totalSeats) * 100;
                        const progressClass = show.availableSeats === 0 ? "bg-red-500" : "bg-green-500";

                        return (
                          <tr key={`${show.movie}-${show.time}-${show.room}`} className="hover:bg-gray-800/50">
                            <td className="px-4 py-3 font-medium">{show.movie}</td>
                            <td className="px-4 py-3 text-gray-400">{show.cinema}</td>
                            <td className="px-4 py-3">{show.room}</td>
                            <td className="px-4 py-3 font-mono text-yellow-500">{show.time}</td>
                            <td className="px-4 py-3">
                              <span className={`rounded px-2 py-1 text-xs ${formatBadgeClass[show.format]}`}>
                                {show.format}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-700">
                                  <div
                                    className={`h-full rounded-full ${progressClass}`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                                <span className="text-sm text-gray-400">
                                  {show.availableSeats}/{show.totalSeats}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button type="button" className="rounded p-1 transition hover:bg-gray-700">
                                  ✏️
                                </button>
                                <button type="button" className="rounded p-1 transition hover:bg-red-600">
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {visibleRows.length === 0 ? (
                        <tr>
                          <td className="px-4 py-8 text-center text-sm text-gray-500" colSpan={7}>
                            Không có suất chiếu phù hợp với bộ lọc hiện tại.
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

      <ModalThemSuatChieu open={addShowModalOpen} onClose={() => setAddShowModalOpen(false)} />
    </>
  );
}

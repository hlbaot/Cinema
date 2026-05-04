"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Particles from "@/public/uiux/Particles";
import { dataMovie } from "@/src/data/movie";

const TIME_ZONE = "Asia/Ho_Chi_Minh";
const WEEKDAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function ClapperboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-yellow-400" aria-hidden="true">
      <path
        d="M4 8.5h16M6 3l3.5 5M12 3l3.5 5M18 3l2 3M6 21h12a2 2 0 0 0 2-2V8.5H4V19a2 2 0 0 0 2 2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-slate-500" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-yellow-400" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function getTodayParts() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(new Date());
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  return { year, month, day };
}

function createDateAtUtcMidnight(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day));
}

function formatIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildDateItems(today: Date) {
  return Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() + offset);

    return {
      iso: formatIsoDate(date),
      weekdayLabel: offset === 0 ? "HOM NAY" : WEEKDAY_LABELS[date.getUTCDay()],
      dateLabel: `${String(date.getUTCDate()).padStart(2, "0")}/${String(date.getUTCMonth() + 1).padStart(2, "0")}`,
      isToday: offset === 0,
    };
  });
}

function getShowtimesForMovie(movieId: number, dateIso: string) {
  const seed = Number(dateIso.slice(-2)) + movieId;
  const baseSets = [
    ["09:15", "12:30", "15:45", "19:00"],
    ["10:00", "13:20", "16:40", "20:10"],
    ["08:40", "11:55", "15:10", "18:25"],
    ["09:45", "13:00", "16:15", "19:30"],
  ];

  return baseSets[seed % baseSets.length];
}

export default function SchedulePage() {
  const [searchValue, setSearchValue] = useState("");
  const [today, setToday] = useState(() => {
    const { year, month, day } = getTodayParts();
    return createDateAtUtcMidnight(year, month, day);
  });

  const [selectedDateIso, setSelectedDateIso] = useState(() => formatIsoDate(today));

  useEffect(() => {
    const tickToday = () => {
      const { year, month, day } = getTodayParts();
      const nextToday = createDateAtUtcMidnight(year, month, day);
      const nextIso = formatIsoDate(nextToday);

      setToday(nextToday);
      setSelectedDateIso((current) => {
        const currentVisibleDates = buildDateItems(nextToday).map((item) => item.iso);
        return currentVisibleDates.includes(current) ? current : nextIso;
      });
    };

    tickToday();

    const intervalId = window.setInterval(tickToday, 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const dateItems = useMemo(() => buildDateItems(today), [today]);

  const visibleMovies = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return dataMovie
      .filter((movie) => movie.status === "Đang chiếu")
      .filter((movie) => movie.title.toLowerCase().includes(normalizedSearch));
  }, [searchValue]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-black text-white">
      <Particles />

      <div className="relative mx-auto mt-12 w-full max-w-[1680px] px-4 py-8 sm:mt-14 sm:px-6 lg:mt-16 lg:px-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] border border-yellow-400/20 bg-yellow-400/10 shadow-[0_0_24px_rgba(250,204,21,0.1)]">
            <ClapperboardIcon />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-yellow-400 sm:text-4xl">Lịch chiếu phim</h1>
            <p className="mt-1 text-sm text-slate-400">Chọn ngày phù hợp và tìm nhanh bộ phim bạn muốn xem.</p>
          </div>
        </div>

        <div className="mb-7 rounded-[1.5rem] border border-slate-700/80 bg-slate-900/70 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <label className="flex items-center gap-3 rounded-[1rem] px-4 py-3">
            <SearchIcon />
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Tìm theo tên phim..."
              className="w-full bg-transparent text-base text-white outline-none placeholder:text-slate-500"
            />
          </label>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
          {dateItems.map((item) => {
            const isActive = item.iso === selectedDateIso;

            return (
              <button
                key={item.iso}
                type="button"
                onClick={() => setSelectedDateIso(item.iso)}
                className={`rounded-[1.3rem] border px-3 py-4 text-center transition-all ${
                  isActive
                    ? "border-yellow-300 bg-yellow-400 text-slate-950 shadow-[0_0_35px_rgba(250,204,21,0.26)]"
                    : "border-slate-700/90 bg-slate-900/80 text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] hover:border-slate-500 hover:bg-slate-800/90"
                }`}
              >
                <p className={`text-sm font-bold tracking-wide ${isActive ? "text-slate-950" : "text-slate-400"}`}>{item.weekdayLabel}</p>
                <p className="mt-2 text-2xl font-black sm:text-[2rem]">{item.dateLabel}</p>
              </button>
            );
          })}
        </div>

        {visibleMovies.length > 0 ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {visibleMovies.map((movie) => (
              <article
                key={`${selectedDateIso}-${movie.id}`}
                className="overflow-hidden rounded-[1.7rem] border border-slate-800/90 bg-slate-950/72 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md"
              >
                <div className="flex flex-col lg:flex-row">
                  <div className="relative h-56 w-full shrink-0 overflow-hidden lg:h-auto lg:w-[220px]">
                    <Image src={movie.poster} alt={movie.title} fill className="object-cover" sizes="250px" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent lg:bg-gradient-to-r" />
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white">
                        {movie.status}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
                        {movie.age_rating}
                      </span>
                    </div>

                    <h2 className="text-xl font-black text-white sm:text-2xl">{movie.title}</h2>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-300">
                      <span className="font-semibold text-yellow-400">{movie.score}%</span>
                      <span>{movie.minutes} phút</span>
                      <span>{selectedDateIso.split("-").reverse().join("/")}</span>
                    </div>

                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-400">{movie.description}</p>

                    <div className="mt-5">
                      <div className="mb-3 flex items-center gap-2">
                        <ClockIcon />
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Suất chiếu</p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {getShowtimesForMovie(movie.id, selectedDateIso).map((time) => (
                          <button
                            key={`${movie.id}-${selectedDateIso}-${time}`}
                            type="button"
                            className="rounded-full border border-slate-700 bg-slate-900/90 px-4 py-2 text-sm font-semibold text-slate-100 transition-colors hover:border-yellow-400 hover:bg-slate-800 hover:text-yellow-300"
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link
                        href="/datVe"
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-transform hover:scale-[1.02]"
                      >
                        Đặt vé ngay
                      </Link>

                      <Link
                        href={movie.trailer}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-900/80 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-slate-400 hover:bg-slate-800"
                      >
                        Xem trailer
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.8rem] border border-red-900/70 bg-red-950/20 px-7 py-5 text-sm text-red-200 shadow-[0_12px_40px_rgba(127,29,29,0.15)] backdrop-blur-sm">
            Khong co phim dang chieu.
          </div>
        )}
      </div>
    </section>
  );
}

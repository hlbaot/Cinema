
'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

type ShowtimeStatus = 'scheduled' | 'ongoing' | 'ended' | 'cancelled'

interface ScheduleRow {
  id: string
  movie_title: string
  room_name: string
  date: string
  start_time: string
  end_time: string
  format: string
  booked: number
  capacity: number
  status: ShowtimeStatus
}

const STATUS_CONFIG: Record<ShowtimeStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  scheduled: { label: 'Sắp chiếu', color: 'text-violet-300', bg: 'bg-violet-500/10', border: 'border-violet-500/25', dot: 'bg-violet-400' },
  ongoing: { label: 'Đang chiếu', color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', dot: 'bg-emerald-400' },
  ended: { label: 'Đã kết thúc', color: 'text-slate-400', bg: 'bg-white/5', border: 'border-white/10', dot: 'bg-slate-500' },
  cancelled: { label: 'Đã hủy', color: 'text-red-300', bg: 'bg-red-500/10', border: 'border-red-500/25', dot: 'bg-red-400' },
}

const WEEKDAY_SHORT = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

function startOfWeekMonday(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  const day = x.getDay()
  const diff = day === 0 ? -6 : 1 - day
  x.setDate(x.getDate() + diff)
  return x
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

function formatYMD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDM(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

function slotKey(date: string, start: string, room: string) {
  return `${date}|${start}|${room}`
}

/**
 * Sinh thêm suất "tự động" cho tuần đang xem (không trùng phòng + giờ bắt đầu với lịch hiện có).
 * Khi nối API backend, thay phần này bằng gọi endpoint tạo lịch hàng loạt.
 */
function generateAutoSlots(weekMonday: Date, existing: ScheduleRow[]): ScheduleRow[] {
  const y = (offset: number) => formatYMD(addDays(weekMonday, offset))
  const taken = new Set(existing.map(r => slotKey(r.date, r.start_time, r.room_name)))
  const templates = [
    { start: '11:00', end: '13:05' },
    { start: '13:30', end: '15:35' },
    { start: '16:00', end: '18:00' },
    { start: '18:30', end: '20:40' },
    { start: '21:15', end: '23:15' },
  ]
  const rooms = ['Phòng 1', 'Phòng 2', 'Phòng 3']
  const titles = ['Suất tự động (sáng)', 'Suất tự động (chiều)', 'Suất tự động (tối)', 'Chiếu thử nghiệm', 'Block marketing']
  const batchId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : String(Date.now())
  const out: ScheduleRow[] = []
  let n = 0
  const maxPerClick = 24

  for (let d = 0; d < 7; d++) {
    const date = y(d)
    for (const t of templates) {
      if (out.length >= maxPerClick) return out
      const room = rooms[n % rooms.length]
      const k = slotKey(date, t.start, room)
      if (taken.has(k)) continue
      taken.add(k)
      out.push({
        id: `auto-${batchId}-${n}`,
        movie_title: titles[n % titles.length],
        room_name: room,
        date,
        start_time: t.start,
        end_time: t.end,
        format: n % 4 === 0 ? 'IMAX' : n % 2 === 0 ? '2D' : '3D',
        booked: Math.min(75, (n * 7) % 80),
        capacity: 80,
        status: 'scheduled',
      })
      n++
    }
  }
  return out
}

/** Dữ liệu mẫu gắn theo tuần (thứ 2 → chủ nhật) để demo lịch tuần */
function buildMockForWeek(weekMonday: Date): ScheduleRow[] {
  const y = (offset: number) => formatYMD(addDays(weekMonday, offset))
  const stamp = weekMonday.getTime()
  return [
    { id: `${stamp}-a`, movie_title: 'ĐẠI TIỆC TRĂNG MÁU 8', room_name: 'Phòng 1', date: y(0), start_time: '10:00', end_time: '12:10', format: '2D', booked: 20, capacity: 80, status: 'ended' },
    { id: `${stamp}-b`, movie_title: 'ĐẠI TIỆC TRĂNG MÁU 8', room_name: 'Phòng 1', date: y(0), start_time: '18:30', end_time: '20:40', format: '2D', booked: 45, capacity: 80, status: 'scheduled' },
    { id: `${stamp}-c`, movie_title: 'PHÍ PHÔNG', room_name: 'Phòng 1', date: y(0), start_time: '21:10', end_time: '23:00', format: '2D', booked: 12, capacity: 80, status: 'scheduled' },
    { id: `${stamp}-d`, movie_title: 'GẤU BOONIE', room_name: 'Phòng 2', date: y(1), start_time: '14:00', end_time: '15:55', format: '3D', booked: 60, capacity: 80, status: 'scheduled' },
    { id: `${stamp}-e`, movie_title: 'IMAX Demo', room_name: 'IMAX', date: y(2), start_time: '09:30', end_time: '12:00', format: 'IMAX', booked: 180, capacity: 200, status: 'ongoing' },
    { id: `${stamp}-f`, movie_title: 'Lilo & Stitch', room_name: 'Phòng 2', date: y(3), start_time: '16:00', end_time: '17:45', format: '2D', booked: 0, capacity: 96, status: 'cancelled' },
    { id: `${stamp}-g`, movie_title: 'Paddington', room_name: 'Phòng 3', date: y(4), start_time: '19:00', end_time: '20:50', format: '2D', booked: 40, capacity: 100, status: 'scheduled' },
    { id: `${stamp}-h`, movie_title: 'Marathon đêm', room_name: 'Phòng 1', date: y(5), start_time: '22:30', end_time: '01:00', format: '2D', booked: 5, capacity: 80, status: 'scheduled' },
    { id: `${stamp}-i`, movie_title: 'Suất sớm CN', room_name: 'Phòng 2', date: y(6), start_time: '08:00', end_time: '09:45', format: '2D', booked: 15, capacity: 80, status: 'scheduled' },
  ]
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function ChevronLeft() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function SparklesIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4M22 5h-4M4 17v2M5 18H3" />
    </svg>
  )
}

function FilterTab({ active, count, label, onClick }: { active: boolean; count: number; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 items-center gap-2 rounded-lg border px-3 text-xs font-black uppercase tracking-wide transition-all ${
        active ? 'border-violet-500/40 bg-violet-500/15 text-violet-300' : 'border-white/10 bg-white/[0.03] text-slate-500 hover:border-white/20 hover:text-white'
      }`}
    >
      {label}
      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${active ? 'bg-violet-500/30 text-violet-300' : 'bg-white/10 text-slate-500'}`}>{count}</span>
    </button>
  )
}

export default function AdminSchedulePage() {
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeekMonday(new Date()))
  const [rows, setRows] = useState<ScheduleRow[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | ShowtimeStatus>('all')
  const [autoWorking, setAutoWorking] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setRows(buildMockForWeek(weekStart))
  }, [weekStart])

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i)
      return {
        date,
        ymd: formatYMD(date),
        label: WEEKDAY_SHORT[i],
        sub: formatDM(date),
        isToday: formatYMD(new Date()) === formatYMD(date),
      }
    })
  }, [weekStart])

  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart])
  const weekRangeLabel = `${formatDM(weekStart)} – ${formatDM(weekEnd)} / ${weekStart.getFullYear()}`

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return rows.filter(r => {
      const match =
        r.movie_title.toLowerCase().includes(q) ||
        r.room_name.toLowerCase().includes(q) ||
        r.date.includes(q)
      const st = filter === 'all' || r.status === filter
      return match && st
    })
  }, [rows, search, filter])

  const weekYmds = useMemo(() => weekDays.map(d => d.ymd), [weekDays])

  const inWeekFiltered = useMemo(
    () => filtered.filter(r => weekYmds.includes(r.date)),
    [filtered, weekYmds]
  )

  const byDay = useMemo(() => {
    const map = new Map<string, ScheduleRow[]>()
    for (const ymd of weekYmds) map.set(ymd, [])
    for (const r of inWeekFiltered) {
      const list = map.get(r.date)
      if (list) list.push(r)
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.start_time.localeCompare(b.start_time))
    }
    return map
  }, [inWeekFiltered, weekYmds])

  const counts = useMemo(
    () => ({
      all: rows.length,
      scheduled: rows.filter(r => r.status === 'scheduled').length,
      ongoing: rows.filter(r => r.status === 'ongoing').length,
      ended: rows.filter(r => r.status === 'ended').length,
      cancelled: rows.filter(r => r.status === 'cancelled').length,
    }),
    [rows]
  )

  const weekCounts = useMemo(
    () => ({
      all: inWeekFiltered.length,
      scheduled: inWeekFiltered.filter(r => r.status === 'scheduled').length,
      ongoing: inWeekFiltered.filter(r => r.status === 'ongoing').length,
      ended: inWeekFiltered.filter(r => r.status === 'ended').length,
      cancelled: inWeekFiltered.filter(r => r.status === 'cancelled').length,
    }),
    [inWeekFiltered]
  )

  const goPrevWeek = () => setWeekStart(d => addDays(d, -7))
  const goNextWeek = () => setWeekStart(d => addDays(d, 7))
  const goThisWeek = () => setWeekStart(startOfWeekMonday(new Date()))

  const handleAutoSchedule = () => {
    setAutoWorking(true)
    setRows(prev => {
      const extra = generateAutoSlots(weekStart, prev)
      queueMicrotask(() => {
        if (extra.length === 0) {
          alert('Không còn khung giờ trống để thêm (trùng phòng + giờ với lịch hiện tại). Đổi tuần hoặc xóa bớt suất trước.')
        } else {
          alert(`Đã thêm ${extra.length} suất chiếu tự động cho tuần này.`)
        }
        setAutoWorking(false)
      })
      if (extra.length === 0) return prev
      return [...prev, ...extra]
    })
  }

  return (
    <section className="space-y-6 text-white">
      <div className="rounded-2xl border border-white/10 bg-[#0b1019] px-6 py-6 shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Quản lý lịch chiếu</h1>
            <div className="mt-2 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-violet-400">Lịch chiếu</span>
            </div>
            <p className="mt-3 max-w-2xl text-sm text-slate-500">
              Lịch theo tuần (Thứ Hai → Chủ nhật). Dữ liệu mẫu theo tuần đang xem — có thể nối API backend sau.
            </p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[
            { label: 'Tổng suất (tuần này)', value: weekCounts.all, tone: 'text-white' },
            { label: 'Sắp chiếu', value: weekCounts.scheduled, tone: 'text-violet-300' },
            { label: 'Đang chiếu', value: weekCounts.ongoing, tone: 'text-emerald-300' },
            { label: 'Đã kết thúc', value: weekCounts.ended, tone: 'text-slate-400' },
            { label: 'Đã hủy', value: weekCounts.cancelled, tone: 'text-red-300' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className={`text-2xl font-black ${s.tone}`}>{s.value}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-600">
          Tổng mẫu toàn bộ tuần đang tải: {counts.all} suất (đổi tuần để xem bộ dữ liệu demo khác).
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0b1019] p-4 shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:w-[28rem]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"><SearchIcon /></span>
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo phim, phòng, ngày..."
              className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-11 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/40"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterTab active={filter === 'all'} label="Tất cả" count={counts.all} onClick={() => setFilter('all')} />
            <FilterTab active={filter === 'scheduled'} label="Sắp chiếu" count={counts.scheduled} onClick={() => setFilter('scheduled')} />
            <FilterTab active={filter === 'ongoing'} label="Đang chiếu" count={counts.ongoing} onClick={() => setFilter('ongoing')} />
            <FilterTab active={filter === 'ended'} label="Đã kết thúc" count={counts.ended} onClick={() => setFilter('ended')} />
            <FilterTab active={filter === 'cancelled'} label="Đã hủy" count={counts.cancelled} onClick={() => setFilter('cancelled')} />
          </div>
        </div>
      </div>

      {/* —— Bảng lịch theo tuần —— */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1019] shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-4 border-b border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tuần hiển thị</p>
            <p className="mt-1 text-lg font-black text-white">{weekRangeLabel}</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              id="btn-auto-schedule"
              onClick={handleAutoSchedule}
              disabled={autoWorking}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 text-xs font-black text-white shadow-lg shadow-emerald-500/20 transition-all hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60"
            >
              <SparklesIcon />
              Tạo lịch tự động
            </button>
            <button
              type="button"
              onClick={goPrevWeek}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/10 hover:text-white"
              aria-label="Tuần trước"
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              onClick={goThisWeek}
              className="rounded-lg border border-violet-500/30 bg-violet-500/15 px-4 py-2 text-xs font-black text-violet-200 hover:bg-violet-500/25"
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={goNextWeek}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/10 hover:text-white"
              aria-label="Tuần sau"
            >
              <ChevronRight />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="grid min-w-[840px] grid-cols-7 divide-x divide-white/10">
            {weekDays.map(day => {
              const items = byDay.get(day.ymd) ?? []
              return (
                <div
                  key={day.ymd}
                  className={`flex min-h-[320px] flex-col bg-white/[0.02] ${day.isToday ? 'ring-1 ring-inset ring-violet-500/40' : ''}`}
                >
                  <div
                    className={`border-b border-white/10 px-2 py-3 text-center ${
                      day.isToday ? 'bg-violet-500/10' : 'bg-white/[0.03]'
                    }`}
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{day.label}</p>
                    <p className={`mt-0.5 text-sm font-black ${day.isToday ? 'text-violet-300' : 'text-white'}`}>{day.sub}</p>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-2">
                    {items.length === 0 ? (
                      <p className="py-6 text-center text-[11px] text-slate-600">Trống</p>
                    ) : (
                      items.map(r => {
                        const sc = STATUS_CONFIG[r.status]
                        const pct = r.capacity ? Math.round((r.booked / r.capacity) * 100) : 0
                        return (
                          <div
                            key={r.id}
                            className={`rounded-xl border px-2.5 py-2 text-left shadow-sm ${sc.bg} ${sc.border}`}
                          >
                            <p className={`text-[10px] font-black ${sc.color}`}>
                              {r.start_time} – {r.end_time}
                            </p>
                            <p className="mt-1 line-clamp-2 text-xs font-bold leading-snug text-white">{r.movie_title}</p>
                            <p className="mt-1 text-[10px] text-slate-500">
                              {r.room_name} · <span className="text-slate-400">{r.format}</span>
                            </p>
                            <div className="mt-1.5 flex items-center justify-between gap-1">
                              <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-black ${sc.color}`}>
                                <span className={`h-1 w-1 rounded-full ${sc.dot}`} />
                                {sc.label}
                              </span>
                              <span className="text-[9px] font-mono text-slate-500">
                                {r.booked}/{r.capacity}
                                <span className="text-violet-400/70"> {pct}%</span>
                              </span>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="border-t border-white/5 px-5 py-3 text-xs font-bold text-slate-600">
          {inWeekFiltered.length} suất hiển thị trên lịch (sau tìm kiếm và lọc trạng thái)
        </div>
      </div>
    </section>
  )

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

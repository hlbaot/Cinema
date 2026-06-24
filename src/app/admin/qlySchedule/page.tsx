'use client'

import Cookies from 'js-cookie'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  API_GenerateDraftShowtimes,
  API_GetDraftShowtimes,
  API_GetPublishedShowtimes,
  API_GetShowtimeFormats,
  API_PublishAllShowtimeDrafts,
  API_PublishShowtimeDraft,
  type ShowtimeDto,
  type ShowtimeFormatOption,
} from '@/src/api/API_Showtime'
import { getApiErrorMessage } from '@/src/lib/auth-client'

type ShowtimeStatus = 'draft' | 'scheduled' | 'ongoing' | 'ended' | 'cancelled'

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
  source: 'draft' | 'published'
}

const STATUS_CONFIG: Record<ShowtimeStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  draft: { label: 'Nháp', color: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/25', dot: 'bg-amber-400' },
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

function CloseIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6 6 18" />
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

type ScheduleModal = {
  tone: 'confirm' | 'success' | 'error'
  title: string
  message: string
  cancelText: string
  confirmText: string
  onConfirm?: () => void | Promise<void>
} | null

function getString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function getNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function normalizeStatus(value: unknown): ShowtimeStatus {
  const v = typeof value === 'string' ? value.toLowerCase() : ''
  if (v === 'scheduled' || v === 'ongoing' || v === 'ended' || v === 'cancelled') return v
  return 'draft'
}

function normalizeTime(raw: unknown): string {
  const text = getString(raw)
  const m = text.match(/\b\d{2}:\d{2}\b/)
  return m?.[0] ?? (text ? text.slice(0, 5) : '--:--')
}

function normalizeDate(raw: unknown): string {
  const text = getString(raw)
  if (!text) return ''

  const ymd = text.match(/\b\d{4}-\d{2}-\d{2}\b/)
  if (ymd?.[0]) return ymd[0]

  const dmy = text.match(/\b\d{2}\/\d{2}\/\d{4}\b/)
  if (dmy?.[0]) {
    const [day, month, year] = dmy[0].split('/')
    return `${year}-${month}-${day}`
  }

  const parsed = new Date(text)
  if (!Number.isNaN(parsed.getTime())) {
    return formatYMD(parsed)
  }

  return text
}

function toScheduleRow(showtime: ShowtimeDto): ScheduleRow {
  const row = showtime as Record<string, unknown>
  const movie = (row.movie && typeof row.movie === 'object' ? row.movie : {}) as Record<string, unknown>
  const room = (row.room && typeof row.room === 'object' ? row.room : {}) as Record<string, unknown>
  const id = getString(row.id || row.showtime_id || row.session_id, `${Date.now()}-${Math.random()}`)
  const date = normalizeDate(row.date || row.show_date || row.start_date)
  const start = normalizeTime(row.start_time || row.startTime)
  const end = normalizeTime(row.end_time || row.endTime)
  const status = normalizeStatus(row.status)
  const booked = getNumber(row.booked ?? row.booked_count ?? row.total_booked, 0)
  const capacity = getNumber(row.capacity ?? row.total_seats ?? row.seat_capacity, 0)

  return {
    id,
    movie_title: getString(row.movie_title || row.title || movie.title, 'Chưa có tên phim'),
    room_name: getString(row.room_name || row.room_label || room.name, 'Chưa rõ phòng'),
    date,
    start_time: start,
    end_time: end,
    format: getString(row.format, '2d').toUpperCase(),
    booked,
    capacity,
    status,
    source: status === 'draft' ? 'draft' : 'published',
  }
}

export default function AdminSchedulePage() {
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeekMonday(new Date()))
  const [rows, setRows] = useState<ScheduleRow[]>([])
  const [draftRows, setDraftRows] = useState<ScheduleRow[]>([])
  const [publishedRows, setPublishedRows] = useState<ScheduleRow[]>([])
  const [formats, setFormats] = useState<ShowtimeFormatOption[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | ShowtimeStatus>('all')
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [publishingAll, setPublishingAll] = useState(false)
  const [publishingId, setPublishingId] = useState<string | null>(null)
  const [scheduleModal, setScheduleModal] = useState<ScheduleModal>(null)
  const [modalBusy, setModalBusy] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const showScheduleMessage = useCallback((tone: 'success' | 'error', title: string, message: string) => {
    setScheduleModal({
      tone,
      title,
      message,
      cancelText: 'Đóng',
      confirmText: 'OK',
    })
  }, [])

  const fetchDraftShowtimes = useCallback(async () => {
    setLoading(true)
    try {
      const accessToken = Cookies.get('ACCESS_TOKEN')
      const response = await API_GetDraftShowtimes({ page: 1, limit: 300 }, accessToken)
      setDraftRows(response.data.showtimes.map(toScheduleRow))
    } catch (error) {
      showScheduleMessage('error', 'Tải suất nháp thất bại', getApiErrorMessage(error, 'Không thể tải danh sách suất nháp.'))
    } finally {
      setLoading(false)
    }
  }, [showScheduleMessage])

  const fetchPublishedShowtimes = useCallback(async (date = formatYMD(weekStart)) => {
    setLoading(true)
    try {
      const response = await API_GetPublishedShowtimes(date)
      setPublishedRows(response.map(toScheduleRow).map(row => ({ ...row, status: row.status === 'draft' ? 'scheduled' : row.status, source: 'published' })))
    } catch (error) {
      showScheduleMessage('error', 'Tải lịch đã publish thất bại', getApiErrorMessage(error, 'Không thể tải danh sách suất đã publish.'))
      setPublishedRows([])
    } finally {
      setLoading(false)
    }
  }, [showScheduleMessage, weekStart])

  useEffect(() => {
    void fetchDraftShowtimes()
  }, [fetchDraftShowtimes])

  useEffect(() => {
    void fetchPublishedShowtimes()
  }, [fetchPublishedShowtimes])

  useEffect(() => {
    setRows([...publishedRows, ...draftRows])
  }, [draftRows, publishedRows])

  useEffect(() => {
    async function fetchFormats() {
      try {
        const response = await API_GetShowtimeFormats()
        setFormats(response)
      } catch {
        setFormats([])
      }
    }
    void fetchFormats()
  }, [])

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
  const inWeekFiltered = useMemo(() => filtered.filter(r => weekYmds.includes(r.date)), [filtered, weekYmds])

  const byDay = useMemo(() => {
    const map = new Map<string, ScheduleRow[]>()
    for (const ymd of weekYmds) map.set(ymd, [])
    for (const r of inWeekFiltered) {
      const list = map.get(r.date)
      if (list) list.push(r)
    }
    for (const list of map.values()) list.sort((a, b) => a.start_time.localeCompare(b.start_time))
    return map
  }, [inWeekFiltered, weekYmds])

  const counts = useMemo(
    () => ({
      all: rows.length,
      draft: rows.filter(r => r.status === 'draft').length,
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
      draft: inWeekFiltered.filter(r => r.status === 'draft').length,
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

  async function publishAllDrafts() {
    setPublishingAll(true)
    try {
      const accessToken = Cookies.get('ACCESS_TOKEN')
      const response = await API_PublishAllShowtimeDrafts(accessToken)
      await fetchDraftShowtimes()
      await fetchPublishedShowtimes()
      showScheduleMessage('success', 'Publish thành công', response.data.message || `Đã publish ${response.data.total_published} suất nháp.`)
    } catch (error) {
      showScheduleMessage('error', 'Publish thất bại', getApiErrorMessage(error, 'Publish toàn bộ suất nháp thất bại.'))
    } finally {
      setPublishingAll(false)
    }
  }

  function handlePublishAll() {
    setScheduleModal({
      tone: 'confirm',
      title: 'Publish toàn bộ suất nháp?',
      message: `Bạn sắp publish toàn bộ ${counts.draft} suất nháp đang có. Sau khi publish, các suất này sẽ hiển thị cho người dùng đặt vé.`,
      cancelText: 'Hủy',
      confirmText: 'Publish tất cả',
      onConfirm: publishAllDrafts,
    })
  }

  async function generateDrafts() {
    setGenerating(true)
    try {
      const accessToken = Cookies.get('ACCESS_TOKEN')
      const response = await API_GenerateDraftShowtimes({ page: 1, limit: 300 }, accessToken)
      setDraftRows(response.data.showtimes.map(toScheduleRow))
      showScheduleMessage('success', 'Sinh lịch nháp thành công', response.data.message || 'Sinh lịch chiếu nháp thành công.')
    } catch (error) {
      showScheduleMessage('error', 'Sinh lịch nháp thất bại', getApiErrorMessage(error, 'Sinh lịch chiếu nháp thất bại.'))
    } finally {
      setGenerating(false)
    }
  }

  function handleGenerateDrafts() {
    setScheduleModal({
      tone: 'confirm',
      title: 'Sinh lịch chiếu nháp?',
      message: 'Hệ thống sẽ tạo lịch chiếu nháp từ dữ liệu backend. Admin vẫn có thể kiểm tra trước khi publish.',
      cancelText: 'Hủy',
      confirmText: 'Sinh lịch',
      onConfirm: generateDrafts,
    })
  }

  async function publishOneDraft(showtimeId: string) {
    setPublishingId(showtimeId)
    try {
      const accessToken = Cookies.get('ACCESS_TOKEN')
      const response = await API_PublishShowtimeDraft(showtimeId, accessToken)
      await fetchDraftShowtimes()
      await fetchPublishedShowtimes()
      showScheduleMessage('success', 'Publish suất thành công', response.data.message || 'Publish suất nháp thành công.')
    } catch (error) {
      showScheduleMessage('error', 'Publish suất thất bại', getApiErrorMessage(error, 'Publish suất nháp thất bại.'))
    } finally {
      setPublishingId(null)
    }
  }

  function handlePublishOne(row: ScheduleRow) {
    setScheduleModal({
      tone: 'confirm',
      title: 'Publish suất chiếu này?',
      message: `${row.movie_title} · ${row.room_name} · ${row.date} ${row.start_time}. Suất này sẽ hiển thị cho người dùng đặt vé.`,
      cancelText: 'Hủy',
      confirmText: 'Publish suất',
      onConfirm: () => publishOneDraft(row.id),
    })
  }

  async function handleModalConfirm() {
    const action = scheduleModal?.onConfirm
    if (!action) {
      setScheduleModal(null)
      return
    }

    setModalBusy(true)
    setScheduleModal(null)
    try {
      await action()
    } finally {
      setModalBusy(false)
    }
  }

  return (
    <section className="space-y-4 text-white sm:space-y-6">
      <div className="rounded-2xl border border-white/10 bg-[#0b1019] px-4 py-5 shadow-[0_16px_48px_rgba(0,0,0,0.24)] sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Quản lý lịch chiếu</h1>
            <div className="mt-2 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-violet-400">Lịch chiếu</span>
            </div>
            <p className="mt-3 max-w-2xl text-sm text-slate-500">
              Dữ liệu lấy trực tiếp từ suất nháp backend. Admin có thể publish từng suất hoặc publish tất cả.
            </p>
            <p className="mt-2 text-xs text-slate-600">
              Định dạng khả dụng: {formats.length ? formats.map(f => f.label.toUpperCase()).join(', ') : 'Đang tải...'}
            </p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {[
            { label: 'Tổng suất (tuần này)', value: weekCounts.all, tone: 'text-white' },
            { label: 'Nháp', value: weekCounts.draft, tone: 'text-amber-300' },
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
          Tổng suất nháp tải từ server: {draftRows.length} suất. Suất đã publish trong tuần: {publishedRows.length} suất.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0b1019] p-3 shadow-[0_16px_48px_rgba(0,0,0,0.24)] sm:p-4">
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
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            <FilterTab active={filter === 'all'} label="Tất cả" count={counts.all} onClick={() => setFilter('all')} />
            <FilterTab active={filter === 'draft'} label="Nháp" count={counts.draft} onClick={() => setFilter('draft')} />
            <FilterTab active={filter === 'scheduled'} label="Sắp chiếu" count={counts.scheduled} onClick={() => setFilter('scheduled')} />
            <FilterTab active={filter === 'ongoing'} label="Đang chiếu" count={counts.ongoing} onClick={() => setFilter('ongoing')} />
            <FilterTab active={filter === 'ended'} label="Đã kết thúc" count={counts.ended} onClick={() => setFilter('ended')} />
            <FilterTab active={filter === 'cancelled'} label="Đã hủy" count={counts.cancelled} onClick={() => setFilter('cancelled')} />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1019] shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-4 border-b border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tuần hiển thị</p>
            <p className="mt-1 text-lg font-black text-white">{weekRangeLabel}</p>
          </div>
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => void handleGenerateDrafts()}
              disabled={generating || loading || publishingAll}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-sky-500/40 bg-sky-500/15 px-3 text-[11px] font-black text-sky-300 transition-all hover:bg-sky-500/25 disabled:opacity-60 sm:px-4 sm:text-xs"
            >
              {generating ? 'Đang sinh lịch...' : 'Sinh lịch nháp'}
            </button>
            <button
              type="button"
              onClick={() => void fetchDraftShowtimes()}
              disabled={loading || generating}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-3 text-[11px] font-black text-white shadow-lg shadow-emerald-500/20 transition-all hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 sm:px-4 sm:text-xs"
            >
              <SparklesIcon />
              {loading ? 'Đang tải...' : 'Lấy suất nháp'}
            </button>
            <button
              type="button"
              onClick={() => void handlePublishAll()}
              disabled={publishingAll || loading || generating}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 text-[11px] font-black text-amber-300 transition-all hover:bg-amber-500/25 disabled:opacity-60 sm:px-4 sm:text-xs"
            >
              {publishingAll ? 'Đang publish...' : 'Publish tất cả'}
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
              className="rounded-lg border border-violet-500/30 bg-violet-500/15 px-3 py-2 text-[11px] font-black text-violet-200 hover:bg-violet-500/25 sm:px-4 sm:text-xs"
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
          <div className="grid min-w-[760px] grid-cols-7 divide-x divide-white/10 sm:min-w-[840px]">
            {weekDays.map(day => {
              const items = byDay.get(day.ymd) ?? []
              return (
                <div
                  key={day.ymd}
                  className={`flex min-h-[320px] flex-col bg-white/[0.02] ${day.isToday ? 'ring-1 ring-inset ring-violet-500/40' : ''}`}
                >
                  <div className={`border-b border-white/10 px-2 py-3 text-center ${day.isToday ? 'bg-violet-500/10' : 'bg-white/[0.03]'}`}>
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
                          <div key={r.id} className={`rounded-xl border px-2.5 py-2 text-left shadow-sm ${sc.bg} ${sc.border}`}>
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
                            {r.source === 'draft' ? (
                              <button
                                type="button"
                                onClick={() => handlePublishOne(r)}
                                disabled={publishingId === r.id || publishingAll}
                                className="mt-2 w-full rounded-md border border-emerald-500/35 bg-emerald-500/15 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-60"
                              >
                                {publishingId === r.id ? 'Đang publish...' : 'Publish suất này'}
                              </button>
                            ) : (
                              <div className="mt-2 rounded-md border border-violet-500/25 bg-violet-500/10 px-2 py-1 text-center text-[10px] font-black uppercase tracking-wide text-violet-300">
                                Đã publish
                              </div>
                            )}
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

      {scheduleModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0b1019] text-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${
                  scheduleModal.tone === 'error'
                    ? 'text-red-300'
                    : scheduleModal.tone === 'success'
                      ? 'text-emerald-300'
                      : 'text-amber-300'
                }`}>
                  {scheduleModal.tone === 'confirm' ? 'Xác nhận thao tác' : scheduleModal.tone === 'success' ? 'Thành công' : 'Có lỗi xảy ra'}
                </p>
                <h2 className="mt-1 text-2xl font-black">{scheduleModal.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setScheduleModal(null)}
                disabled={modalBusy}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-60"
                aria-label="Đóng"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm leading-6 text-slate-400">{scheduleModal.message}</p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-white/10 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setScheduleModal(null)}
                disabled={modalBusy}
                className="h-11 rounded-lg border border-white/10 px-5 text-xs font-black uppercase tracking-widest text-slate-400 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {scheduleModal.cancelText}
              </button>
              <button
                type="button"
                onClick={() => void handleModalConfirm()}
                disabled={modalBusy}
                className={`h-11 rounded-lg px-5 text-xs font-black uppercase tracking-widest transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  scheduleModal.tone === 'error'
                    ? 'bg-red-500 text-white hover:bg-red-400'
                    : scheduleModal.tone === 'success'
                      ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                      : 'bg-amber-500 text-black hover:bg-amber-400'
                }`}
              >
                {modalBusy ? 'Đang xử lý...' : scheduleModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

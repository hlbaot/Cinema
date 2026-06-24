
'use client'

import Cookies from 'js-cookie'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { API_CreateRoom, API_DeleteRoom, API_GenerateRoomSeats, API_GetRoomDetail, API_GetRooms, API_UpdateRoomStatus, type CinemaRoomDto, type CinemaRoomSeatDto } from '@/src/api/API_Room'
import { getApiErrorMessage } from '@/src/lib/auth-client'

type RoomStatus = 'active' | 'maintenance' | 'inactive'

interface AdminRoom extends CinemaRoomDto {
  status: RoomStatus
}

type RoomDetail = CinemaRoomDto & { seats?: CinemaRoomSeatDto[] }

export type CinemaInfo = {
  address: string
  rooms: number
  seats: string
  status: string
  title: string
}

const STATUS_CONFIG: Record<RoomStatus, { label: string; color: string; bg: string; dot: string }> = {
  active: { label: 'Hoạt động', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400' },
  maintenance: { label: 'Bảo trì', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', dot: 'bg-amber-400' },
  inactive: { label: 'Ngưng dùng', color: 'text-slate-500', bg: 'bg-slate-500/10 border-slate-500/20', dot: 'bg-slate-500' },
}

function normalizeRoomStatus(status: string): RoomStatus {
  const value = status.toLowerCase()
  if (value === 'maintenance') return 'maintenance'
  if (value === 'inactive') return 'inactive'
  return 'active'
}

function mapAdminRoom(room: CinemaRoomDto): AdminRoom {
  return {
    ...room,
    status: normalizeRoomStatus(room.status),
  }
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5h18M6 12h12M10 19h4" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function DoorMiniIcon() {
  return (
    <svg className="h-5 w-5 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
      <path d="M3 21h18M10 12h4M14 21v-3a2 2 0 0 0-4 0v3" />
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

function formatRoomFormat(format: string) {
  return format?.trim() ? format.trim().toUpperCase() : '—'
}

function getSeatLabel(seat: CinemaRoomSeatDto) {
  return `${seat.seat_row}${seat.seat_number}`
}

function getSeatTone(seat: CinemaRoomSeatDto) {
  const type = seat.type?.toLowerCase()
  if (type === 'vip') return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300'
  if (type === 'couple') return 'border-pink-500/30 bg-pink-500/10 text-pink-300'
  return 'border-slate-600/40 bg-slate-800/70 text-slate-300'
}

function formatCreatedAt(iso: string) {
  try {
    const d = new Date(iso)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year}, ${hours}:${minutes}`
  } catch {
    return iso
  }
}

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<AdminRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | RoomStatus>('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [creatingRoom, setCreatingRoom] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState({
    name: '',
    format: '2d',
    total_rows: 10,
    total_columns: 12,
  })
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [detailRoom, setDetailRoom] = useState<RoomDetail | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<RoomStatus | null>(null)
  const [deletingRoom, setDeletingRoom] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const filterRef = useRef<HTMLDivElement>(null)

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true)
      setLoadError(null)
      const accessToken = Cookies.get('ACCESS_TOKEN')
      const allRooms = await API_GetRooms(accessToken)
      setRooms(allRooms.map(mapAdminRoom))
    } catch (e: unknown) {
      console.error('Failed to load rooms:', e)
      setLoadError(e instanceof Error ? e.message : 'Không thể tải danh sách phòng')
      setRooms([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    fetchRooms()
  }, [fetchRooms])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = useMemo(() => {
    return rooms.filter(r => {
      const q = search.toLowerCase()
      const matchSearch =
        r.name.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.format.toLowerCase().includes(q)
      const matchStatus = filterStatus === 'all' || r.status === filterStatus
      return matchSearch && matchStatus
    })
  }, [rooms, search, filterStatus])

  const counts = useMemo(
    () => ({
      all: rooms.length,
      active: rooms.filter(r => r.status === 'active').length,
      maintenance: rooms.filter(r => r.status === 'maintenance').length,
      inactive: rooms.filter(r => r.status === 'inactive').length,
    }),
    [rooms]
  )

  const totalSeats = useMemo(() => rooms.reduce((sum, r) => sum + (r.total_seats ?? 0), 0), [rooms])
  const filterOptions: Array<{ value: 'all' | RoomStatus; label: string; count: number }> = [
    { value: 'all', label: 'Tất cả', count: counts.all },
    { value: 'active', label: 'Hoạt động', count: counts.active },
    { value: 'maintenance', label: 'Bảo trì', count: counts.maintenance },
    { value: 'inactive', label: 'Ngưng dùng', count: counts.inactive },
  ]

  const currentFilterLabel = filterOptions.find(option => option.value === filterStatus)?.label ?? 'Tất cả'
  const detailSeats = useMemo(() => {
    const seats = detailRoom?.seats ?? []
    return [...seats].sort((a, b) => {
      const rowCompare = a.seat_row.localeCompare(b.seat_row)
      if (rowCompare !== 0) return rowCompare
      return a.seat_number - b.seat_number
    })
  }, [detailRoom])

  async function openRoomDetail(room: AdminRoom) {
    setDetailOpen(true)
    setDetailLoading(true)
    setDetailError(null)
    setDetailRoom(room)

    try {
      const accessToken = Cookies.get('ACCESS_TOKEN')
      const detail = await API_GetRoomDetail(room.id, accessToken)
      setDetailRoom(detail)
    } catch (error) {
      console.error('Failed to load room detail:', error)
      setDetailError(error instanceof Error ? error.message : 'Không thể tải chi tiết phòng')
    } finally {
      setDetailLoading(false)
    }
  }

  async function handleChangeRoomStatus(status: RoomStatus) {
    if (!detailRoom || updatingStatus) return

    setUpdatingStatus(status)
    setDetailError(null)
    try {
      const accessToken = Cookies.get('ACCESS_TOKEN')
      const updated = await API_UpdateRoomStatus(detailRoom.id, status, accessToken)
      const nextStatus = normalizeRoomStatus(updated.status || status)
      setDetailRoom(prev => prev ? { ...prev, ...updated, status: nextStatus } : null)
      setRooms(prev => prev.map(room => (
        room.id === detailRoom.id
          ? { ...room, ...updated, status: nextStatus }
          : room
      )))
    } catch (error) {
      console.error('Failed to update room status:', error)
      setDetailError(error instanceof Error ? error.message : 'Không thể cập nhật trạng thái phòng')
    } finally {
      setUpdatingStatus(null)
    }
  }

  async function handleDeleteRoom() {
    if (!detailRoom || deletingRoom) return

    setDeletingRoom(true)
    setDetailError(null)
    setDeleteError(null)
    try {
      const accessToken = Cookies.get('ACCESS_TOKEN')
      await API_DeleteRoom(detailRoom.id, accessToken)
      setRooms(prev => prev.filter(room => room.id !== detailRoom.id))
      setDeleteConfirmOpen(false)
      setDetailOpen(false)
      setDetailRoom(null)
    } catch (error) {
      console.error('Failed to delete room:', error)
      const message = getApiErrorMessage(
        error,
        'Không thể xóa phòng. Phòng có thể đã có suất chiếu hoặc booking.',
      )
      setDeleteError(message)
      setDetailError(message)
    } finally {
      setDeletingRoom(false)
    }
  }

  async function handleCreateRoom(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = createForm.name.trim()
    const format = createForm.format.trim()
    const totalRows = Number(createForm.total_rows)
    const totalColumns = Number(createForm.total_columns)

    if (!name) {
      setCreateError('Vui lòng nhập tên phòng.')
      return
    }
    if (!format) {
      setCreateError('Vui lòng chọn định dạng phòng.')
      return
    }
    if (!Number.isInteger(totalRows) || totalRows <= 0) {
      setCreateError('Số hàng phải lớn hơn 0.')
      return
    }
    if (!Number.isInteger(totalColumns) || totalColumns <= 0) {
      setCreateError('Số cột phải lớn hơn 0.')
      return
    }

    setCreatingRoom(true)
    setCreateError(null)
    try {
      const accessToken = Cookies.get('ACCESS_TOKEN')
      const created = await API_CreateRoom(
        {
          name,
          format,
          total_rows: totalRows,
          total_columns: totalColumns,
        },
        accessToken,
      )
      await API_GenerateRoomSeats(
        {
          room_id: created.id,
          rows: totalRows,
          seats_per_row: totalColumns,
        },
        accessToken,
      )
      setRooms(prev => [mapAdminRoom(created), ...prev.filter(room => room.id !== created.id)])
      setCreateOpen(false)
      setCreateForm({
        name: '',
        format: '2d',
        total_rows: 10,
        total_columns: 12,
      })
    } catch (error) {
      console.error('Failed to create room:', error)
      setCreateError(error instanceof Error ? error.message : 'Không thể tạo phòng')
    } finally {
      setCreatingRoom(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <>
    <section className="space-y-6 text-white">
      <div className="rounded-2xl border border-white/10 bg-[#0b1019] px-6 py-6 shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Quản lý phòng</h1>
            <div className="mt-2 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-violet-400">Phòng chiếu</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => {
                setCreateError(null)
                setCreateOpen(true)
              }}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-violet-500 px-5 text-sm font-black text-white transition-all hover:bg-violet-400"
            >
              <PlusIcon />
              Tạo phòng
            </button>

            <div ref={filterRef} className="relative">
              <button
                type="button"
                onClick={() => setFilterOpen(open => !open)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-5 text-sm font-black text-white transition-all hover:bg-white/10"
              >
                <FilterIcon />
                Bộ lọc
                <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] uppercase tracking-widest text-violet-200">
                  {currentFilterLabel}
                </span>
              </button>

              {mounted && filterOpen ? (
                <div className="absolute right-0 top-[52px] z-20 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#101724] p-2 shadow-2xl">
                  {filterOptions.map(option => {
                    const active = option.value === filterStatus
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setFilterStatus(option.value)
                          setFilterOpen(false)
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs font-black uppercase tracking-wide transition-colors ${
                          active
                            ? 'bg-violet-500/20 text-violet-200'
                            : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
                        }`}
                      >
                        <span>{option.label}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] ${active ? 'bg-violet-500/30 text-violet-100' : 'bg-white/10 text-slate-500'}`}>
                          {option.count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[
            { label: 'Tổng phòng', value: counts.all, tone: 'text-white' },
            { label: 'Hoạt động', value: counts.active, tone: 'text-emerald-300' },
            { label: 'Bảo trì', value: counts.maintenance, tone: 'text-amber-300' },
            { label: 'Ngưng dùng', value: counts.inactive, tone: 'text-slate-400' },
            { label: 'Tổng ghế', value: totalSeats, tone: 'text-violet-300' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className={`text-2xl font-black ${s.tone}`}>{s.value}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0b1019] p-4 shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
        <div className="relative w-full xl:w-96">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
              <SearchIcon />
            </span>
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên, ID, định dạng..."
              className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-11 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-violet-500/40 focus:bg-white/[0.06]"
            />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1019] shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 text-5xl opacity-30">⏳</div>
            <p className="text-xl font-bold text-slate-400">Đang tải danh sách phòng...</p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 text-5xl opacity-30">⚠️</div>
            <p className="text-xl font-bold text-red-300">Tải danh sách phòng thất bại</p>
            <p className="mt-2 text-sm text-slate-500">{loadError}</p>
            <button
              type="button"
              onClick={fetchRooms}
              className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/10 px-4 text-sm font-bold text-violet-300 hover:bg-violet-500/20 transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 text-6xl opacity-20">🚪</div>
            <p className="text-xl font-bold text-slate-500">Không có phòng nào</p>
            <p className="mt-2 text-sm text-slate-600">Thử đổi từ khóa hoặc bộ lọc</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid min-w-[980px] grid-cols-[1.5fr_1fr_.55fr_.45fr_.45fr_.5fr_1fr] gap-4 border-b border-white/10 bg-white/[0.03] px-5 py-3">
              {['Phòng', 'ID', 'Định dạng', 'Hàng', 'Cột', 'Ghế', 'Trạng thái'].map(h => (
                <span key={h} className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {h}
                </span>
              ))}
            </div>
            {filtered.map(r => {
              const sc = STATUS_CONFIG[r.status]
              return (
                <button
                  key={`${r.status}-${r.id}`}
                  type="button"
                  onClick={() => void openRoomDetail(r)}
                  className="grid min-w-[980px] grid-cols-[1.5fr_1fr_.55fr_.45fr_.45fr_.5fr_1fr] items-center gap-4 border-b border-white/5 px-5 py-4 transition-colors last:border-b-0 hover:bg-white/[0.03]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
                      <DoorMiniIcon />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{r.name}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{formatCreatedAt(r.created_at)}</p>
                    </div>
                  </div>
                  <p className="truncate font-mono text-xs text-violet-300" title={r.id}>
                    {r.id}
                  </p>
                  <span className="w-fit rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-black text-slate-400">
                    {formatRoomFormat(r.format)}
                  </span>
                  <p className="text-sm text-slate-400">{r.total_rows}</p>
                  <p className="text-sm text-slate-400">{r.total_columns}</p>
                  <p className="text-sm font-bold text-slate-300">{r.total_seats}</p>
                  <div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black ${sc.bg} ${sc.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
        <div className="flex items-center justify-between border-t border-white/5 px-5 py-4">
          <p className="text-xs font-bold text-slate-600">
            Hiển thị <span className="text-slate-400">{filtered.length}</span> / {rooms.length} phòng
          </p>
        </div>
      </div>
    </section>
    {detailOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
        <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b1019] text-white shadow-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-400">Chi tiết phòng</p>
              <h2 className="mt-1 text-2xl font-black">{detailRoom?.name ?? 'Đang tải phòng...'}</h2>
              <p className="mt-1 max-w-xl truncate font-mono text-xs text-slate-500">{detailRoom?.id}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setDetailOpen(false)
                setDetailRoom(null)
                setDetailError(null)
              }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
              aria-label="Đóng chi tiết phòng"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="max-h-[calc(90vh-90px)] overflow-y-auto p-6">
            {detailError ? (
              <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-200">
                {detailError}
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { label: 'Định dạng', value: formatRoomFormat(detailRoom?.format ?? '') },
                { label: 'Hàng', value: detailRoom?.total_rows ?? '—' },
                { label: 'Cột', value: detailRoom?.total_columns ?? '—' },
                { label: 'Tổng ghế', value: detailRoom?.total_seats ?? '—' },
                { label: 'Ngày tạo', value: detailRoom?.created_at ? formatCreatedAt(detailRoom.created_at) : '—' },
              ].map(item => (
                <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.label}</p>
                  <p className="mt-2 text-sm font-black text-white">{item.value}</p>
                </div>
              ))}
            </div>

            {detailRoom ? (
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Trạng thái phòng</h3>
                    <p className="mt-1 text-xs text-slate-500">Cập nhật trạng thái sử dụng của phòng chiếu.</p>
                  </div>
                  <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black ${STATUS_CONFIG[normalizeRoomStatus(detailRoom.status)].bg} ${STATUS_CONFIG[normalizeRoomStatus(detailRoom.status)].color}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_CONFIG[normalizeRoomStatus(detailRoom.status)].dot}`} />
                    {STATUS_CONFIG[normalizeRoomStatus(detailRoom.status)].label}
                  </span>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  {([
                    ['active', 'Hoạt động'],
                    ['maintenance', 'Bảo trì'],
                    ['inactive', 'Ngưng dùng'],
                  ] as Array<[RoomStatus, string]>).map(([value, label]) => {
                    const active = normalizeRoomStatus(detailRoom.status) === value
                    const saving = updatingStatus === value
                    return (
                      <button
                        key={value}
                        type="button"
                        disabled={active || Boolean(updatingStatus)}
                        onClick={() => void handleChangeRoomStatus(value)}
                        className={`h-11 rounded-lg border px-4 text-xs font-black uppercase tracking-wide transition-all disabled:cursor-not-allowed ${
                          active
                            ? `${STATUS_CONFIG[value].bg} ${STATUS_CONFIG[value].color}`
                            : 'border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:bg-white/[0.08] hover:text-white disabled:opacity-50'
                        }`}
                      >
                        {saving ? 'Đang cập nhật...' : label}
                      </button>
                    )
                  })}
                </div>
                <div className="mt-4 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError(null)
                      setDeleteConfirmOpen(true)
                    }}
                    disabled={deletingRoom || Boolean(updatingStatus)}
                    className="inline-flex h-11 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 px-5 text-xs font-black uppercase tracking-widest text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Xóa phòng
                  </button>
                </div>
              </div>
            ) : null}

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Ghế trong phòng</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {detailLoading ? 'Đang tải ghế...' : `${detailSeats.length} ghế`}
                  </p>
                </div>
                {detailRoom ? (
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black ${STATUS_CONFIG[normalizeRoomStatus(detailRoom.status)].bg} ${STATUS_CONFIG[normalizeRoomStatus(detailRoom.status)].color}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_CONFIG[normalizeRoomStatus(detailRoom.status)].dot}`} />
                    {STATUS_CONFIG[normalizeRoomStatus(detailRoom.status)].label}
                  </span>
                ) : null}
              </div>

              {detailLoading ? (
                <div className="flex items-center justify-center py-16 text-sm font-bold text-slate-500">Đang tải chi tiết phòng...</div>
              ) : detailSeats.length === 0 ? (
                <div className="flex items-center justify-center py-16 text-sm font-bold text-slate-500">Chưa có dữ liệu ghế.</div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(58px,1fr))] gap-2">
                  {detailSeats.map(seat => (
                    <div
                      key={seat.id}
                      className={`rounded-lg border px-2 py-2 text-center text-xs font-black ${getSeatTone(seat)}`}
                      title={seat.type || 'standard'}
                    >
                      {getSeatLabel(seat)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    ) : null}
    {createOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
        <form
          onSubmit={event => void handleCreateRoom(event)}
          className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b1019] text-white shadow-2xl"
        >
          <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-400">Phòng chiếu</p>
              <h2 className="mt-1 text-2xl font-black">Tạo phòng mới</h2>
              <p className="mt-1 text-sm text-slate-500">Nhập cấu hình cơ bản để tạo sơ đồ ghế cho phòng.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCreateOpen(false)
                setCreateError(null)
              }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
              aria-label="Đóng tạo phòng"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="space-y-5 p-6">
            {createError ? (
              <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-200">
                {createError}
              </div>
            ) : null}

            <label className="block">
              <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">Tên phòng</span>
              <input
                value={createForm.name}
                onChange={event => setCreateForm(prev => ({ ...prev, name: event.target.value }))}
                placeholder="VD: Room 1"
                className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-white outline-none transition focus:border-violet-500/50"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">Định dạng</span>
                <select
                  value={createForm.format}
                  onChange={event => setCreateForm(prev => ({ ...prev, format: event.target.value }))}
                  className="h-11 w-full rounded-lg border border-white/10 bg-[#111827] px-3 text-sm font-bold text-white outline-none transition focus:border-violet-500/50"
                >
                  <option value="2d">2D</option>
                  <option value="3d">3D</option>
                  <option value="imax">IMAX</option>
                  <option value="4dx">4DX</option>
                  <option value="vip">VIP</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">Số hàng</span>
                <input
                  type="number"
                  min={1}
                  value={createForm.total_rows}
                  onChange={event => setCreateForm(prev => ({ ...prev, total_rows: Number(event.target.value) }))}
                  className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-white outline-none transition focus:border-violet-500/50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">Số cột</span>
                <input
                  type="number"
                  min={1}
                  value={createForm.total_columns}
                  onChange={event => setCreateForm(prev => ({ ...prev, total_columns: Number(event.target.value) }))}
                  className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-white outline-none transition focus:border-violet-500/50"
                />
              </label>
            </div>

            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 text-xs text-slate-400">
              <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-violet-400">Quy tắc sinh ghế tự động</span>
              <ul className="list-disc pl-4 space-y-1">
                <li>Hàng cuối cùng sẽ được cấu hình là <strong>ghế đôi (Couple)</strong>.</li>
                <li>1/3 số hàng phía sau sẽ được cấu hình là <strong>ghế VIP</strong>.</li>
                <li>Các hàng còn lại phía trước sẽ là <strong>ghế tiêu chuẩn (Standard)</strong>.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tổng ghế dự kiến</p>
              <p className="mt-1 text-2xl font-black text-violet-300">
                {Math.max(0, Number(createForm.total_rows) || 0) * Math.max(0, Number(createForm.total_columns) || 0)}
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 px-6 py-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setCreateOpen(false)
                setCreateError(null)
              }}
              className="h-11 rounded-lg border border-white/10 px-5 text-xs font-black uppercase tracking-widest text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={creatingRoom}
              className="h-11 rounded-lg bg-violet-500 px-5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creatingRoom ? 'Đang tạo...' : 'Tạo phòng'}
            </button>
          </div>
        </form>
      </div>
    ) : null}
    {deleteConfirmOpen && detailRoom ? (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-red-500/20 bg-[#0b1019] text-white shadow-2xl">
          <div className="border-b border-white/10 px-6 py-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-300">Xóa phòng</p>
            <h2 className="mt-1 text-2xl font-black">Xác nhận xóa phòng?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Phòng <span className="font-bold text-white">{detailRoom.name}</span> sẽ bị xóa khỏi hệ thống nếu chưa có suất chiếu hoặc booking.
            </p>
          </div>

          <div className="space-y-3 px-6 py-5">
            {deleteError ? (
              <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-200">
                {deleteError}
              </div>
            ) : null}

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Room ID</p>
              <p className="mt-2 break-all font-mono text-xs text-slate-300">{detailRoom.id}</p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 px-6 py-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setDeleteConfirmOpen(false)
                setDeleteError(null)
              }}
              disabled={deletingRoom}
              className="h-11 rounded-lg border border-white/10 px-5 text-xs font-black uppercase tracking-widest text-slate-400 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => void handleDeleteRoom()}
              disabled={deletingRoom}
              className="h-11 rounded-lg bg-red-500 px-5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deletingRoom ? 'Đang xóa...' : 'Xác nhận xóa'}
            </button>
          </div>
        </div>
      </div>
    ) : null}
    </>
  )

}

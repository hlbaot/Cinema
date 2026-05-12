
'use client'

import React, { useEffect, useState, useMemo, useRef } from 'react'
import Image from 'next/image'
import { API_CreateMovie, API_DeleteMovie, API_GetAllMovies, API_GetMovieAgeRatings, API_GetMovieGenres, API_GetMovieStatuses, API_UpdateMovie } from '@/src/api/API_Movie'
import { Movie as APIMovie } from '@/src/interface/movie'

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────
type MovieStatus = 'showing' | 'upcoming' | 'ended'

interface AdminMovie {
  id: string
  title: string
  description: string
  director: string
  actor: string[]
  genre: string[]
  duration_minutes: number
  age_rating: string
  status: MovieStatus
  poster_url: string
  trailer_url: string
  start_date: string
  end_date: string
  score: number
  expected_hot_score?: number
  admin_priority?: number
}

const STATUS_CONFIG: Record<MovieStatus, { label: string; color: string; bg: string; dot: string }> = {
  showing: { label: 'Đang chiếu', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400' },
  upcoming: { label: 'Sắp chiếu', color: 'text-violet-400', bg: 'bg-violet-400/10 border-violet-400/20', dot: 'bg-violet-400' },
  ended: { label: 'Đã kết thúc', color: 'text-slate-500', bg: 'bg-slate-500/10 border-slate-500/20', dot: 'bg-slate-500' },
}

const EMPTY_MOVIE: AdminMovie = {
  id: '',
  title: '',
  description: '',
  director: '',
  actor: [],
  genre: [],
  duration_minutes: 90,
  age_rating: 'P',
  status: 'upcoming',
  poster_url: '',
  trailer_url: '',
  start_date: '',
  end_date: '',
  score: 0,
  expected_hot_score: undefined,
  admin_priority: undefined,
}

const mapApiStatusToAdminStatus = (status: string): MovieStatus => {
  switch (status) {
    case 'NOW_SHOWING':
      return 'showing'
    case 'ENDED':
      return 'ended'
    case 'COMING_SOON':
    default:
      return 'upcoming'
  }
}

const mapAdminStatusToApiStatus = (status: MovieStatus): string => {
  switch (status) {
    case 'showing':
      return 'NOW_SHOWING'
    case 'ended':
      return 'ENDED'
    case 'upcoming':
    default:
      return 'COMING_SOON'
  }
}

const mapApiMovieToAdminMovie = (movie: APIMovie & { director?: string; end_date?: string }): AdminMovie => ({
  id: movie.id,
  title: movie.title,
  description: movie.description ?? '',
  director: movie.director ?? '',
  actor: Array.isArray(movie.actor) ? movie.actor : [],
  genre: Array.isArray(movie.genre) ? movie.genre : [],
  duration_minutes: movie.duration_minutes ?? 0,
  age_rating: movie.age_rating ?? 'P',
  status: mapApiStatusToAdminStatus(movie.status),
  poster_url: movie.poster_url ?? '',
  trailer_url: movie.trailer_url ?? '',
  start_date: movie.start_date ?? '',
  end_date: movie.end_date ?? '',
  score: movie.score ?? 0,
  expected_hot_score: undefined,
  admin_priority: undefined,
})

// ────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────
function SearchIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

// ────────────────────────────────────────────────
// Movie Form Modal
// ────────────────────────────────────────────────
function MovieFormModal({
  movie,
  onClose,
  onSave,
  genreOptions,
  ageRatingOptions,
  statusOptions,
  isSaving,
}: {
  movie: AdminMovie | null
  onClose: () => void
  onSave: (m: AdminMovie, posterFile: File | null) => Promise<void>
  genreOptions: string[]
  ageRatingOptions: string[]
  statusOptions: Array<{ value: MovieStatus; label: string }>
  isSaving: boolean
}) {
  const isEdit = !!movie
  const [form, setForm] = useState<AdminMovie>(() => movie ?? { ...EMPTY_MOVIE, id: crypto.randomUUID() })
  const [genreToAdd, setGenreToAdd] = useState('')
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [actorsInput, setActorsInput] = useState(() => (movie?.actor || []).join(', '))

  const set = (field: keyof AdminMovie, val: unknown) => setForm(f => ({ ...f, [field]: val }))

  const addGenre = (g: string) => {
    if (g && !form.genre.includes(g)) set('genre', [...form.genre, g])
  }

  const removeGenre = (g: string) => set('genre', form.genre.filter(x => x !== g))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(
      {
        ...form,
        actor: actorsInput
          .split(',')
          .map(v => v.trim())
          .filter(Boolean),
      },
      posterFile
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] border border-white/10 bg-[#0b1019] shadow-[0_30px_80px_rgba(0,0,0,0.6)] scrollbar-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0b1019] px-8 py-6">
          <div>
            <h2 className="text-2xl font-black text-white">{isEdit ? 'Chỉnh sửa phim' : 'Thêm phim mới'}</h2>
            <p className="mt-1 text-sm text-slate-500">{isEdit ? 'Cập nhật thông tin bộ phim' : 'Nhập đầy đủ thông tin bộ phim mới'}</p>
          </div>
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors">
            <CloseIcon />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Tên phim */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Tên phim *</label>
            <input required value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="Nhập tên phim..." id="movie-title"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Mô tả *</label>
            <textarea
              required
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Nhập mô tả phim..."
              className="min-h-24 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/50 transition-all"
            />
          </div>

          {/* Đạo diễn & Thời lượng */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Đạo diễn</label>
              <input value={form.director} onChange={e => set('director', e.target.value)}
                placeholder="Tên đạo diễn..." id="movie-director"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Thời lượng (phút)</label>
              <input type="number" value={form.duration_minutes} min={1} onChange={e => set('duration_minutes', Number(e.target.value))}
                id="movie-duration"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/50 transition-all"
              />
            </div>
          </div>

          {/* Giới hạn tuổi & Trạng thái */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Phân loại tuổi</label>
              <select value={form.age_rating} onChange={e => set('age_rating', e.target.value)} id="movie-age-rating"
                className="w-full rounded-xl border border-white/10 bg-[#0b1019] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 transition-all"
              >
                {ageRatingOptions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Trạng thái</label>
              <select value={form.status} onChange={e => set('status', e.target.value as MovieStatus)} id="movie-status"
                className="w-full rounded-xl border border-white/10 bg-[#0b1019] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 transition-all"
              >
                {statusOptions.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Ngày chiếu */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Ngày bắt đầu</label>
              <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} id="movie-start-date"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 transition-all [color-scheme:dark]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Ngày kết thúc</label>
              <input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} id="movie-end-date"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          {/* URL Poster */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">URL Poster</label>
            <input value={form.poster_url} onChange={e => set('poster_url', e.target.value)}
              placeholder="https://..." id="movie-poster"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/50 transition-all"
            />
            <input
              type="file"
              accept="image/*"
              onChange={e => setPosterFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-600 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-violet-500"
            />
            <p className="text-xs text-slate-500">Chọn ảnh để upload Cloudinary (ưu tiên hơn URL poster).</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Trailer URL *</label>
            <input
              required
              value={form.trailer_url}
              onChange={e => set('trailer_url', e.target.value)}
              placeholder="https://youtube.com/..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/50 transition-all"
            />
          </div>

          {/* Thể loại */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Thể loại</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.genre.map(g => (
                <span key={g} className="flex items-center gap-1.5 rounded-full bg-violet-500/15 border border-violet-500/25 px-3 py-1 text-xs font-bold text-violet-300">
                  {g}
                  <button type="button" onClick={() => removeGenre(g)} className="text-violet-400 hover:text-white transition-colors">✕</button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={genreToAdd}
                onChange={e => {
                  const selectedGenre = e.target.value
                  setGenreToAdd(selectedGenre)
                  if (selectedGenre) {
                    addGenre(selectedGenre)
                    setGenreToAdd('')
                  }
                }}
                className="w-full rounded-xl border border-white/10 bg-[#0b1019] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 transition-all"
              >
                <option value="">Chọn thể loại để thêm...</option>
                {genreOptions
                  .filter(g => !form.genre.includes(g))
                  .map(g => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Diễn viên (phân tách dấu phẩy) *</label>
              <input
                required
                value={actorsInput}
                onChange={e => setActorsInput(e.target.value)}
                placeholder="Actor 1, Actor 2"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Điểm hot kỳ vọng (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={form.expected_hot_score ?? ''}
                onChange={e => set('expected_hot_score', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Độ ưu tiên admin (1-10)</label>
            <input
              type="number"
              min={1}
              max={10}
              value={form.admin_priority ?? ''}
              onChange={e => set('admin_priority', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} disabled={isSaving}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3.5 text-sm font-bold text-slate-400 hover:bg-white/10 hover:text-white transition-all"
            >
              Hủy bỏ
            </button>
            <button type="submit" disabled={isSaving}
              className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 py-3.5 text-sm font-black text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-pink-500 transition-all"
            >
              {isSaving ? 'Đang xử lý...' : isEdit ? 'Lưu thay đổi' : 'Thêm phim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────
// Delete Confirm Modal
// ────────────────────────────────────────────────
function DeleteModal({ movie, onClose, onConfirm }: { movie: AdminMovie; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0b1019] p-8 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 border border-red-500/25 mx-auto mb-6">
          <TrashIcon />
        </div>
        <h3 className="text-2xl font-black text-white text-center mb-2">Xóa phim?</h3>
        <p className="text-slate-400 text-center text-sm mb-8">
          Bạn có chắc muốn xóa <span className="text-white font-bold">&quot;{movie.title}&quot;</span>? Hành động này không thể hoàn tác.
        </p>
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3.5 text-sm font-bold text-slate-400 hover:bg-white/10 hover:text-white transition-all">Hủy</button>
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-red-600 py-3.5 text-sm font-black text-white hover:bg-red-500 transition-all shadow-lg shadow-red-500/20">Xóa phim</button>
        </div>
      </div>
    </div>
  )
}

function FilterTab({
  active,
  count,
  label,
  onClick,
}: {
  active: boolean
  count: number
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 items-center gap-2 rounded-lg border px-3 text-xs font-black uppercase tracking-wide transition-all ${
        active
          ? 'border-violet-500/40 bg-violet-500/15 text-violet-300'
          : 'border-white/10 bg-white/[0.03] text-slate-500 hover:border-white/20 hover:text-white'
      }`}
    >
      {label}
      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${active ? 'bg-violet-500/30 text-violet-300' : 'bg-white/10 text-slate-500'}`}>
        {count}
      </span>
    </button>
  )
}

// ────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────
export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<AdminMovie[]>([])
  const [genreOptions, setGenreOptions] = useState<string[]>([])
  const [ageRatingOptions, setAgeRatingOptions] = useState<string[]>(['P', 'K', 'T13', 'T16', 'T18'])
  const [statusOptions, setStatusOptions] = useState<Array<{ value: MovieStatus; label: string }>>([
    { value: 'upcoming', label: 'Sắp chiếu' },
    { value: 'showing', label: 'Đang chiếu' },
    { value: 'ended', label: 'Đã kết thúc' },
  ])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | MovieStatus>('all')
  const [editMovie, setEditMovie] = useState<AdminMovie | null | undefined>(undefined) // undefined = closed, null = new
  const [deleteTarget, setDeleteTarget] = useState<AdminMovie | null>(null)
  const [isSavingMovie, setIsSavingMovie] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const uploadPosterToCloudinary = async (file: File) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset) {
      throw new Error('Thiếu NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME hoặc NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset)

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      let cloudinaryMessage = 'Upload ảnh lên Cloudinary thất bại'
      try {
        const errorPayload = await response.json() as { error?: { message?: string } }
        const detail = errorPayload?.error?.message?.trim()
        if (detail) {
          cloudinaryMessage = detail
        }
      } catch {
        // ignore parse error and use fallback message
      }
      throw new Error(cloudinaryMessage)
    }

    const data = await response.json()
    return data.secure_url as string
  }

  const fetchGenres = async () => {
    try {
      const response = await API_GetMovieGenres()
      const maybeRaw = response as unknown

      const genresData = Array.isArray(maybeRaw)
        ? maybeRaw
        : Array.isArray((maybeRaw as { data?: unknown })?.data)
          ? (maybeRaw as { data: unknown[] }).data
          : []

      setGenreOptions(
        genresData
          .map(item => (item as { name?: string })?.name?.trim())
          .filter((name): name is string => Boolean(name))
      )
    } catch (error) {
      console.error('Failed to load movie genres:', error)
      setGenreOptions([])
    }
  }

  const fetchMovies = async () => {
    try {
      setLoading(true)
      setLoadError(null)

      const response = await API_GetAllMovies()

      if (!response.success) {
        setLoadError(response.data?.message || 'Không thể tải danh sách phim')
        setMovies([])
        return
      }

      const mappedMovies = (response.data?.movies || []).map(movie => mapApiMovieToAdminMovie(movie))
      setMovies(mappedMovies)
    } catch (error: unknown) {
      console.error('Failed to load admin movies:', error)
      setLoadError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải danh sách phim')
      setMovies([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAgeRatings = async () => {
    try {
      const response = await API_GetMovieAgeRatings()
      const maybeRaw = response as unknown

      const ageRatingsData = Array.isArray(maybeRaw)
        ? maybeRaw
        : Array.isArray((maybeRaw as { data?: unknown })?.data)
          ? (maybeRaw as { data: unknown[] }).data
          : []

      const normalizedAgeRatings = ageRatingsData
        .map(item => (item as { value?: string })?.value?.trim())
        .filter((value): value is string => Boolean(value))

      if (normalizedAgeRatings.length > 0) {
        setAgeRatingOptions(normalizedAgeRatings)
      }
    } catch (error) {
      console.error('Failed to load movie age ratings:', error)
    }
  }

  const fetchStatuses = async () => {
    try {
      const response = await API_GetMovieStatuses()
      const maybeRaw = response as unknown

      const statusesData = Array.isArray(maybeRaw)
        ? maybeRaw
        : Array.isArray((maybeRaw as { data?: unknown })?.data)
          ? (maybeRaw as { data: unknown[] }).data
          : []

      const normalizedStatuses = statusesData
        .map(item => {
          const rawValue = (item as { value?: string })?.value
          const rawLabel = (item as { label?: string })?.label
          if (!rawValue || !rawLabel) return null
          return {
            value: mapApiStatusToAdminStatus(rawValue),
            label: rawLabel.trim(),
          }
        })
        .filter((item): item is { value: MovieStatus; label: string } => Boolean(item))

      if (normalizedStatuses.length > 0) {
        const dedupedStatuses = Array.from(
          new Map(normalizedStatuses.map(item => [item.value, item])).values()
        )

        setStatusOptions(dedupedStatuses)
      }
    } catch (error) {
      console.error('Failed to load movie statuses:', error)
    }
  }

  useEffect(() => {
    fetchMovies()
    fetchGenres()
    fetchAgeRatings()
    fetchStatuses()
  }, [])

  const filtered = useMemo(() => {
    return movies.filter(m => {
      const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.director.toLowerCase().includes(search.toLowerCase())
      const matchStatus = filterStatus === 'all' || m.status === filterStatus
      return matchSearch && matchStatus
    })
  }, [movies, search, filterStatus])

  const counts = useMemo(() => ({
    all: movies.length,
    showing: movies.filter(m => m.status === 'showing').length,
    upcoming: movies.filter(m => m.status === 'upcoming').length,
    ended: movies.filter(m => m.status === 'ended').length,
  }), [movies])

  const handleSave = async (m: AdminMovie, posterFile: File | null) => {
    try {
      setIsSavingMovie(true)

      if (!m.description.trim()) throw new Error('Mô tả không được để trống')
      if (!m.trailer_url.trim()) throw new Error('Trailer URL không được để trống')
      if (!m.director.trim()) throw new Error('Đạo diễn không được để trống')
      if (!m.start_date || !m.end_date) throw new Error('Vui lòng chọn ngày bắt đầu và ngày kết thúc')
      if (!m.actor.length) throw new Error('Cần ít nhất 1 diễn viên')

      let posterUrl = m.poster_url
      if (posterFile) {
        posterUrl = await uploadPosterToCloudinary(posterFile)
      }
      if (!posterUrl.trim()) throw new Error('Vui lòng nhập URL poster hoặc chọn ảnh upload')

      const basePayload = {
        title: m.title.trim(),
        description: m.description.trim(),
        duration_minutes: m.duration_minutes,
        genre: m.genre,
        status: mapAdminStatusToApiStatus(m.status) as 'NOW_SHOWING' | 'COMING_SOON' | 'ENDED',
        age_rating: m.age_rating,
        poster_url: posterUrl.trim(),
        trailer_url: m.trailer_url.trim(),
        director: m.director.trim(),
        actor: m.actor,
        start_date: m.start_date,
        end_date: m.end_date,
        expected_hot_score: m.expected_hot_score,
        admin_priority: m.admin_priority,
      }

      if (editMovie) {
        const updatePayload = {
          ...basePayload,
          actors: m.actor,
        }
        await API_UpdateMovie(m.id, updatePayload)
      } else {
        await API_CreateMovie(basePayload)
      }

      await fetchMovies()
      setEditMovie(undefined)
    } catch (error: unknown) {
      console.error('Failed to save movie:', error)
      alert(error instanceof Error ? error.message : 'Lưu phim thất bại')
    } finally {
      setIsSavingMovie(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await API_DeleteMovie(deleteTarget.id)
      await fetchMovies()
      setDeleteTarget(null)
    } catch (error: unknown) {
      console.error('Failed to delete movie:', error)
      alert(error instanceof Error ? error.message : 'Xóa phim thất bại')
    } finally {
    }
  }

  return (
    <section className="space-y-6 text-white">
      {/* ── Header ── */}
      <div className="rounded-2xl border border-white/10 bg-[#0b1019] px-6 py-6 shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Quản lý phim</h1>
            <div className="mt-2 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-violet-400">Phim</span>
            </div>
          </div>
          <button
            onClick={() => setEditMovie(null)}
            id="btn-add-movie"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 text-sm font-black text-white shadow-lg shadow-violet-500/20 transition-all hover:bg-violet-500 active:scale-95"
          >
            <PlusIcon />
            Thêm phim mới
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: 'Tổng phim', value: counts.all, tone: 'text-white' },
            { label: 'Đang chiếu', value: counts.showing, tone: 'text-emerald-300' },
            { label: 'Sắp chiếu', value: counts.upcoming, tone: 'text-violet-300' },
            { label: 'Đã kết thúc', value: counts.ended, tone: 'text-slate-400' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className={`text-2xl font-black ${s.tone}`}>{s.value}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="rounded-2xl border border-white/10 bg-[#0b1019] p-4 shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          {/* Search */}
          <div className="relative w-full xl:w-96">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"><SearchIcon /></span>
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên, đạo diễn..."
              id="search-movies"
              className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-11 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-violet-500/40 focus:bg-white/[0.06]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Tabs */}
            <FilterTab active={filterStatus === 'all'} label="Tất cả" count={counts.all} onClick={() => setFilterStatus('all')} />
            {statusOptions.map(status => (
              <FilterTab
                key={status.value}
                active={filterStatus === status.value}
                label={status.label}
                count={counts[status.value]}
                onClick={() => setFilterStatus(status.value)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Movie List ── */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1019] shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 text-5xl opacity-30">⏳</div>
            <p className="text-xl font-bold text-slate-400">Đang tải danh sách phim...</p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 text-5xl opacity-30">⚠️</div>
            <p className="text-xl font-bold text-red-300">Tải danh sách phim thất bại</p>
            <p className="mt-2 text-sm text-slate-500">{loadError}</p>
            <button
              type="button"
              onClick={fetchMovies}
              className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/10 px-4 text-sm font-bold text-violet-300 hover:bg-violet-500/20 transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 text-6xl opacity-20">🎬</div>
            <p className="text-xl font-bold text-slate-500">Không tìm thấy phim nào</p>
            <p className="mt-2 text-sm text-slate-600">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Header */}
            <div className="grid min-w-[980px] grid-cols-[2fr_1fr_1.2fr_.8fr_.9fr_.8fr] gap-4 border-b border-white/10 bg-white/[0.03] px-5 py-3">
              {['Tên phim', 'Đạo diễn', 'Thể loại', 'Thời lượng', 'Trạng thái', 'Thao tác'].map(h => (
                <span key={h} className="text-[10px] font-black uppercase tracking-widest text-slate-500">{h}</span>
              ))}
            </div>
            {filtered.map(m => {
              const sc = STATUS_CONFIG[m.status]
              return (
                <div key={m.id} className="grid min-w-[980px] grid-cols-[2fr_1fr_1.2fr_.8fr_.9fr_.8fr] items-center gap-4 border-b border-white/5 px-5 py-4 transition-colors last:border-b-0 hover:bg-white/[0.03]">
                  {/* Title + poster mini */}
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                      {m.poster_url && <Image fill src={m.poster_url} alt={m.title} className="object-cover" sizes="40px" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-white line-clamp-1">{m.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-black text-slate-300">{m.age_rating}</span>
                        {m.score > 0 && (
                          <span className="flex items-center gap-1 text-[10px] font-black text-yellow-400">
                            <StarIcon />
                            {m.score.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="truncate text-sm text-slate-400">{m.director || '—'}</p>
                  <div className="flex flex-wrap gap-1">
                    {m.genre.slice(0, 2).map(g => (
                      <span key={g} className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold text-slate-500">{g}</span>
                    ))}
                    {m.genre.length > 2 && (
                      <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold text-slate-600">+{m.genre.length - 2}</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{m.duration_minutes} phút</p>
                  <div>
                    <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black ${sc.bg} ${sc.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => setEditMovie(m)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600/15 border border-violet-500/20 text-violet-400 hover:bg-violet-600/30 transition-colors"
                    ><EditIcon /></button>
                    <button onClick={() => setDeleteTarget(m)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/15 border border-red-500/20 text-red-400 hover:bg-red-600/30 transition-colors"
                    ><TrashIcon /></button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer count */}
        <div className="border-t border-white/5 px-5 py-4 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-600">
            Hiển thị <span className="text-slate-400">{filtered.length}</span> / {movies.length} phim
          </p>
        </div>
      </div>

      {/* ── Modals ── */}
      {editMovie !== undefined && (
        <MovieFormModal
          movie={editMovie}
          onClose={() => setEditMovie(undefined)}
          onSave={handleSave}
          genreOptions={genreOptions}
          ageRatingOptions={ageRatingOptions}
          statusOptions={statusOptions}
          isSaving={isSavingMovie}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          movie={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </section>
  )
}

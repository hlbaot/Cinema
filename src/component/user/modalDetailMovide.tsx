'use client'

import NextImage from 'next/image'
import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Film,
  MapPin,
  Play,
  Users,
  Calendar,
} from 'lucide-react'

import { useMovieDetail } from '@/src/hooks/useMovieDetail'

const weekdayLabels = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7']

function DetailInfoItem({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-yellow-500">{icon}</span>
      <span>{children}</span>
    </div>
  )
}

export default function ModalDetailMovide({ movieId }: { movieId?: string }) {
  const { movie, loading } = useMovieDetail(movieId);
  const [selectedDate, setSelectedDate] = useState('')
  const [expandedTheater, setExpandedTheater] = useState(0)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p>Không tìm thấy phim</p>
      </div>
    );
  }

  const activeDate = selectedDate || movie.showtimes[0]?.date || ''
  const currentShowtimeGroup = movie.showtimes.find(s => s.date === activeDate);

  return (
    <section className="min-h-screen bg-black text-white">
      <div className="relative h-[72vh] min-h-[620px] overflow-hidden lg:h-[82vh]">
        <div className="absolute inset-0">
          <NextImage
            src={movie.poster}
            alt={movie.title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
        <div className="absolute inset-0 bg-black/35" />

        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8 lg:pb-20">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-12">
              <div className="hidden w-72 shrink-0 translate-y-16 lg:block">
                <div className="group relative">
                  <div className="aspect-[2/3] overflow-hidden rounded-[1.75rem] border border-white/10 shadow-2xl shadow-black/70 transition-all duration-300 group-hover:border-yellow-500/50">
                    <NextImage
                      src={movie.poster}
                      alt={movie.title}
                      width={420}
                      height={630}
                      sizes="288px"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <a
                    href={movie.trailer}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0 flex items-center justify-center rounded-[1.75rem] bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    aria-label={`Xem trailer ${movie.title}`}
                  >
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500 text-black transition-transform duration-300 group-hover:scale-110">
                      <Play className="ml-1 h-8 w-8 fill-current" />
                    </span>
                  </a>
                </div>
              </div>

              <div className="flex-1 lg:pb-16">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="group mb-6 flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
                >
                  <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                  <span>Quay lại</span>
                </button>

                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-gradient-to-r from-red-600 to-red-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-red-500/25">
                    {movie.status.toUpperCase()}
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                    {movie.age_rating}
                  </span>
                </div>

                <h1 className="mb-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                  {movie.title.toUpperCase()}
                </h1>

                <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-gray-300 sm:gap-6 sm:text-base">
                  <DetailInfoItem icon={<Clock3 className="h-5 w-5" />}>
                    <span className="font-medium">{movie.minutes} phút</span>
                  </DetailInfoItem>
                  <DetailInfoItem icon={<Calendar className="h-5 w-5" />}>
                    <span>Đạo diễn: {movie.director}</span>
                  </DetailInfoItem>
                </div>

                <div className="mb-8 flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white backdrop-blur-sm transition-colors hover:border-yellow-500/50"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <a
                    href={movie.trailer}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-6 py-4 text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/20 sm:px-8"
                  >
                    <Play className="h-5 w-5 transition-transform group-hover:scale-110" />
                    <span className="font-semibold">Xem Trailer</span>
                  </a>

                  <a
                    href="#showtimes"
                    className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-400 px-6 py-4 font-bold text-black transition-all hover:from-yellow-400 hover:to-yellow-300 sm:px-8"
                  >
                    <span>Mua Vé Ngay</span>
                    <ChevronRight className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="space-y-12 lg:col-span-2">
            <div>
              <h2 className="mb-4 flex items-center gap-3 text-2xl font-bold text-white">
                <Film className="h-6 w-6 text-yellow-500" />
                Nội dung phim
              </h2>
              <p className="text-base leading-8 text-gray-300 sm:text-lg">{movie.description}</p>
            </div>

            <div>
              <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-white">
                <Users className="h-6 w-6 text-yellow-500" />
                Diễn viên
              </h2>
              <div className="flex flex-wrap gap-2">
                {movie.actors.map((actor) => (
                  <span key={actor} className="rounded-lg bg-zinc-800 px-4 py-2 text-white">
                    {actor}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <aside className="lg:col-span-1" id="showtimes">
            <div className="lg:sticky lg:top-24">
              <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-white">
                <MapPin className="h-6 w-6 text-yellow-500" />
                Lịch chiếu
              </h2>

              <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                {movie.showtimes.map((group) => {
                  const isActive = group.date === activeDate
                  const dateObj = new Date(group.date);
                  const day = dateObj.getDate();
                  const month = dateObj.getMonth() + 1;
                  const weekday = weekdayLabels[dateObj.getDay()];

                  return (
                    <button
                      key={group.date}
                      type="button"
                      onClick={() => setSelectedDate(group.date)}
                      className={`flex min-w-[74px] flex-col items-center rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-b from-yellow-500 to-yellow-600 text-black shadow-lg shadow-yellow-500/25'
                          : 'border border-zinc-700 bg-zinc-800/50 text-gray-400 hover:bg-zinc-700 hover:text-white'
                      }`}
                    >
                      <span className="text-xs opacity-75">{weekday}</span>
                      <span className="text-lg font-bold">{day}</span>
                      <span className="text-xs opacity-75">Th {month}</span>
                    </button>
                  )
                })}
              </div>

              <div className="space-y-4">
                {currentShowtimeGroup?.rooms.map((room, idx) => {
                  const isExpanded = idx === expandedTheater

                  return (
                    <div
                      key={room.room_id}
                      className={`overflow-hidden rounded-2xl border transition-all ${
                        isExpanded
                          ? 'border-yellow-500/30 bg-zinc-900/80'
                          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedTheater(isExpanded ? -1 : idx)}
                        className="flex w-full items-start gap-4 p-4 text-left"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600">
                          <span className="text-lg font-bold text-black">{room.room_name.charAt(0)}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-white">{room.room_name}</h3>
                          <p className="mt-1 text-sm text-gray-500">Format: {room.format.toUpperCase()}</p>
                        </div>
                        <ChevronRight className={`mt-1 h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4">
                           <div className="flex flex-wrap gap-2">
                             {room.sessions.map((session) => (
                               <a
                                 key={session.id}
                                 href={`/dat-ve/${session.id}?movieId=${movieId}&roomId=${room.room_id}`}
                                 className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-500 hover:text-black transition-all text-center"
                               >
                                 {session.time}
                               </a>
                             ))}
                           </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

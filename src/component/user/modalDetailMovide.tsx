'use client'

import Image from 'next/image'
import { useMemo, useState, type ReactNode } from 'react'
import {
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Film,
  MapPin,
  Play,
  Star,
  Users,
  Volume2,
} from 'lucide-react'

import { dataMovie, type Movie } from '@/src/data/movie'

type ModalDetailMovideProps = {
  movieId?: number
}

type CastMember = {
  name: string
  role: string
  avatar: string
}

type ShowtimeStatus = 'available' | 'limited' | 'soldout'

type ShowtimeSlot = {
  time: string
  status: ShowtimeStatus
}

type TheaterFormatTone = 'imax' | 'gold' | 'standard' | 'screenx'

type TheaterFormat = {
  label: string
  tone: TheaterFormatTone
  slots: ShowtimeSlot[]
}

type Theater = {
  name: string
  address: string
  badges: string[]
  formats: TheaterFormat[]
}

type MovieMeta = {
  statusLabel: string
  releaseDate: string
  language: string
  synopsis: string
  director: string
  criticScore: number
  audienceScore: number
  hot: boolean
  cast: CastMember[]
  theaters: Theater[]
}

type ScheduleDay = {
  iso: string
  weekdayLabel: string
  dayNumber: string
  monthLabel: string
}

const weekdayLabels = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7']

const defaultTheaters: Theater[] = [
  {
    name: 'CINEPRO Landmark 81',
    address: 'Tầng 5, Landmark 81, 720A Điện Biên Phủ, Q. Bình Thạnh, TP.HCM',
    badges: ['IMAX', 'Dolby Atmos', 'Gold Class'],
    formats: [
      {
        label: 'IMAX',
        tone: 'imax',
        slots: [
          { time: '10:30', status: 'available' },
          { time: '13:45', status: 'limited' },
          { time: '21:30', status: 'available' },
        ],
      },
      {
        label: 'Gold Class',
        tone: 'gold',
        slots: [{ time: '16:00', status: 'available' }],
      },
      {
        label: '2D',
        tone: 'standard',
        slots: [{ time: '19:15', status: 'soldout' }],
      },
    ],
  },
  {
    name: 'CINEPRO Central Premium',
    address: 'Tầng 6, Takashimaya, 92-94 Nam Kỳ Khởi Nghĩa, Q.1, TP.HCM',
    badges: ['Gold Class', 'Dolby Atmos', 'ScreenX'],
    formats: [
      {
        label: 'ScreenX',
        tone: 'screenx',
        slots: [
          { time: '11:20', status: 'available' },
          { time: '18:40', status: 'limited' },
        ],
      },
      {
        label: 'Gold Class',
        tone: 'gold',
        slots: [{ time: '20:50', status: 'available' }],
      },
    ],
  },
  {
    name: 'CINEPRO Aeon Mall',
    address: 'Tầng 3, Aeon Mall Tân Phú, 30 Bờ Bao Tân Thắng, Q. Tân Phú, TP.HCM',
    badges: ['IMAX', '2D', '3D'],
    formats: [
      {
        label: 'IMAX',
        tone: 'imax',
        slots: [
          { time: '09:50', status: 'available' },
          { time: '15:10', status: 'available' },
        ],
      },
      {
        label: '3D',
        tone: 'standard',
        slots: [{ time: '17:35', status: 'limited' }],
      },
    ],
  },
]

const movieMetaById: Record<number, MovieMeta> = {
  1: {
    statusLabel: 'Đang chiếu',
    releaseDate: '2022-12-16',
    language: 'Phụ đề Việt · 3D',
    synopsis:
      'Jake Sully cùng gia đình Na’vi bước vào hành trình bảo vệ quê hương Pandora trước một mối đe dọa quay trở lại. Cuộc chiến mới buộc họ phải lựa chọn giữa sinh tồn, tình thân và tương lai của cả bộ tộc.',
    director: 'James Cameron',
    criticScore: 93,
    audienceScore: 95,
    hot: true,
    cast: [
      {
        name: 'Sam Worthington',
        role: 'vai Jake Sully',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=face',
      },
      {
        name: 'Zoe Saldaña',
        role: 'vai Neytiri',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&crop=face',
      },
      {
        name: 'Sigourney Weaver',
        role: 'vai Kiri',
        avatar:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop&crop=face',
      },
      {
        name: 'Stephen Lang',
        role: 'vai Quaritch',
        avatar:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&h=160&fit=crop&crop=face',
      },
      {
        name: 'Kate Winslet',
        role: 'vai Ronal',
        avatar:
          'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=160&h=160&fit=crop&crop=face',
      },
    ],
    theaters: defaultTheaters,
  },
  2: {
    statusLabel: 'Sắp ra mắt',
    releaseDate: '2026-07-31',
    language: 'Phụ đề Việt · IMAX',
    synopsis:
      'Biệt đội Avengers cùng các đồng minh đối đầu Thanos trong cuộc chiến lớn nhất của Vũ trụ Điện ảnh Marvel, nơi mọi lựa chọn đều có cái giá cực lớn.',
    director: 'Anthony Russo & Joe Russo',
    criticScore: 96,
    audienceScore: 97,
    hot: true,
    cast: [
      {
        name: 'Robert Downey Jr.',
        role: 'vai Iron Man',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=face',
      },
      {
        name: 'Chris Evans',
        role: 'vai Captain America',
        avatar:
          'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=160&h=160&fit=crop&crop=face',
      },
      {
        name: 'Scarlett Johansson',
        role: 'vai Black Widow',
        avatar:
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&h=160&fit=crop&crop=face',
      },
      {
        name: 'Chris Hemsworth',
        role: 'vai Thor',
        avatar:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&h=160&fit=crop&crop=face',
      },
      {
        name: 'Benedict Cumberbatch',
        role: 'vai Doctor Strange',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=face',
      },
    ],
    theaters: defaultTheaters,
  },
  3: {
    statusLabel: 'Sắp ra mắt',
    releaseDate: '2026-07-31',
    language: 'Lồng tiếng Việt · 2D',
    synopsis:
      'Peter Parker phải học cách làm chủ năng lực mới trong khi đối diện những mất mát đầu đời, mở ra hành trình trở thành Người Nhện theo cách riêng của mình.',
    director: 'Marc Webb',
    criticScore: 88,
    audienceScore: 91,
    hot: false,
    cast: [
      {
        name: 'Andrew Garfield',
        role: 'vai Peter Parker',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=face',
      },
      {
        name: 'Emma Stone',
        role: 'vai Gwen Stacy',
        avatar:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop&crop=face',
      },
      {
        name: 'Rhys Ifans',
        role: 'vai Curt Connors',
        avatar:
          'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=160&h=160&fit=crop&crop=face',
      },
      {
        name: 'Sally Field',
        role: 'vai Aunt May',
        avatar:
          'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=160&h=160&fit=crop&crop=face',
      },
      {
        name: 'Martin Sheen',
        role: 'vai Ben Parker',
        avatar:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&h=160&fit=crop&crop=face',
      },
    ],
    theaters: defaultTheaters,
  },
  4: {
    statusLabel: 'Đang chiếu',
    releaseDate: '2026-02-17',
    language: 'Lồng tiếng Việt',
    synopsis:
      'Một câu chuyện giải trí đậm chất Việt, nơi cảm xúc gia đình, tiếng cười và những mâu thuẫn gần gũi được đẩy lên cao trào trong bối cảnh ngày Tết.',
    director: 'Trấn Thành',
    criticScore: 87,
    audienceScore: 92,
    hot: true,
    cast: [
      {
        name: 'Trấn Thành',
        role: 'vai chính',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=face',
      },
      {
        name: 'Lê Giang',
        role: 'vai người mẹ',
        avatar:
          'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=160&h=160&fit=crop&crop=face',
      },
      {
        name: 'Uyển Ân',
        role: 'vai em gái',
        avatar:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop&crop=face',
      },
      {
        name: 'Tuấn Trần',
        role: 'vai nam chính',
        avatar:
          'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=160&h=160&fit=crop&crop=face',
      },
      {
        name: 'Hồng Đào',
        role: 'vai khách mời',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&crop=face',
      },
    ],
    theaters: defaultTheaters,
  },
}

function buildScheduleDays(): ScheduleDay[] {
  const baseDate = new Date()
  baseDate.setHours(0, 0, 0, 0)

  return Array.from({ length: 7 }, (_, index) => {
    const nextDate = new Date(baseDate)
    nextDate.setDate(baseDate.getDate() + index)

    return {
      iso: nextDate.toISOString(),
      weekdayLabel: weekdayLabels[nextDate.getDay()],
      dayNumber: String(nextDate.getDate()),
      monthLabel: `Th ${nextDate.getMonth() + 1}`,
    }
  })
}

function getFormatToneClasses(tone: TheaterFormatTone) {
  if (tone === 'imax') {
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  }

  if (tone === 'gold') {
    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  }

  if (tone === 'screenx') {
    return 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30'
  }

  return 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30'
}

function getShowtimeButtonClasses(status: ShowtimeStatus) {
  if (status === 'limited') {
    return 'bg-orange-500/20 text-orange-400 border-orange-500/50 hover:bg-orange-500 hover:text-black hover:border-orange-500'
  }

  if (status === 'soldout') {
    return 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
  }

  return 'bg-zinc-800 text-white border-zinc-700 hover:bg-yellow-500 hover:text-black hover:border-yellow-500'
}

function getMovieMeta(movie: Movie): MovieMeta {
  return (
    movieMetaById[movie.id] ?? {
      statusLabel: 'Đang chiếu',
      releaseDate: '2026-05-07',
      language: 'Phụ đề Việt',
      synopsis: movie.description,
      director: 'Đang cập nhật',
      criticScore: movie.score,
      audienceScore: Math.min(movie.score + 2, 99),
      hot: movie.score >= 90,
      cast: [],
      theaters: defaultTheaters,
    }
  )
}

function DetailInfoItem({
  icon,
  children,
}: {
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-yellow-500">{icon}</span>
      <span>{children}</span>
    </div>
  )
}

export default function ModalDetailMovide({ movieId }: ModalDetailMovideProps) {
  const featuredMovie = dataMovie.find((movie) => movie.id === movieId) ?? dataMovie[0]
  const movieMeta = featuredMovie ? getMovieMeta(featuredMovie) : null
  const scheduleDays = useMemo(() => buildScheduleDays(), [])
  const [activeDate, setActiveDate] = useState(scheduleDays[0]?.iso ?? '')
  const [expandedTheater, setExpandedTheater] = useState(0)

  if (!featuredMovie || !movieMeta) {
    return null
  }

  return (
    <section className="min-h-screen bg-black text-white">
      <div className="relative h-[72vh] min-h-[620px] overflow-hidden lg:h-[82vh]">
        <div className="absolute inset-0">
          <Image
            src={featuredMovie.poster}
            alt={featuredMovie.title}
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
                    <Image
                      src={featuredMovie.poster}
                      alt={featuredMovie.title}
                      width={420}
                      height={630}
                      sizes="288px"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <a
                    href={featuredMovie.trailer}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0 flex items-center justify-center rounded-[1.75rem] bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    aria-label={`Xem trailer ${featuredMovie.title}`}
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
                    {movieMeta.statusLabel.toUpperCase()}
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                    {featuredMovie.age_rating}
                  </span>
                  {movieMeta.hot && (
                    <span className="rounded-full border border-yellow-500/30 bg-yellow-500/20 px-3 py-1.5 text-xs font-medium text-yellow-400">
                      Hot 🔥
                    </span>
                  )}
                </div>

                <div className="mb-6 flex items-start gap-4 lg:hidden">
                  <div className="relative h-40 w-28 shrink-0 overflow-hidden rounded-2xl border border-white/10 shadow-xl shadow-black/50">
                    <Image
                      src={featuredMovie.poster}
                      alt={featuredMovie.title}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 self-center">
                    <p className="line-clamp-4 text-sm leading-6 text-gray-300">{movieMeta.synopsis}</p>
                  </div>
                </div>

                <h1 className="mb-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                  {featuredMovie.title.toUpperCase()}
                </h1>

                <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-gray-300 sm:gap-6 sm:text-base">
                  <DetailInfoItem icon={<Clock3 className="h-5 w-5" />}>
                    <span className="font-medium">{featuredMovie.minutes} phút</span>
                  </DetailInfoItem>
                  <DetailInfoItem icon={<Calendar className="h-5 w-5" />}>
                    <span>Khởi chiếu: {movieMeta.releaseDate}</span>
                  </DetailInfoItem>
                  <DetailInfoItem icon={<Volume2 className="h-5 w-5" />}>
                    <span>{movieMeta.language}</span>
                  </DetailInfoItem>
                </div>

                <div className="mb-8 flex flex-wrap gap-2">
                  {featuredMovie.genres.map((genre) => (
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
                    href={featuredMovie.trailer}
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
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-900/40 to-red-950/20 p-6 transition-colors hover:border-red-500/40">
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-red-500/10 blur-3xl" />
                <div className="relative flex items-center gap-4">
                  <div className="text-5xl">🍅</div>
                  <div>
                    <div className="text-4xl font-black text-white">{movieMeta.criticScore}%</div>
                    <div className="font-medium text-red-400">Tomatometer</div>
                    <div className="mt-1 text-sm text-gray-400">Giới phê bình</div>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-900/40 to-yellow-950/20 p-6 transition-colors hover:border-yellow-500/40">
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-yellow-500/10 blur-3xl" />
                <div className="relative flex items-center gap-4">
                  <Star className="h-12 w-12 fill-yellow-400 text-yellow-400" />
                  <div>
                    <div className="text-4xl font-black text-white">{movieMeta.audienceScore}%</div>
                    <div className="font-medium text-yellow-400">Audience Score</div>
                    <div className="mt-1 text-sm text-gray-400">Người xem</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-4 flex items-center gap-3 text-2xl font-bold text-white">
                <Film className="h-6 w-6 text-yellow-500" />
                Nội dung phim
              </h2>
              <p className="text-base leading-8 text-gray-300 sm:text-lg">{movieMeta.synopsis}</p>

              <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="text-gray-400">Đạo diễn:</span>
                  <span className="font-medium text-white">{movieMeta.director}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-white">
                <Users className="h-6 w-6 text-yellow-500" />
                Diễn viên
              </h2>

              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
                {movieMeta.cast.map((member) => (
                  <div key={member.name} className="group cursor-pointer text-center">
                    <div className="relative mb-4">
                      <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-[3px] border-zinc-700 shadow-lg transition-all duration-300 group-hover:border-yellow-500">
                        <Image
                          src={member.avatar}
                          alt={member.name}
                          width={96}
                          height={96}
                          sizes="96px"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <div className="absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-yellow-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>

                    <h4 className="font-semibold text-white transition-colors group-hover:text-yellow-400">
                      {member.name}
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">{member.role}</p>
                  </div>
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
                {scheduleDays.map((day) => {
                  const isActive = day.iso === activeDate

                  return (
                    <button
                      key={day.iso}
                      type="button"
                      onClick={() => setActiveDate(day.iso)}
                      className={`flex min-w-[74px] flex-col items-center rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-b from-yellow-500 to-yellow-600 text-black shadow-lg shadow-yellow-500/25'
                          : 'border border-zinc-700 bg-zinc-800/50 text-gray-400 hover:bg-zinc-700 hover:text-white'
                      }`}
                    >
                      <span className="text-xs opacity-75">{day.weekdayLabel}</span>
                      <span className="text-lg font-bold">{day.dayNumber}</span>
                      <span className="text-xs opacity-75">{day.monthLabel}</span>
                    </button>
                  )
                })}
              </div>

              <div className="space-y-4">
                {movieMeta.theaters.map((theater, theaterIndex) => {
                  const isExpanded = theaterIndex === expandedTheater

                  return (
                    <div
                      key={theater.name}
                      className={`overflow-hidden rounded-2xl border transition-all ${
                        isExpanded
                          ? 'border-yellow-500/30 bg-zinc-900/80'
                          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedTheater(isExpanded ? -1 : theaterIndex)}
                        className="flex w-full items-start gap-4 p-4 text-left"
                      >
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                            isExpanded ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' : 'bg-red-600/20'
                          }`}
                        >
                          <span className={`text-lg font-bold ${isExpanded ? 'text-black' : 'text-red-500'}`}>C</span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-white">{theater.name}</h3>
                          <p className="mt-1 line-clamp-1 text-sm text-gray-500">{theater.address}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {theater.badges.map((badge) => (
                              <span
                                key={`${theater.name}-${badge}`}
                                className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-gray-400"
                              >
                                {badge}
                              </span>
                            ))}
                          </div>
                        </div>

                        <ChevronRight
                          className={`mt-1 h-5 w-5 shrink-0 text-gray-400 transition-transform ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="space-y-4 px-4 pb-4">
                          {theater.formats.map((format) => (
                            <div key={`${theater.name}-${format.label}`}>
                              <div className="mb-3 flex items-center gap-2">
                                <span
                                  className={`rounded-full border px-3 py-1 text-xs font-bold ${getFormatToneClasses(
                                    format.tone,
                                  )}`}
                                >
                                  {format.label}
                                </span>
                                <div className="h-px flex-1 bg-zinc-800" />
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {format.slots.map((slot) => {
                                  const isSoldOut = slot.status === 'soldout'

                                  return (
                                    <button
                                      key={`${theater.name}-${format.label}-${slot.time}`}
                                      type="button"
                                      disabled={isSoldOut}
                                      className={`relative rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all ${getShowtimeButtonClasses(
                                        slot.status,
                                      )}`}
                                    >
                                      <span>{slot.time}</span>
                                      {slot.status === 'limited' && (
                                        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-orange-500" />
                                      )}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="mb-3 text-xs font-medium text-gray-500">Chú thích:</div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-zinc-700" />
                    <span className="text-gray-400">Còn chỗ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-orange-500" />
                    <span className="text-gray-400">Sắp đầy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full border border-zinc-700 bg-zinc-900" />
                    <span className="text-gray-400">Hết vé</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

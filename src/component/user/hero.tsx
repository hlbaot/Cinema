'use client'

import { useEffect, useState } from 'react'

import { dataMovie } from '@/src/data/movie'

function StarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-5 w-5 fill-yellow-400 text-yellow-400"
      aria-hidden="true"
    >
      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  )
}

function TicketIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
    </svg>
  )
}

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {direction === 'left' ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  )
}

const releaseDates = ['2022-12-16', '2018-04-27', '2026-07-31', '2026-02-17']
const ratings = ['96%', '94%', '91%', '93%']
const videoStylesByMovieId: Record<number, { scale: string; objectPosition: string }> = {
  1: { scale: 'scale-[1.18]', objectPosition: 'center center' },
  2: { scale: 'scale-[1.22]', objectPosition: 'center center' },
  3: { scale: 'scale-[1.42]', objectPosition: 'center 28%' },
  4: { scale: 'scale-[1.2]', objectPosition: 'center center' },
}

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (dataMovie.length <= 1) {
      return
    }

    const interval = window.setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % dataMovie.length)
    }, 5000)

    return () => window.clearInterval(interval)
  }, [])

  if (dataMovie.length === 0) {
    return null
  }

  const currentMovie = dataMovie[currentIndex]
  const statusLabel = currentMovie.status.toUpperCase()
  const releaseDate = releaseDates[currentIndex] ?? 'Dang cap nhat'
  const rating = ratings[currentIndex] ?? '95%'
  const videoStyle = videoStylesByMovieId[currentMovie.id] ?? {
    scale: 'scale-[1.25]',
    objectPosition: 'center center',
  }

  const goToSlide = (index: number) => setCurrentIndex(index)
  const goToPrevious = () =>
    setCurrentIndex((prevIndex) => (prevIndex - 1 + dataMovie.length) % dataMovie.length)
  const goToNext = () => setCurrentIndex((prevIndex) => (prevIndex + 1) % dataMovie.length)

  return (
    <div className="relative -mt-16 min-h-[calc(100vh+4rem)] w-full overflow-hidden lg:-mt-20 lg:min-h-[calc(100vh+5rem)]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${currentMovie.poster})` }}
      />
      <div className="absolute inset-0 overflow-hidden">
        <video
          key={currentMovie.id}
          className={`absolute top-1/2 left-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover ${videoStyle.scale}`}
          src={currentMovie.trailer}
          poster={currentMovie.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          style={{ objectPosition: videoStyle.objectPosition }}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

      <div className="relative min-h-[calc(100vh+4rem)] px-4 pt-16 sm:px-6 lg:min-h-[calc(100vh+5rem)] lg:px-8 lg:pt-20">
        <div className="mx-auto flex min-h-[calc(100vh+4rem)] w-full max-w-7xl items-center justify-start lg:min-h-[calc(100vh+5rem)]">
          <div className="max-w-2xl pb-24">
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded bg-red-600 px-3 py-1 text-xs font-bold text-white">
                {statusLabel}
              </span>
              <span className="rounded bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                {currentMovie.age_rating}
              </span>
            </div>

            <h1 className="mb-4 text-4xl leading-tight font-black text-white sm:text-5xl lg:text-7xl">
              {currentMovie.title.toUpperCase()}
            </h1>

            <div className="mb-6 flex flex-wrap items-center gap-4 text-gray-300">
              <div className="flex items-center gap-1">
                <StarIcon />
                <span className="font-semibold">{rating}</span>
              </div>

              <div className="flex items-center gap-1">
                <ClockIcon />
                <span>{currentMovie.minutes} phút</span>
              </div>

              <div className="flex items-center gap-1">
                <CalendarIcon />
                <span>{releaseDate}</span>
              </div>
            </div>

            <p
              className="mb-8 text-sm text-gray-400 sm:text-base"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {currentMovie.description}
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="/trangDatVe"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 px-8 py-4 font-bold text-black transition-all hover:scale-105 hover:from-yellow-400 hover:to-amber-500"
              >
                <TicketIcon />
                <span>MUA VE NGAY</span>
              </a>

              <a
                href={currentMovie.trailer}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 py-4 font-medium text-white backdrop-blur transition-all hover:bg-white/20"
              >
                <PlayIcon />
                <span>XEM TRAILER</span>
              </a>
            </div>

          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={goToPrevious}
        className="absolute top-1/2 left-4 z-10 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-all hover:bg-white/20 sm:left-6 sm:h-16 sm:w-16 lg:left-8 lg:h-20 lg:w-20"
        aria-label="Phim truoc"
      >
        <ArrowIcon direction="left" />
      </button>

      <button
        type="button"
        onClick={goToNext}
        className="absolute top-1/2 right-4 z-10 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-all hover:bg-white/20 sm:right-6 sm:h-16 sm:w-16 lg:right-8 lg:h-20 lg:w-20"
        aria-label="Phim tiep theo"
      >
        <ArrowIcon direction="right" />
      </button>

      <div className="absolute right-0 bottom-8 left-0 z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl justify-center">
          <div className="flex flex-wrap items-center gap-3">
            {dataMovie.map((movie, index) => (
              <button
                key={movie.id}
                type="button"
                onClick={() => goToSlide(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === currentIndex ? 'w-10 bg-yellow-400' : 'w-2.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Chon phim ${movie.title}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

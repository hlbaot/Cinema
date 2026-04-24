import Image from "next/image";
import Link from "next/link";
import { dataMovie } from "@/src/data/movie";

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
        fill="currentColor"
      />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getMovieBadge(status: string) {
  return status === "Đang chiếu" ? "HOT" : "NEW";
}

function getShortDescription(description: string, maxLength = 92) {
  if (description.length <= maxLength) {
    return description;
  }

  const shortened = description.slice(0, maxLength);
  const lastSpace = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, lastSpace > 0 ? lastSpace : maxLength)}...`;
}

export default function ListMovie() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:max-w-6xl lg:px-8">
      <div className="mb-6 flex items-end justify-between gap-4 lg:mb-7">
        <div>
          <h2 className="text-xl font-bold text-white sm:text-2xl lg:text-[1.75rem]">Danh sách phim đang chiếu</h2>
          <p className="mt-1 text-sm text-gray-400">Tất cả bộ phim nổi bật hiện có tại CinePro</p>
        </div>

        <Link
          href="/phim"
          className="flex items-center gap-1 text-sm font-medium text-yellow-400 transition-colors hover:text-yellow-300"
        >
          Xem tất cả
          <ChevronRightIcon className="h-5 w-5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 md:gap-x-4 md:gap-y-7 lg:gap-x-5">
        {dataMovie.map((movie) => (
          <article key={movie.id} className="group min-w-0 cursor-pointer">
            <div className="relative mb-2.5 aspect-[2/3] overflow-hidden rounded-lg">
              <Image
                src={movie.poster}
                alt={movie.title}
                fill
                quality={88}
                sizes="(min-width: 1280px) 240px, (min-width: 1024px) calc((100vw - 6.5rem) / 4), (min-width: 768px) calc((100vw - 4.75rem) / 4), calc((100vw - 2.25rem) / 2)"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="absolute top-3 left-3 rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
                {getMovieBadge(movie.status)}
              </div>

              <div className="absolute top-3 right-3 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur">
                {movie.age_rating}
              </div>

              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <Link
                  href="/lichChieu"
                  className="rounded-lg bg-linear-to-r from-yellow-500 to-amber-600 px-4 py-2 text-xs font-bold text-black transition-transform hover:scale-105 sm:px-5 sm:py-2.5 sm:text-sm"
                >
                  MUA VÉ
                </Link>
              </div>
            </div>

            <h3 className="truncate text-sm font-bold text-white transition-colors group-hover:text-yellow-400 sm:text-[15px]">
              {movie.title}
            </h3>

            <div className="mt-1 flex items-center gap-2 text-xs text-gray-400 sm:text-sm">
              <div className="flex items-center gap-1">
                <StarIcon className="h-4 w-4 text-yellow-400" />
                <span>{movie.score}%</span>
              </div>
              <span>•</span>
              <span>{movie.minutes} phút</span>
            </div>

            <p
              className="mt-1.5 text-xs leading-5 text-gray-400 sm:text-[13px]"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {getShortDescription(movie.description, 68)}
            </p>

            <div className="mt-2 flex flex-wrap gap-1">
              {movie.genres.slice(0, 2).map((genre) => (
                <span key={genre} className="rounded bg-white/10 px-2 py-0.5 text-xs text-gray-300">
                  {genre}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

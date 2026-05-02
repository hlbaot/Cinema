"use client";

import Image from "next/image";
import Link from "next/link";

import { dataMovie, type Movie } from "@/src/data/movie";

import {
  ALL_GENRE_LABEL,
  type MovieSortKey,
  type MovieTabKey,
  type MovieViewMode,
} from "@/src/component/user/movieFilterSection";

const showingStatus: Movie["status"] = "\u0110ang chi\u1ebfu";
const comingStatus: Movie["status"] = "S\u1eafp ra m\u1eaft";

function PlayIcon() {
  return (
    <svg className="ml-1 h-8 w-8 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
      <path d="M12 7v5l3 2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M2 8.5A2.5 2.5 0 014.5 6h11A2.5 2.5 0 0118 8.5v1a1.5 1.5 0 010 3v1a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 012 13.5v-1a1.5 1.5 0 010-3v-1zM9 6.5h2v1H9v-1zm0 3h2v1H9v-1zm0 3h2v1H9v-1z" />
    </svg>
  );
}

function TrailerIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 4.5A1.5 1.5 0 015.5 3h9A1.5 1.5 0 0116 4.5v11a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 014 15.5v-11zm4 2.2v6.6L13.2 10 8 6.7z" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="ml-2 inline-block h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function getAgeBadgeClass(ageRating: string) {
  if (ageRating === "18+") {
    return "bg-red-500";
  }

  if (ageRating === "16+") {
    return "bg-orange-500";
  }

  if (ageRating === "13+") {
    return "bg-yellow-500";
  }

  return "bg-green-500";
}

function getStatusChipClass(status: Movie["status"]) {
  return status === showingStatus
    ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
    : "border-sky-500/20 bg-sky-500/10 text-sky-300";
}

function movieMatchesTab(movie: Movie, activeTab: MovieTabKey) {
  return activeTab === "showing" ? movie.status === showingStatus : movie.status === comingStatus;
}

function movieMatchesRating(movie: Movie, selectedRating: string) {
  if (selectedRating === ALL_GENRE_LABEL) {
    return true;
  }

  if (selectedRating === "Ph\u1ed5 bi\u1ebfn") {
    return !["13+", "16+", "18+"].includes(movie.age_rating);
  }

  return movie.age_rating === selectedRating;
}

function MovieGridCard({ movie, index }: { movie: Movie; index: number }) {
  return (
    <article className="group cursor-pointer" style={{ animationDelay: `${index * 50}ms` }}>
      <div className="relative mb-3 aspect-[2/3] overflow-hidden rounded-xl bg-gray-900">
        <Image
          src={movie.poster}
          alt={movie.title}
          fill
          quality={88}
          sizes="(min-width: 1536px) 180px, (min-width: 1280px) 16vw, (min-width: 1024px) 19vw, (min-width: 768px) 22vw, (min-width: 640px) 30vw, 46vw"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div
          className={`absolute left-3 top-3 rounded px-2 py-1 text-xs font-bold text-white ${getAgeBadgeClass(
            movie.age_rating,
          )}`}
        >
          {movie.age_rating}
        </div>

        {typeof movie.score === "number" && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/80 px-2 py-1 backdrop-blur-sm">
            <span className="text-yellow-500">{"\u2b50"}</span>
            <span className="text-xs font-semibold text-white">{movie.score}%</span>
          </div>
        )}

        <div className="absolute inset-0 flex scale-50 items-center justify-center opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-md">
            <PlayIcon />
          </div>
        </div>

        <div className="absolute inset-0 flex translate-y-4 flex-col justify-end p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="mb-3 flex flex-wrap gap-1">
            {movie.genres.slice(0, 2).map((genre) => (
              <span
                key={`${movie.id}-${genre}`}
                className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm"
              >
                {genre}
              </span>
            ))}
          </div>

          <Link
            href="/trangDatVe"
            className="w-full rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 py-2 text-center text-sm font-bold text-black transition-all hover:scale-105 hover:from-yellow-400 hover:to-amber-400"
          >
            {"MUA V\u00c9"}
          </Link>
        </div>
      </div>

      <div className="space-y-1">
        <h3
          className="text-sm font-bold text-white transition-colors group-hover:text-yellow-500"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {movie.title}
        </h3>
        <p className="text-xs text-gray-500">
          {movie.minutes} {"ph\u00fat"}
        </p>
      </div>
    </article>
  );
}

function MovieListRow({ movie }: { movie: Movie }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-[#202B3D] bg-[#0A101B] transition-all duration-300 hover:border-yellow-500/30 hover:shadow-[0_18px_48px_rgba(0,0,0,0.28)]">
      <div className="flex flex-col md:flex-row">
        <div className="relative h-[280px] w-full overflow-hidden bg-gray-900 md:h-auto md:w-[190px] md:min-w-[190px]">
          <Image
            src={movie.poster}
            alt={movie.title}
            fill
            quality={88}
            sizes="(min-width: 768px) 190px, 100vw"
            className="object-cover"
          />
          <div
            className={`absolute left-3 top-3 rounded px-2 py-1 text-xs font-bold text-white ${getAgeBadgeClass(
              movie.age_rating,
            )}`}
          >
            {movie.age_rating}
          </div>
        </div>

        <div className="flex flex-1 flex-col px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusChipClass(
                    movie.status,
                  )}`}
                >
                  {movie.status}
                </span>

                {typeof movie.score === "number" && (
                  <span className="rounded-full bg-black/45 px-3 py-1 text-xs font-semibold text-white">
                    {"\u2b50"} {movie.score}%
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-black uppercase tracking-tight text-white sm:text-[2rem]">
                {movie.title}
              </h3>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-400">
            <span className="inline-flex items-center gap-2">
              <ClockIcon />
              <span>
                {movie.minutes} {"ph\u00fat"}
              </span>
            </span>
            <span className="text-gray-600">•</span>
            <span>{movie.age_rating}</span>
            <span className="text-gray-600">•</span>
            <span>{movie.status}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {movie.genres.map((genre) => (
              <span
                key={`${movie.id}-${genre}`}
                className="rounded-full bg-[#1F2C42] px-3 py-1 text-sm text-gray-200"
              >
                {genre}
              </span>
            ))}
          </div>

          <p className="mt-5 max-w-4xl text-base leading-7 text-gray-400">
            {movie.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/trangDatVe"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 px-7 py-3 font-bold text-black transition-all hover:brightness-105"
            >
              <TicketIcon />
              <span>{"MUA V\u00c9 NGAY"}</span>
            </Link>

            <a
              href={movie.trailer}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#31405A] bg-[#243146] px-7 py-3 font-semibold text-white transition-all hover:border-[#41557A] hover:bg-[#2A3950]"
            >
              <TrailerIcon />
              <span>Xem Trailer</span>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

type MovieListSectionProps = {
  activeTab: MovieTabKey;
  viewMode: MovieViewMode;
  sortBy: MovieSortKey;
  selectedGenres: string[];
  selectedRating: string;
};

export default function MovieListSection({
  activeTab,
  viewMode,
  sortBy,
  selectedGenres,
  selectedRating,
}: MovieListSectionProps) {
  const hasGenreFilter =
    selectedGenres.length > 0 && !selectedGenres.includes(ALL_GENRE_LABEL);

  const filteredMovies = dataMovie.filter((movie) => {
    if (!movieMatchesTab(movie, activeTab)) {
      return false;
    }

    if (!movieMatchesRating(movie, selectedRating)) {
      return false;
    }

    if (!hasGenreFilter) {
      return true;
    }

    return movie.genres.some((genre) => selectedGenres.includes(genre));
  });

  const visibleMovies = [...filteredMovies].sort((leftMovie, rightMovie) => {
    if (sortBy === "rating") {
      return rightMovie.score - leftMovie.score;
    }

    if (sortBy === "name") {
      return leftMovie.title.localeCompare(rightMovie.title, "vi", {
        sensitivity: "base",
      });
    }

    return 0;
  });

  return (
    <section className="w-full bg-black">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-400">
            {"T\u00ecm th\u1ea5y"}{" "}
            <span className="font-semibold text-yellow-500">{visibleMovies.length}</span> phim
          </p>
        </div>

        {visibleMovies.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-5 xl:grid-cols-6">
              {visibleMovies.map((movie, index) => (
                <MovieGridCard key={movie.id} movie={movie} index={index} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {visibleMovies.map((movie) => (
                <MovieListRow key={movie.id} movie={movie} />
              ))}
            </div>
          )
        ) : (
          <div className="rounded-2xl border border-gray-800 bg-gray-900/40 px-6 py-12 text-center text-gray-400">
            {"Kh\u00f4ng c\u00f3 phim ph\u00f9 h\u1ee3p v\u1edbi b\u1ed9 l\u1ecdc hi\u1ec7n t\u1ea1i."}
          </div>
        )}

        <div className="mt-12 text-center">
          <button
            type="button"
            className="rounded-full border border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-3 font-medium text-white transition-all hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10"
          >
            {"Xem th\u00eam phim"}
            <ChevronDownIcon />
          </button>
        </div>
      </div>
    </section>
  );
}

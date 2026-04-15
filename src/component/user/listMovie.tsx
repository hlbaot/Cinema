"use client";

import Image from "next/image";
import { useState } from "react";
import { nowShowingMovies } from "@/src/component/user/home-data";
import ModalDetailMovide from "@/src/component/user/modalDetailMovide";

export default function ListMovie() {
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const selectedMovie = nowShowingMovies.find((movie) => movie.id === selectedMovieId) ?? null;

  return (
    <>
      <section className="flex min-h-screen w-full items-center bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.12),transparent_24%),linear-gradient(180deg,#050505_0%,#0a0a0a_100%)]">
        <div className="mx-auto w-full max-w-7xl space-y-8 px-6 py-16">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-red-400/80">Now showing</p>
              <h2 className="mt-2 text-4xl font-semibold uppercase tracking-[0.08em] text-white md:text-5xl">
                Bo phim dang chieu
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-white/60">
              Card phim duoc thiet ke de nhin ro poster, the loai va tao mot diem cham tinh te khi hover,
              sau do mo modal thong tin day du va trailer chiem uu the.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {nowShowingMovies.map((movie) => (
              <button
                key={movie.id}
                onClick={() => setSelectedMovieId(movie.id)}
                className="group overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.04] text-left shadow-[0_16px_70px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-2 hover:border-red-400/35 hover:shadow-[0_24px_90px_rgba(239,68,68,0.12)]"
              >
                <div className={`relative aspect-[4/5] overflow-hidden bg-linear-to-br ${movie.posterBackdrop} p-4`}>
                  <div className={`absolute inset-0 bg-linear-to-br ${movie.posterAccent} opacity-20 blur-3xl transition duration-500 group-hover:opacity-35`} />
                  <Image
                    src={movie.poster}
                    alt={movie.title}
                    fill
                    sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black via-black/25 to-transparent" />
                  <div className="relative flex h-full flex-col justify-between rounded-[1.3rem] border border-white/10 bg-black/15 p-5 backdrop-blur-[2px]">
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs uppercase tracking-[0.28em] text-white/75">
                        {movie.year}
                      </span>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-white/60">
                        {movie.genre}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.34em] text-white/50">Now in cinema</p>
                      <h3 className="text-3xl font-semibold uppercase tracking-[0.08em] text-white">
                        {movie.title}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <p className="text-xl font-semibold uppercase tracking-[0.06em] text-white">{movie.title}</p>
                    <p className="mt-2 text-sm uppercase tracking-[0.26em] text-red-300">{movie.genre}</p>
                  </div>

                  <p className="line-clamp-3 text-base leading-7 text-white/62 transition duration-300 group-hover:text-white/82">
                    {movie.description}
                  </p>

                  <div className="flex flex-wrap gap-2 opacity-75 transition duration-300 group-hover:opacity-100">
                    {movie.showtimes.slice(0, 3).map((time) => (
                      <span
                        key={time}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/72"
                      >
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <ModalDetailMovide movie={selectedMovie} onClose={() => setSelectedMovieId(null)} />
    </>
  );
}

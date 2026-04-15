"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { featuredMovies } from "@/src/component/user/home-data";

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % featuredMovies.length);
    }, 6500);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const activeMovie = featuredMovies[activeIndex];

  if (featuredMovies.length === 0 || !activeMovie) {
    return null;
  }

  function showMovie(index: number) {
    setActiveIndex(index);
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % featuredMovies.length);
  }

  function showPrev() {
    setActiveIndex((current) => (current - 1 + featuredMovies.length) % featuredMovies.length);
  }

  return (
    <section className="flex min-h-screen w-full items-center bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.18),transparent_28%),linear-gradient(180deg,#030303_0%,#080808_62%,#0b0b0b_100%)]">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-16 xl:grid-cols-[minmax(0,1.55fr)_330px]">
        <article className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#080808] shadow-[0_24px_120px_rgba(0,0,0,0.35)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.2),transparent_35%),linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.55))]" />

          <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] lg:items-end">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-3 rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm uppercase tracking-[0.35em] text-red-300">
                Trailer spotlight
              </div>

              <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-black shadow-[0_16px_80px_rgba(0,0,0,0.45)]">
                <div className="aspect-video w-full">
                  <video
                    key={activeMovie.id}
                    className="h-full w-full object-cover"
                    src={activeMovie.trailerUrl}
                    controls
                    autoPlay
                    muted
                    playsInline
                    preload="metadata"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={showPrev}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                  aria-label="Trailer truoc"
                >
                  <ChevronIcon className="h-5 w-5 rotate-180" />
                </button>
                <button
                  onClick={showNext}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                  aria-label="Trailer tiep theo"
                >
                  <ChevronIcon className="h-5 w-5" />
                </button>
                <div className="ml-auto flex items-center gap-2">
                  {featuredMovies.map((movie, index) => (
                    <button
                      key={movie.id}
                      onClick={() => showMovie(index)}
                      className={`h-2.5 rounded-full transition-all ${
                        index === activeIndex ? "w-10 bg-red-500" : "w-2.5 bg-white/25 hover:bg-white/45"
                      }`}
                      aria-label={`Chon ${movie.title}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-5 rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm lg:p-6">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.4em] text-red-300">{activeMovie.year} collection</p>
                <h1 className="text-5xl font-semibold uppercase leading-none tracking-[0.08em] text-white md:text-6xl">
                  {activeMovie.title}
                </h1>
                <p className="max-w-xl text-lg leading-8 text-white/72">{activeMovie.description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[activeMovie.rating, activeMovie.duration, ...activeMovie.genres].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm uppercase tracking-[0.18em] text-white/72"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="rounded-[1.4rem] border border-white/10 bg-black/30 p-4">
                <p className="text-sm uppercase tracking-[0.28em] text-white/40">Mo ta ngan</p>
                <p className="mt-3 text-base leading-7 text-white/75">{activeMovie.synopsis}</p>
              </div>

              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.28em] text-white/40">Dien vien noi bat</p>
                <div className="flex flex-wrap gap-2">
                  {activeMovie.cast.map((castMember) => (
                    <span key={castMember} className="rounded-full bg-white/5 px-3 py-2 text-sm text-white/80">
                      {castMember}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </article>

        <aside className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.38em] text-red-400/80">Cover picks</p>
              <h2 className="mt-2 text-3xl font-semibold uppercase tracking-[0.08em] text-white">
                Chon trailer
              </h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            {featuredMovies.map((movie, index) => {
              const active = index === activeIndex;

              return (
                <button
                  key={movie.id}
                  onClick={() => showMovie(index)}
                  className={`group relative overflow-hidden rounded-[1.7rem] border p-4 text-left transition duration-300 ${
                    active
                      ? "border-red-400/40 bg-white/8 shadow-[0_18px_60px_rgba(239,68,68,0.18)]"
                      : "border-white/10 bg-white/[0.04] hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]"
                  }`}
                >
                  <div className={`absolute inset-0 bg-linear-to-br ${
                    active ? "from-red-500/22 via-red-400/8 to-transparent" : "from-white/8 to-transparent"
                  }`} />
                  <div className="relative space-y-5">
                    <div className="overflow-hidden rounded-[1.3rem] border border-white/10 bg-black">
                      <div className="relative aspect-[4/5] w-full overflow-hidden bg-black">
                        <Image
                          src={movie.poster}
                          alt={movie.title}
                          fill
                          sizes="(max-width: 1279px) 33vw, 280px"
                          className="object-cover transition duration-500 group-hover:scale-105 group-hover:brightness-110"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black via-black/15 to-transparent" />
                        <div className="relative flex h-full flex-col justify-between p-4">
                          <span className="text-xs uppercase tracking-[0.3em] text-red-200/80">{movie.rating}</span>
                          <div>
                            <p className="text-xs uppercase tracking-[0.34em] text-white/45">{movie.posterLabel}</p>
                            <h3 className="mt-2 text-3xl font-semibold uppercase tracking-[0.08em] text-white">
                              {movie.title}
                            </h3>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-lg font-medium uppercase tracking-[0.06em] text-white">{movie.title}</p>
                      <p className="mt-1 text-sm leading-6 text-white/60">{movie.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </section>
  );
}

"use client";

import { useEffect } from "react";
import type { ShowingMovie } from "@/src/component/user/home-data";

type ModalDetailMovideProps = {
  movie: ShowingMovie | null;
  onClose: () => void;
};

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function ModalDetailMovide({ movie, onClose }: ModalDetailMovideProps) {
  useEffect(() => {
    if (!movie) {
      document.body.style.removeProperty("overflow");
      return;
    }

    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.removeProperty("overflow");
      document.removeEventListener("keydown", handleEscape);
    };
  }, [movie, onClose]);

  if (!movie) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end bg-black/75 p-3 backdrop-blur-md md:items-center md:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`movie-title-${movie.id}`}
    >
      <div
        className="max-h-[92vh] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#090909] shadow-[0_30px_120px_rgba(0,0,0,0.5)] animate-[modal-rise_280ms_ease-out] md:mx-auto md:max-w-6xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grid max-h-[92vh] overflow-y-auto md:grid-cols-[1.25fr_0.85fr]">
          <div className="border-b border-white/10 bg-black md:border-b-0 md:border-r">
            <div className="aspect-video w-full">
              <video
                src={movie.trailerUrl}
                title={`${movie.title} trailer`}
                className="h-full w-full object-cover"
                controls
                autoPlay
                muted
                playsInline
                preload="metadata"
              />
            </div>
          </div>

          <div className="relative flex flex-col gap-6 p-6 md:p-8">
            <button
              onClick={onClose}
              className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Dong modal"
            >
              <CloseIcon />
            </button>

            <div className="space-y-4 pr-14">
              <p className="text-sm uppercase tracking-[0.35em] text-red-400">Now showing</p>
              <h3 id={`movie-title-${movie.id}`} className="text-4xl font-semibold uppercase tracking-[0.08em] text-white">
                {movie.title}
              </h3>
              <p className="text-lg text-white/70">
                {movie.genre} • {movie.year}
              </p>
              <p className="text-base leading-7 text-white/75">{movie.description}</p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <p className="text-sm uppercase tracking-[0.28em] text-white/45">Tom tat noi dung</p>
              <p className="mt-3 text-base leading-7 text-white/78">{movie.synopsis}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-sm uppercase tracking-[0.28em] text-white/45">Suat chieu hom nay</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {movie.showtimes.map((time) => (
                    <span
                      key={time}
                      className="rounded-full border border-red-400/25 bg-red-500/10 px-4 py-2 text-sm text-red-200"
                    >
                      {time}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-sm uppercase tracking-[0.28em] text-white/45">Trai nghiem tai rap</p>
                <ul className="mt-4 space-y-2 text-base text-white/75">
                  <li>Man hinh Laser Projection cuc sang</li>
                  <li>Am thanh vo huong Dolby Atmos</li>
                  <li>Dat ve nhanh va chon ghe theo khu vuc</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

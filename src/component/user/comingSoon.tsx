import Image from "next/image";
import { comingSoonMovies } from "@/src/component/user/home-data";

export default function ComingSoon() {
  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-red-400/80">Soon on screen</p>
          <h2 className="mt-2 text-4xl font-semibold text-white md:text-5xl">Bo phim sap chieu</h2>
        </div>
        <p className="max-w-xl text-right text-base text-white/55">
          Giu nhiet cho lich khoi chieu voi nhung poster mo ao, du de gay to mo nhung van giu su tiet che.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {comingSoonMovies.map((movie, index) => (
          <article
            key={movie.id}
            className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-white/20"
          >
            <Image
              src={movie.poster}
              alt={movie.title}
              fill
              sizes="(max-width: 767px) 100vw, 33vw"
              className="object-cover opacity-30 blur-[2px] transition duration-500 group-hover:scale-105 group-hover:opacity-40"
            />
            <div className={`absolute inset-0 bg-linear-to-br ${movie.accent} blur-2xl transition duration-500 group-hover:scale-110`} />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            <div className="relative space-y-16">
              <div className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.28em] text-white/70">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="space-y-3">
                <h3 className="text-3xl font-semibold uppercase tracking-[0.08em] text-white">
                  {movie.title}
                </h3>
                <p className="text-base text-white/70">{movie.genre}</p>
                <p className="text-sm uppercase tracking-[0.28em] text-red-300">{movie.releaseDate}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

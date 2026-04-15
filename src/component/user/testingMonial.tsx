import { reviews } from "@/src/component/user/home-data";

function Star({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} className="h-5 w-5" aria-hidden="true">
      <path
        d="m12 3.8 2.53 5.12 5.65.82-4.09 3.99.97 5.63L12 16.7l-5.06 2.66.97-5.63-4.09-4 5.65-.81L12 3.8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TestingMonial() {
  return (
    <section className="flex min-h-screen w-full items-center bg-[radial-gradient(circle_at_top,rgba(234,179,8,0.12),transparent_22%),linear-gradient(180deg,#080808_0%,#111111_100%)]">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-6 py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-red-400/80">Audience voices</p>
            <h2 className="mt-2 text-4xl font-semibold uppercase tracking-[0.08em] text-white md:text-5xl">
              Danh gia phim va rap
            </h2>
          </div>

          <p className="max-w-2xl text-base leading-7 text-white/60">
            Khu review giu bo cuc sach, de doc, nhung van co diem nhan qua avatar, sao danh gia va hieu ung nhe
            khi hover.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="group rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-red-500 to-orange-400 text-lg font-semibold text-black">
                  {review.avatar}
                </div>

                <div>
                  <h3 className="text-2xl font-semibold uppercase tracking-[0.06em] text-white">{review.name}</h3>
                  <p className="text-sm uppercase tracking-[0.24em] text-white/45">{review.cinema}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-1 text-yellow-400">
                {Array.from({ length: 5 }, (_, index) => (
                  <div key={index} className="transition duration-200 group-hover:-translate-y-0.5">
                    <Star filled={index < review.rating} />
                  </div>
                ))}
              </div>

              <p className="mt-5 text-lg font-medium uppercase tracking-[0.05em] text-white">{review.movie}</p>
              <p className="mt-3 text-base leading-7 text-white/68">{review.review}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

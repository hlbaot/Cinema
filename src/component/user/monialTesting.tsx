import { feedbackData } from "@/src/data/feedback";

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={`text-sm ${index < rating ? "text-yellow-400" : "text-white/15"}`}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function MonialTesting() {
  return (
    <section className="w-full bg-neutral-950 py-14 sm:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.28em] text-yellow-400 uppercase">Feedback</p>
          <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Khán giả nói gì sau khi xem phim tại CinePro</h2>
          <p className="mt-3 text-sm leading-7 text-slate-400 sm:text-base">
            Một vài phản hồi ngẫu nhiên từ người xem về phim và trải nghiệm đặt vé trên hệ thống.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {feedbackData.map((item) => (
            <article
              key={item.id}
              className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-sm"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{item.name}</h3>
                  <p className="text-xs tracking-[0.18em] text-slate-500 uppercase">{item.location}</p>
                </div>
                <StarRow rating={item.rating} />
              </div>

              <div className="mb-4 inline-flex rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-300">
                {item.movieTitle}
              </div>

              <p className="text-sm leading-7 text-slate-300">{item.comment}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

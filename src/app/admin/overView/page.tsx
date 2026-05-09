import { overviewStats, weeklyRevenue } from "@/src/app/admin/overView/dataOverview";

function RevenueIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
      <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 16V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 16V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 16v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
      <path
        d="M3 9a2.5 2.5 0 0 1 2.5-2.5h13A2.5 2.5 0 0 1 21 9v1.25a1.75 1.75 0 0 0 0 3.5V15a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 15v-1.25a1.75 1.75 0 0 0 0-3.5V9Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M12 8.5v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 2" />
    </svg>
  );
}

function StatIcon({ icon }: { icon: "revenue" | "ticket" }) {
  if (icon === "ticket") {
    return <TicketIcon />;
  }

  return <RevenueIcon />;
}

export default function AdminOverviewPage() {
  const maxRevenue = Math.max(...weeklyRevenue.map((item) => item.revenue));

  return (
    <section className="space-y-8 text-white">
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#05070d] shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
        <div className="border-b border-white/10 px-8 py-10">
          <h1 className="text-4xl font-black tracking-tight text-white">Tổng quan</h1>
          <div className="mt-4 flex items-center gap-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-violet-400">Tổng quan</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {overviewStats.map((stat) => (
          <article
            key={stat.title}
            className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br ${stat.colorClass} p-8 shadow-[0_18px_40px_rgba(0,0,0,0.25)]`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.24),transparent_34%)]" />
            <div className="relative flex items-center justify-between gap-6">
              <div>
                <p className="text-lg font-medium text-white/75">{stat.title}</p>
                <p className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">{stat.value}</p>
                <p className="mt-6 flex items-center gap-2 text-lg font-semibold text-emerald-300">
                  <span>↗</span>
                  <span>{stat.changeValue}</span>
                  <span className="text-emerald-200/85">{stat.changeLabel}</span>
                </p>
              </div>

              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[1.7rem] bg-white/18 text-white backdrop-blur-md">
                <StatIcon icon={stat.icon} />
              </div>
            </div>
          </article>
        ))}
      </div>

      <article className="rounded-[2rem] border border-[#29324a] bg-[#0b1019] p-8 shadow-[0_16px_48px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-white">Doanh thu 7 ngày qua</h2>
            <p className="mt-2 text-sm text-slate-400">Theo dõi biến động doanh thu theo từng ngày trong tuần.</p>
          </div>
          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
            Tổng tuần: 2.547.890.000 đ
          </div>
        </div>

        <div className="mt-10 grid h-[28rem] grid-cols-7 items-end gap-4 rounded-[1.6rem] border border-white/5 bg-[#090e17] px-6 pb-8 pt-10">
          {weeklyRevenue.map((item) => {
            const height = Math.max((item.revenue / maxRevenue) * 100, 22);

            return (
              <div key={item.day} className="flex h-full flex-col items-center justify-end gap-4">
                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Doanh thu</p>
                  <p className="mt-2 text-sm font-bold text-white/90">
                    {(item.revenue / 1_000_000).toFixed(0)}M
                  </p>
                </div>
                <div className="relative flex h-full w-full items-end justify-center">
                  <div className="absolute inset-x-0 bottom-0 top-0 rounded-full bg-white/[0.03]" />
                  <div
                    className="relative w-full max-w-[4.5rem] rounded-[1.4rem] bg-gradient-to-t from-violet-600 via-fuchsia-500 to-cyan-400 shadow-[0_12px_30px_rgba(87,76,255,0.35)]"
                    style={{ height: `${height}%` }}
                  />
                </div>
                <p className="text-2xl font-medium text-slate-400">{item.day}</p>
              </div>
            );
          })}
        </div>
      </article>
    </section>
  );
}

import { overviewStats, weeklyRevenue } from "@/src/app/admin/overView/dataOverview";

function RevenueIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 16V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 16V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 16v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
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
    <section className="box-border grid min-h-screen grid-rows-[auto_auto_minmax(0,1fr)] gap-3 overflow-visible px-3 pb-3 pt-0 text-white md:h-full md:min-h-0 md:overflow-hidden md:px-4 md:pb-4">
      <div className="rounded-2xl border border-white/10 bg-[#05070d] px-4 py-2.5 shadow-[0_12px_36px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-black tracking-tight text-white md:text-3xl">Tổng quan</h1>
            <div className="mt-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-violet-400">Tổng quan</span>
            </div>
          </div>
          <div className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-semibold text-violet-200">
            Cập nhật hôm nay
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {overviewStats.map((stat) => (
          <article
            key={stat.title}
            className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-linear-to-br ${stat.colorClass} p-8 shadow-[0_18px_40px_rgba(0,0,0,0.25)]`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_34%)]" />
            <div className="relative flex min-w-0 items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white/75">{stat.title}</p>
                <p className="mt-1 break-words text-xl font-black tracking-tight text-white sm:text-2xl lg:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-1 text-xs font-semibold text-emerald-200 lg:text-sm">
                  <span>↗</span>
                  <span>{stat.changeValue}</span>
                  <span className="hidden text-emerald-100/85 sm:inline">{stat.changeLabel}</span>
                </p>
              </div>

              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/18 text-white backdrop-blur-md sm:flex">
                <StatIcon icon={stat.icon} />
              </div>
            </div>
          </article>
        ))}
      </div>

      <article className="min-h-0 rounded-2xl border border-[#29324a] bg-[#0b1019] p-3 shadow-[0_12px_36px_rgba(0,0,0,0.24)] md:p-4">
        <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="truncate text-xl font-black tracking-tight text-white md:text-2xl">Doanh thu 7 ngày qua</h2>
              <p className="hidden text-sm text-slate-400 sm:block">Theo dõi biến động doanh thu theo từng ngày trong tuần.</p>
            </div>
            <div className="w-fit rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
              Tổng tuần: 2.547.890.000 đ
            </div>
          </div>

          <div className="grid min-h-0 grid-cols-7 items-end gap-2 rounded-2xl border border-white/5 bg-[#090e17] px-2 pb-2 pt-3 sm:px-4">
            {weeklyRevenue.map((item) => {
              const height = Math.max((item.revenue / maxRevenue) * 100, 22);

              return (
                <div key={item.day} className="flex h-full min-w-0 flex-col items-center justify-end gap-2">
                  <div className="hidden text-center lg:block">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Doanh thu</p>
                    <p className="mt-1 text-xs font-bold text-white/90">{(item.revenue / 1_000_000).toFixed(0)}M</p>
                  </div>
                  <div className="relative flex min-h-0 w-full flex-1 items-end justify-center">
                    <div className="absolute inset-x-1 bottom-0 top-0 rounded-full bg-white/[0.03]" />
                    <div
                      className="relative w-full max-w-10 rounded-2xl bg-gradient-to-t from-violet-600 via-fuchsia-500 to-cyan-400 shadow-[0_10px_24px_rgba(87,76,255,0.3)]"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <p className="text-sm font-medium text-slate-400 md:text-base">{item.day}</p>
                </div>
              );
            })}
          </div>
        </div>
      </article>
    </section>
  );
}

export type OverviewStat = {
  changeLabel: string;
  changeValue: string;
  colorClass: string;
  icon: "revenue" | "ticket";
  title: string;
  value: string;
};

export type RevenuePoint = {
  day: string;
  revenue: number;
};

export const overviewStats: OverviewStat[] = [
  {
    title: "Tổng doanh thu",
    value: "2.547.890.000 đ",
    changeValue: "+8.3%",
    changeLabel: "so với tuần trước",
    colorClass: "from-fuchsia-600 via-purple-600 to-violet-500",
    icon: "revenue",
  },
  {
    title: "Vé đã bán",
    value: "15.234",
    changeValue: "+5.1%",
    changeLabel: "so với tuần trước",
    colorClass: "from-blue-600 via-indigo-600 to-cyan-500",
    icon: "ticket",
  },
];

export const weeklyRevenue: RevenuePoint[] = [
  { day: "T2", revenue: 280_000_000 },
  { day: "T3", revenue: 315_000_000 },
  { day: "T4", revenue: 362_000_000 },
  { day: "T5", revenue: 338_000_000 },
  { day: "T6", revenue: 420_000_000 },
  { day: "T7", revenue: 468_000_000 },
  { day: "CN", revenue: 364_890_000 },
];

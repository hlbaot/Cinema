"use client";

import Cookies from "js-cookie";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type AdminLink = {
  href: string;
  label: string;
  badge?: string;
  icon: React.ReactNode;
};

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <rect width="7" height="9" x="3" y="3" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect width="7" height="5" x="14" y="3" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect width="7" height="9" x="14" y="12" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect width="7" height="5" x="3" y="16" rx="1" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function FilmIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <rect width="18" height="18" x="3" y="3" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M7 3v18M17 3v18M3 7.5h4M17 7.5h4M3 12h18M3 16.5h4M17 16.5h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DoorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 21h18M10 12h4M14 21v-3a2 2 0 0 0-4 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect width="18" height="18" x="3" y="4" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" stroke="currentColor" strokeWidth="2" />
      <path d="M13 5v2M13 11v2M13 17v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function StaffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M3 20a6 6 0 0 1 12 0M13.5 20a4.5 4.5 0 0 1 7.5-3.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const adminLinks: AdminLink[] = [
  { href: "/admin/overView", label: "Tổng quan", icon: <DashboardIcon /> },
  { href: "/admin/qlyPhim", label: "Quản lý phim", icon: <FilmIcon /> },
  { href: "/admin/qlyPhong", label: "Quản lý phòng", icon: <DoorIcon /> },
  { href: "/admin/qlySchedule", label: "Quản lý lịch chiếu", icon: <CalendarIcon /> },
  { href: "/admin/qlyUser", label: "Quản lý người dùng", icon: <UserIcon /> },
  { href: "/admin/qlyCorn", label: "Quản lý bắp nước", icon: <TicketIcon />, badge: "2" },
  { href: "/admin/qlyNhanVien", label: "Quản lý nhân viên", icon: <StaffIcon /> },
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    Cookies.remove("ROLE");
    Cookies.remove("USER_NAME");
    Cookies.remove("USER_POINTS");
    Cookies.remove("MEMBERSHIP_LEVEL");
    router.push("/auth/signin");
    router.refresh();
  }

  return (
    <aside className="-translate-x-full fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-800 bg-gray-900/50 backdrop-blur transition-all duration-300 md:sticky md:top-0 md:h-screen md:w-64 md:translate-x-0">
      <div className="border-b border-gray-800 p-4">
        <Link href="/admin/overView" className="flex cursor-pointer items-center justify-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-xl font-bold">
            <span aria-hidden="true">🎬</span>
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-lg font-bold text-transparent">
              CINEPRO
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Admin Portal</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        {adminLinks.map((link) => {
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`group flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all duration-200 ${
                active
                  ? "border-purple-500/30 bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-400 shadow-lg shadow-purple-500/5"
                  : "border-transparent text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span
                className={`text-xl transition-transform group-hover:scale-110 ${
                  active ? "text-purple-400" : "text-gray-500"
                }`}
              >
                {link.icon}
              </span>
              <span className="font-medium">{link.label}</span>
              {link.badge ? (
                <span className="ml-auto rounded-full bg-yellow-500 px-1.5 py-0.5 text-[10px] font-black text-black">
                  {link.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-gray-800 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 transition-all duration-200 hover:border-red-400/30 hover:bg-red-500/15 hover:text-white"
        >
          <span className="text-lg text-red-300">
            <LogoutIcon />
          </span>
          <span className="font-medium">Đăng xuất</span>
        </button>
        <button className="hidden w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gray-800/50 px-3 py-2 text-gray-400 transition-all hover:bg-gray-800 hover:text-white md:flex">
          <div className="rotate-180 transition-transform duration-300">
            <ChevronRightIcon />
          </div>
          <span className="text-xs font-medium">Thu gọn</span>
        </button>
      </div>
    </aside>
  );
}

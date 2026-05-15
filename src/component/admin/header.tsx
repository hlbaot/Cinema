"use client";

import { clearAuthCookies, goToUserHome } from "@/src/lib/auth-client";

function LogoutIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  );
}

export default function AdminHeader() {
  function handleLogout() {
    clearAuthCookies();
    goToUserHome();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800 bg-[#0b0b14]/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[73px] max-w-7xl px-4 py-3 md:items-center md:py-0">
        <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-4">
            <span className="text-sm text-zinc-400">📍 CINEPRO Landmark 81</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button className="relative flex min-h-9 items-center gap-2 rounded-lg border border-orange-500/30 bg-orange-500/20 px-3 py-1.5 text-orange-400 transition-colors hover:bg-orange-500/30">
              <span className="animate-pulse" aria-hidden="true">
                🔔
              </span>
              <span className="text-sm font-medium">2 vé chờ duyệt</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
                <span className="text-sm font-semibold text-white">NV</span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium leading-tight text-white">Nhân viên A</p>
                <p className="text-xs leading-tight text-zinc-500">Ca sáng • 06:00 - 14:00</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 text-zinc-400 transition-colors hover:text-red-500"
              title="Đăng xuất"
              aria-label="Đăng xuất"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

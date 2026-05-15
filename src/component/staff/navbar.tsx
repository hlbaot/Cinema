"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clearAuthCookies, goToUserHome } from "@/src/lib/auth-client";
import { cn } from "@/src/lib/utils";

const staffLinks = [
  { href: "/staff/checkVe", label: "Check vé" },
  { href: "/staff/qlyVe", label: "Quản lý bán vé" },
  { href: "/staff/qlyBapNuoc", label: "Quản lý bán nước" },
];

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function StaffNavbar() {
  const pathname = usePathname();

  function handleLogout() {
    clearAuthCookies();
    goToUserHome();
  }

  return (
    <aside className="min-h-screen w-72 shrink-0 border-r border-zinc-800/80 bg-zinc-900/90 px-5 py-6 backdrop-blur-sm">
      <div className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/90">Rạp</div>
      <div className="mb-6 text-xl font-bold tracking-tight text-white">Nhân viên</div>
      <nav className="flex flex-col gap-1.5">
        {staffLinks.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-xl px-4 py-3 text-sm font-semibold transition",
                active
                  ? "border border-emerald-500/35 bg-emerald-500/15 text-emerald-300 shadow-[0_0_24px_-8px_rgba(16,185,129,0.45)]"
                  : "text-zinc-400 hover:bg-zinc-800/80 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8 border-t border-zinc-800 pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl border border-red-500/25 bg-red-950/40 px-4 py-3 text-sm font-semibold text-red-300 transition hover:border-red-500/40 hover:bg-red-950/70 hover:text-red-200"
        >
          <LogoutIcon />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}

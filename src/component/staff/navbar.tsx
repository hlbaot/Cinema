"use client";

import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";

const staffLinks = [
  { href: "/staff/checkVe", label: "Check ve" },
  { href: "/staff/qlyVe", label: "Quan ly ve" },
  { href: "/staff/qlyBapNuoc", label: "Quan ly bap nuoc" },
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
    <aside className="min-h-screen w-72 border-r border-emerald-200 bg-emerald-50 px-5 py-6">
      <div className="mb-6 text-xl font-semibold text-emerald-950">Staff Panel</div>
      <nav className="flex flex-col gap-2">
        {staffLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl px-4 py-3 text-sm font-medium text-emerald-800 transition hover:bg-emerald-600 hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6 border-t border-emerald-200 pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-100 hover:text-red-700"
        >
          <LogoutIcon />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}

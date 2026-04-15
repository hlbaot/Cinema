"use client";

import Cookies from "js-cookie";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { HeaderUser, MembershipLevel } from "@/src/lib/auth";

const navItems = [
  { href: "/trangChu", label: "Trang chu" },
  { href: "/phim", label: "Phim" },
  { href: "/lichChieu", label: "Lich chieu" },
];

function FilmIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M7 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 7.5h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 7.5h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 16.5h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 16.5h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 7a7 7 0 0 1 14 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TicketIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5v2.25a1.75 1.75 0 0 0 0 2.5v2.25A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5v-2.25a1.75 1.75 0 0 0 0-2.5V8.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M9 9.5h6M9 14.5h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 15.25A3.25 3.25 0 1 0 12 8.75a3.25 3.25 0 0 0 0 6.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m19.4 15.1-.74 1.28a1 1 0 0 1-1.2.43l-1.14-.46a6.9 6.9 0 0 1-1.23.71l-.17 1.21a1 1 0 0 1-.99.86h-1.48a1 1 0 0 1-.99-.86l-.17-1.2a6.89 6.89 0 0 1-1.24-.72l-1.13.46a1 1 0 0 1-1.2-.43L4.6 15.1a1 1 0 0 1 .2-1.25l.96-.75a7.4 7.4 0 0 1 0-1.42l-.96-.75a1 1 0 0 1-.2-1.25l.74-1.28a1 1 0 0 1 1.2-.43l1.13.46c.39-.3.8-.53 1.24-.72l.17-1.2a1 1 0 0 1 .99-.86h1.48a1 1 0 0 1 .99.86l.17 1.2c.44.19.85.42 1.23.72l1.14-.46a1 1 0 0 1 1.2.43l.74 1.28a1 1 0 0 1-.2 1.25l-.96.75c.04.23.06.47.06.71 0 .24-.02.48-.06.71l.96.75a1 1 0 0 1 .2 1.25Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LogOutIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M10 17 15 12 10 7M15 12H4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function getMembershipColor(level: MembershipLevel) {
  switch (level) {
    case "Platinum":
      return "from-cyan-200 via-sky-300 to-indigo-300";
    case "Gold":
      return "from-yellow-300 via-amber-400 to-orange-400";
    case "Silver":
      return "from-slate-200 via-slate-300 to-slate-400";
    default:
      return "from-lime-300 via-emerald-300 to-green-400";
  }
}

type UserHeaderProps = {
  user: HeaderUser | null;
};

export default function UserHeader({ user: initialUser }: UserHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userOverride, setUserOverride] = useState<HeaderUser | null | undefined>(undefined);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const user = userOverride === undefined ? initialUser : userOverride;

  function handleNavigate(href: string) {
    router.push(href);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }

  function handleLogout() {
    Cookies.remove("ROLE");
    Cookies.remove("USER_NAME");
    Cookies.remove("USER_POINTS");
    Cookies.remove("MEMBERSHIP_LEVEL");
    setUserOverride(null);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    router.push("/trangChu");
    router.refresh();
  }

  const isLoggedIn = Boolean(user);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          <button onClick={() => handleNavigate("/trangChu")} className="group flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-red-600 to-red-700 transition-transform group-hover:scale-105">
              <FilmIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold lg:text-2xl">
              <span className="text-red-500">CINE</span>
              <span className="text-white">PRO</span>
            </span>
          </button>

          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-yellow-400 ${
                    active ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            {isLoggedIn && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full px-2 py-1.5 transition-all hover:bg-white/10"
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br ${getMembershipColor(
                      user.membershipLevel,
                    )} text-sm font-bold text-black`}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="hidden text-left md:block">
                    <p className="text-sm font-medium leading-tight text-white">{user.name}</p>
                    <p className="text-xs text-yellow-500">
                      {user.membershipLevel} • {user.points.toLocaleString("vi-VN")} diem
                    </p>
                  </div>

                  <ChevronDownIcon
                    className={`h-4 w-4 text-gray-400 transition-transform ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="animate-fade-in absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-gray-800 bg-gray-900 shadow-2xl">
                    <div className="border-b border-gray-800 bg-linear-to-br from-gray-800 to-gray-900 p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br ${getMembershipColor(
                            user.membershipLevel,
                          )} text-lg font-bold text-black`}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{user.name}</p>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full bg-linear-to-r ${getMembershipColor(
                                user.membershipLevel,
                              )} px-2 py-0.5 text-xs font-medium text-black`}
                            >
                              {user.membershipLevel}
                            </span>
                            <span className="text-xs text-gray-400">
                              {user.points.toLocaleString("vi-VN")} diem
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="mb-1 flex justify-between text-xs text-gray-400">
                          <span>Diem tich luy</span>
                          <span>{user.points.toLocaleString("vi-VN")} / 5,000</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-gray-700">
                          <div
                            className="h-full rounded-full bg-linear-to-r from-yellow-500 to-amber-500"
                            style={{ width: `${Math.min((user.points / 5000) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={() => handleNavigate("/trangChu")}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                      >
                        <UserIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-white">Tai khoan cua toi</p>
                          <p className="text-xs text-gray-500">Thong tin ca nhan</p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleNavigate("/lichChieu")}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                      >
                        <TicketIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-white">Ve cua toi</p>
                          <p className="text-xs text-gray-500">Lich su dat ve</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setUserMenuOpen(false)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                      >
                        <SettingsIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-white">Cai dat</p>
                          <p className="text-xs text-gray-500">Tuy chon tai khoan</p>
                        </div>
                      </button>
                    </div>

                    <div className="border-t border-gray-800 p-2">
                      <button
                        onClick={handleLogout}
                        className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-red-500/10"
                      >
                        <LogOutIcon className="h-5 w-5 text-gray-400 group-hover:text-red-500" />
                        <span className="text-sm text-gray-400 group-hover:text-red-500">Dang xuat</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNavigate("/auth/signin")}
                className="group flex items-center gap-2 rounded-full bg-linear-to-r from-yellow-500 to-amber-600 px-4 py-2 transition-all hover:from-yellow-400 hover:to-amber-500"
              >
                <UserIcon className="h-4 w-4 text-black" />
                <span className="hidden text-sm font-medium text-black sm:inline">Dang nhap</span>
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 text-gray-400 hover:text-white lg:hidden"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="animate-fade-in border-t border-white/10 py-4 lg:hidden">
            {isLoggedIn && user && (
              <div className="mb-3 rounded-xl bg-linear-to-br from-gray-800/50 to-gray-900/50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br ${getMembershipColor(
                      user.membershipLevel,
                    )} text-lg font-bold text-black`}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{user.name}</p>
                    <p className="text-sm text-yellow-500">
                      {user.membershipLevel} • {user.points.toLocaleString("vi-VN")} diem
                    </p>
                  </div>
                </div>
              </div>
            )}

            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const active = pathname === item.href;

                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavigate(item.href)}
                    className={`rounded-lg px-4 py-3 text-left transition-colors ${
                      active ? "bg-yellow-500/10 text-yellow-400" : "text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}

              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => handleNavigate("/trangChu")}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-left text-gray-300 hover:bg-white/5"
                  >
                    <UserIcon className="h-5 w-5" />
                    Tai khoan
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-left text-red-500 hover:bg-red-500/10"
                  >
                    <LogOutIcon className="h-5 w-5" />
                    Dang xuat
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleNavigate("/auth/signin")}
                  className="mx-4 mt-2 rounded-lg bg-linear-to-r from-yellow-500 to-amber-600 py-3 text-center font-semibold text-black"
                >
                  Dang nhap / Dang ky
                </button>
              )}
            </nav>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </header>
  );
}

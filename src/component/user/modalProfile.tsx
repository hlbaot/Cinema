"use client";

import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import type { MembershipLevel } from "@/src/lib/auth-shared";
import { clearAuthCookies, goToUserHome } from "@/src/lib/auth-client";

type UserProfile = {
  id: string;
  email: string;
  name: string;
  role: string;
  membershipLevel: MembershipLevel;
  points: number;
  provider: string;
};

type ModalProfileProps = {
  open: boolean;
  onClose: () => void;
};

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

function getMembershipBadgeColor(level: MembershipLevel) {
  switch (level) {
    case "Platinum":
      return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
    case "Gold":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "Silver":
      return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    default:
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  }
}

function getNextLevel(level: MembershipLevel): { next: string; pointsNeeded: number } {
  switch (level) {
    case "Member":
      return { next: "Silver", pointsNeeded: 2000 };
    case "Silver":
      return { next: "Gold", pointsNeeded: 5000 };
    case "Gold":
      return { next: "Platinum", pointsNeeded: 10000 };
    case "Platinum":
      return { next: "Max", pointsNeeded: 10000 };
  }
}

function getUserFromCookies(): UserProfile | null {
  const accessToken = Cookies.get("ACCESS_TOKEN");
  const role = Cookies.get("ROLE");

  if (!accessToken || !role || role !== "user") {
    return null;
  }

  const membershipValue = Cookies.get("MEMBERSHIP_LEVEL") as MembershipLevel | undefined;
  const membershipLevel: MembershipLevel =
    membershipValue === "Silver" || membershipValue === "Gold" || membershipValue === "Platinum"
      ? membershipValue
      : "Member";

  const points = Number(Cookies.get("USER_POINTS") ?? "1250");

  return {
    id: Cookies.get("USER_ID") || "",
    email: Cookies.get("USER_EMAIL") || "",
    name: Cookies.get("USER_NAME") || "Khách hàng",
    role,
    membershipLevel,
    points: Number.isFinite(points) ? points : 1250,
    provider: Cookies.get("AUTH_PROVIDER") || "credentials",
  };
}

export default function ModalProfile({ open, onClose }: ModalProfileProps) {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (open) {
      const timer = window.setTimeout(() => {
        setUser(getUserFromCookies());
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [open]);

  function handleLogout() {
    clearAuthCookies();
    onClose();
    goToUserHome();
  }

  if (!open) return null;

  const nextLevelInfo = user ? getNextLevel(user.membershipLevel) : null;
  const progressPercent = user && nextLevelInfo
    ? Math.min((user.points / nextLevelInfo.pointsNeeded) * 100, 100)
    : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md animate-[modalSlideUp_0.35s_ease-out] rounded-2xl border border-white/10 bg-gray-900/95 shadow-[0_30px_100px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-gray-400 transition-all hover:bg-white/10 hover:text-white"
          aria-label="Đóng"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {!user ? (
          /* Not logged in state */
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-800">
              <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10 text-gray-500" aria-hidden="true">
                <path
                  d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 7a7 7 0 0 1 14 0"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold text-white">Chưa đăng nhập</h3>
            <p className="mb-6 text-sm text-gray-400">Vui lòng đăng nhập để xem thông tin tài khoản</p>
            <button
              onClick={onClose}
              className="rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 px-6 py-3 font-bold text-black transition-all hover:scale-[1.02]"
            >
              Đóng
            </button>
          </div>
        ) : (
          <>
            {/* Profile Header - Gradient bg */}
            <div className="relative overflow-hidden rounded-t-2xl p-6 pb-8">
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${getMembershipColor(user.membershipLevel)} opacity-[0.08]`} />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/95" />

              <div className="relative flex items-start gap-4">
                {/* Avatar */}
                <div
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${getMembershipColor(
                    user.membershipLevel,
                  )} text-2xl font-bold text-black shadow-lg`}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-bold text-white">{user.name}</h3>
                  <p className="mt-0.5 truncate text-sm text-gray-400">{user.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getMembershipBadgeColor(
                        user.membershipLevel,
                      )}`}
                    >
                      {user.membershipLevel}
                    </span>
                    {user.provider === "google" && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400">
                        <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden="true">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09a7.12 7.12 0 0 1 0-4.17V7.07H2.18A11.96 11.96 0 0 0 0 12c0 1.94.46 3.77 1.28 5.4l3.56-2.77.01-.54Z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.19 14.97 0 12 0 7.7 0 3.99 2.47 2.18 6.07l3.66 2.84c.87-2.6 3.3-4.16 6.16-4.16Z"
                            fill="#EA4335"
                          />
                        </svg>
                        Google
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Points Section */}
            <div className="px-6 pb-4">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-400">Điểm tích lũy</span>
                  <span className="text-lg font-bold text-yellow-500">
                    {user.points.toLocaleString("vi-VN")}
                  </span>
                </div>
                <div className="mb-2 h-2 overflow-hidden rounded-full bg-gray-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {nextLevelInfo && user.membershipLevel !== "Platinum" && (
                  <p className="text-xs text-gray-500">
                    Cần thêm{" "}
                    <span className="font-medium text-gray-300">
                      {(nextLevelInfo.pointsNeeded - user.points).toLocaleString("vi-VN")}
                    </span>{" "}
                    điểm để lên{" "}
                    <span className="font-medium text-yellow-500">{nextLevelInfo.next}</span>
                  </p>
                )}
                {user.membershipLevel === "Platinum" && (
                  <p className="text-xs text-emerald-400">✨ Bạn đã đạt hạng cao nhất!</p>
                )}
              </div>
            </div>

            {/* Info Details */}
            <div className="px-6 pb-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-4 py-3">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0 text-gray-500" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
                    <path d="m3 7 9 5 9-5" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="truncate text-sm text-white">{user.email || "Chưa cập nhật"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-4 py-3">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0 text-gray-500" aria-hidden="true">
                    <path
                      d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 7a7 7 0 0 1 14 0"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500">ID tài khoản</p>
                    <p className="truncate font-mono text-sm text-white">{user.id || "—"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-4 py-3">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0 text-gray-500" aria-hidden="true">
                    <path
                      d="M12 22s-8-4.5-8-11V5l8-3 8 3v6c0 6.5-8 11-8 11Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500">Phương thức đăng nhập</p>
                    <p className="text-sm text-white">
                      {user.provider === "google" ? "Google" : "Email / Mật khẩu"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-white/5 px-6 py-4">
              <button
                onClick={handleLogout}
                className="group flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 py-3 text-sm font-semibold text-red-400 transition-all hover:border-red-500/30 hover:bg-red-500/10"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
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
                Đăng xuất
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

"use client";

import axios from "axios";
import Cookies from "js-cookie";
import {
  BadgeCheck,
  CalendarClock,
  CircleUserRound,
  IdCard,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  Ticket,
  WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@/src/interface/user";
import { goToUserHome, logoutAndClearAuth, normalizeRole, saveUserCookies } from "@/src/lib/auth-client";
import { getUserFromAuthResponse } from "@/src/lib/auth-user";
import type { MembershipLevel } from "@/src/lib/auth-shared";

type ProfileUser = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  provider: string;
  membershipLevel: MembershipLevel;
  points: number;
};

const levelTargets: Record<MembershipLevel, { next: string; target: number }> = {
  Member: { next: "Silver", target: 2000 },
  Silver: { next: "Gold", target: 5000 },
  Gold: { next: "Platinum", target: 10000 },
  Platinum: { next: "Platinum", target: 10000 },
};

function getMembershipLevel(value?: string): MembershipLevel {
  return value === "Silver" || value === "Gold" || value === "Platinum" ? value : "Member";
}

function getUserFromCookies(): ProfileUser | null {
  const role = normalizeRole(Cookies.get("ROLE") ?? Cookies.get("USER_ROLE"));

  const points = Number(Cookies.get("USER_POINTS") ?? "0");

  return {
    id: Cookies.get("USER_ID") || "",
    email: Cookies.get("USER_EMAIL") || "",
    full_name: Cookies.get("USER_NAME") || "Khách hàng",
    role,
    status: Cookies.get("USER_STATUS") || "ACTIVE",
    provider: Cookies.get("AUTH_PROVIDER") || "credentials",
    membershipLevel: getMembershipLevel(Cookies.get("MEMBERSHIP_LEVEL")),
    points: Number.isFinite(points) ? points : 0,
  };
}

function getUserFromResponse(payload: unknown): User | null {
  const user = getUserFromAuthResponse(payload);
  if (user) return user;

  console.log("[profile] unable to parse user", {
    payloadType: typeof payload,
    rootKeys: payload && typeof payload === "object" ? Object.keys(payload) : [],
    dataKeys:
      payload && typeof payload === "object" && "data" in payload && payload.data && typeof payload.data === "object"
        ? Object.keys(payload.data)
        : [],
  });

  return null;
}

async function fetchCurrentUser() {
  return axios.get("/api/auth/me", {
    withCredentials: true,
  });
}

function mapUser(user: User): ProfileUser {
  const points = Number(Cookies.get("USER_POINTS") ?? "0");

  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: normalizeRole(user.role),
    status: user.status || "ACTIVE",
    provider: Cookies.get("AUTH_PROVIDER") || "credentials",
    membershipLevel: getMembershipLevel(Cookies.get("MEMBERSHIP_LEVEL")),
    points: Number.isFinite(points) ? points : 0,
  };
}

function statLabel(value: string) {
  return value === "credentials" ? "Email / Mật khẩu" : "Google";
}

export default function ProfilePage() {
  const [user, setUser] = useState<ProfileUser | null>(() => getUserFromCookies());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const response = await fetchCurrentUser();
        console.log("[profile] /api/auth/me response", {
          status: response.status,
          rootKeys: response.data && typeof response.data === "object" ? Object.keys(response.data) : [],
          dataKeys:
            response.data && typeof response.data === "object" && "data" in response.data && response.data.data && typeof response.data.data === "object"
              ? Object.keys(response.data.data)
              : [],
        });
        const apiUser = getUserFromResponse(response.data);

        if (!mounted) return;

        if (!apiUser) {
          setError("Không đọc được thông tin tài khoản.");
          return;
        }

        saveUserCookies(apiUser, Cookies.get("AUTH_PROVIDER") === "google" ? "google" : "credentials");
        setUser(mapUser(apiUser));
        setError(null);
      } catch {
        if (mounted) {
          setError("Không thể tải hồ sơ. Vui lòng đăng nhập lại nếu phiên đã hết hạn.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const levelInfo = useMemo(() => {
    const current = user?.membershipLevel ?? "Member";
    const info = levelTargets[current];
    const progress = user ? Math.min((user.points / info.target) * 100, 100) : 0;

    return { ...info, progress };
  }, [user]);

  async function handleLogout() {
    await logoutAndClearAuth();
    goToUserHome();
  }

  return (
    <div className="min-h-screen bg-neutral-950 px-4 pb-16 pt-24 text-white sm:px-6 lg:px-8 lg:pt-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-yellow-500">Tài khoản</p>
            <h1 className="text-3xl font-black sm:text-4xl">Hồ sơ cá nhân</h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 transition hover:border-red-400/40 hover:bg-red-500/15"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>

        {error ? (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70">
            <div className="relative p-6 sm:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(234,179,8,0.18),transparent_32rem)]" />
              <div className="relative">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-yellow-300 via-amber-400 to-red-500 text-3xl font-black text-black">
                    {(user?.full_name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-2xl font-bold">{user?.full_name || "Khách hàng"}</h2>
                    <p className="mt-1 truncate text-sm text-zinc-400">{user?.email || "Chưa có email"}</p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-bold text-yellow-300">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      {user?.membershipLevel || "Member"}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Điểm tích lũy</span>
                    <span className="text-xl font-black text-yellow-400">
                      {(user?.points ?? 0).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-yellow-400 to-red-500 transition-all duration-700"
                      style={{ width: `${levelInfo.progress}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs text-zinc-500">
                    {user?.membershipLevel === "Platinum"
                      ? "Bạn đang ở hạng thành viên cao nhất."
                      : `Cần ${Math.max(levelInfo.target - (user?.points ?? 0), 0).toLocaleString("vi-VN")} điểm để lên ${levelInfo.next}.`}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Thông tin tài khoản</h2>
              {loading ? <span className="text-xs text-zinc-500">Đang cập nhật...</span> : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoItem icon={CircleUserRound} label="Họ tên" value={user?.full_name || "Chưa cập nhật"} />
              <InfoItem icon={Mail} label="Email" value={user?.email || "Chưa cập nhật"} />
              <InfoItem icon={IdCard} label="ID tài khoản" value={user?.id || "Chưa có"} mono />
              <InfoItem icon={ShieldCheck} label="Trạng thái" value={user?.status || "ACTIVE"} />
              <InfoItem icon={WalletCards} label="Phương thức" value={statLabel(user?.provider || "credentials")} />
              <InfoItem icon={Sparkles} label="Vai trò" value="Khách hàng" />
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-white/10 bg-zinc-900/70 p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Hoạt động gần đây</h2>
            <span className="text-xs text-zinc-500">CinePro</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <ActionTile
              icon={Ticket}
              title="Vé của tôi"
              description="Xem lịch sử đặt vé và các suất chiếu sắp tới."
              href="/ve-cua-toi"
            />
            <ActionTile
              icon={CalendarClock}
              title="Lịch chiếu"
              description="Tìm suất chiếu mới và đặt vé nhanh."
              href="/lichChieu"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: typeof CircleUserRound;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-4">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
      <div className="min-w-0">
        <p className="text-xs text-zinc-500">{label}</p>
        <p className={`mt-1 truncate text-sm text-white ${mono ? "font-mono" : "font-medium"}`}>{value}</p>
      </div>
    </div>
  );
}

function ActionTile({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: typeof Ticket;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.03] p-4 transition hover:border-yellow-400/30 hover:bg-yellow-400/5"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-white group-hover:text-yellow-300">{title}</p>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>
    </a>
  );
}

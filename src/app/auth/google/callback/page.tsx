"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { API_GoogleCallback } from "@/src/api/API_Auth";
import { saveLoginCookies, saveUserCookies, normalizeRole } from "@/src/lib/auth-client";
import { getUserFromAuthResponse } from "@/src/lib/auth-user";
import { getRoleHomePath } from "@/src/lib/auth-shared";
import type { User } from "@/src/interface/user";

/**
 * Google OAuth Callback Page
 *
 * Flow:
 *  1. Backend redirects here after Google consent with `?provider=google&status=success`
 *  2. Backend has already set auth cookies
 *  3. We call `/api/v1/users/me` with credentials to get the logged-in user
 *  4. Save user display/role cookies and redirect to the role home page
 */

function getUserFromMeResponse(payload: unknown): User | null {
  const user = getUserFromAuthResponse(payload);
  if (user) return user;

  console.log("[google-callback] unable to parse user", {
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

function GoogleCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    async function handleCallback() {
      try {
        const provider = searchParams.get("provider");
        const status = searchParams.get("status");

        // Current backend flow: OAuth success is confirmed by query params,
        // while the auth session itself is stored in backend cookies.
        if (provider === "google" && status === "success") {
          const response = await fetchCurrentUser();
          console.log("[google-callback] /api/auth/me response", {
            status: response.status,
            rootKeys: response.data && typeof response.data === "object" ? Object.keys(response.data) : [],
            dataKeys:
              response.data && typeof response.data === "object" && "data" in response.data && response.data.data && typeof response.data.data === "object"
                ? Object.keys(response.data.data)
                : [],
          });
          const user = getUserFromMeResponse(response.data);

          if (!user) {
            const normalizedRole = normalizeRole(Cookies.get("ROLE") ?? Cookies.get("USER_ROLE"));
            Cookies.set("ROLE", normalizedRole, { path: "/" });
            Cookies.set("AUTH_PROVIDER", "google", { path: "/" });
            router.replace(getRoleHomePath(normalizedRole));
            router.refresh();
            return;
          }

          saveUserCookies(user, "google");

          const normalizedRole = normalizeRole(user.role);
          router.replace(getRoleHomePath(normalizedRole));
          router.refresh();
          return;
        }

        // Legacy fallback: older backend returned a code that needs to be exchanged.
        const code = searchParams.get("code");
        if (code) {
          const response = await API_GoogleCallback(code);
          const data = response.data;

          saveLoginCookies(data, "google");

          const normalizedRole = normalizeRole(data.user.role);
          router.replace(getRoleHomePath(normalizedRole));
          router.refresh();
          return;
        }

        // No valid params found
        const errorMsg = searchParams.get("error") || "Không nhận được thông tin xác thực từ Google.";
        setError(errorMsg);
      } catch (err: unknown) {
        console.error("Google callback error:", err);
        const message =
          err instanceof Error ? err.message : "Đã có lỗi xảy ra khi đăng nhập bằng Google.";
        setError(message);
      }
    }

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-gray-900 p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <svg className="h-8 w-8 text-red-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">Đăng nhập thất bại</h2>
          <p className="mb-6 text-sm text-gray-400">{error}</p>
          <button
            onClick={() => router.replace("/auth/signin")}
            className="rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 px-6 py-3 font-bold text-black transition-all hover:scale-[1.02] hover:from-yellow-400 hover:to-amber-400"
          >
            Thử lại
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/8 bg-gray-900 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-yellow-500" />
        <h2 className="mb-2 text-xl font-bold text-white">Đang xử lý đăng nhập...</h2>
        <p className="text-sm text-gray-400">Vui lòng chờ trong giây lát</p>
      </div>
    </main>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/8 bg-gray-900 p-8 text-center shadow-2xl">
            <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-yellow-500" />
            <h2 className="mb-2 text-xl font-bold text-white">Đang xử lý...</h2>
            <p className="text-sm text-gray-400">Vui lòng chờ trong giây lát</p>
          </div>
        </main>
      }
    >
      <GoogleCallbackInner />
    </Suspense>
  );
}

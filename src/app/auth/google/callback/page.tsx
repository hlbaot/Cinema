"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { API_GoogleCallback } from "@/src/api/API_Auth";
import { saveLoginCookies, normalizeRole } from "@/src/lib/auth-client";
import { getRoleHomePath } from "@/src/lib/auth-shared";

/**
 * Google OAuth Callback Page
 *
 * Flow:
 *  1. Backend redirects here after Google consent with `?code=...` in the URL
 *  2. We send that code to our backend API to exchange for tokens + user info
 *  3. Save tokens/user info to cookies
 *  4. Redirect to the user home page
 *
 * Alternative flow:
 *  - If the backend directly returns tokens in the redirect URL
 *    (access_token, refresh_token, user info as query params)
 *    we parse them directly
 */

function GoogleCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    async function handleCallback() {
      try {
        // Case 1: Backend returned tokens directly in the URL
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");

        if (accessToken && refreshToken) {
          // Parse user info from query params
          const userId = searchParams.get("user_id") || searchParams.get("id") || "";
          const email = searchParams.get("email") || "";
          const fullName =
            searchParams.get("full_name") ||
            searchParams.get("name") ||
            "";
          const role = searchParams.get("role") || "user";
          const status = searchParams.get("status") || "active";

          const loginData = {
            message: "Google login success",
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
              id: userId,
              email,
              full_name: fullName,
              role,
              status,
            },
          };

          saveLoginCookies(loginData, "google");

          const normalizedRole = normalizeRole(role);
          router.replace(getRoleHomePath(normalizedRole));
          router.refresh();
          return;
        }

        // Case 2: Backend returned a code that needs to be exchanged
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
      } finally {
        setLoading(false);
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

"use client";

import Link from "next/link";
import { useState } from "react";

type IconProps = {
  className?: string;
};

function MailIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function LockIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

function EyeIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

function EyeOffIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 3l18 18M10.584 10.587A2 2 0 0012 15a2 2 0 001.414-.586M9.88 5.09A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.972 9.972 0 01-4.09 5.136M6.228 6.228A9.965 9.965 0 002.458 12c1.274 4.057 5.065 7 9.542 7a9.96 9.96 0 005.772-1.772M9.878 9.879a3 3 0 104.243 4.243"
      />
    </svg>
  );
}

function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

function CoinIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function TicketIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
      />
    </svg>
  );
}

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const filmStripMarks = Array.from({ length: 20 });

  return (
    <main className="relative isolate min-h-screen overflow-x-hidden bg-[#04050a] text-white">
      <div
        className="pointer-events-none fixed inset-0 opacity-90"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.22),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(245,158,11,0.16),transparent_24%),linear-gradient(180deg,#090b12_0%,#04050a_48%,#020309_100%)]" />
        <div className="absolute left-[-8rem] top-24 h-64 w-64 rounded-full bg-red-500/10 blur-3xl" />
        <div className="absolute bottom-[-6rem] right-[-2rem] h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
        <div className="absolute left-0 top-0 bottom-0 w-16 opacity-10">
          {filmStripMarks.map((_, index) => (
            <div key={`left-film-strip-${index}`} className="my-1 h-[5%] border-y-4 border-white/50" />
          ))}
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-16 opacity-10">
          {filmStripMarks.map((_, index) => (
            <div key={`right-film-strip-${index}`} className="my-1 h-[5%] border-y-4 border-white/50" />
          ))}
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-[35rem]">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block">
              <h1 className="text-4xl font-black tracking-[0.04em] sm:text-[2.7rem]">
                <span className="text-red-500">CINE</span>
                <span className="text-yellow-500">PRO</span>
              </h1>
            </Link>
            <p className="mt-2 text-sm text-gray-400 sm:text-base">Trải nghiệm điện ảnh đỉnh cao</p>
          </div>

          <div className="flex min-h-[44rem] flex-col overflow-hidden rounded-[2rem] border border-white/8 bg-gray-900/75 shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <div className="flex border-b border-white/8 text-sm sm:text-base">
              <button
                type="button"
                className="relative flex-1 py-4 text-center font-semibold text-yellow-500"
              >
                Đăng nhập
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-500 to-amber-500" />
              </button>

              <Link
                href="/auth/signup"
                className="relative flex-1 py-4 text-center font-semibold text-gray-400 transition-colors hover:text-white"
              >
                Đăng ký
              </Link>
            </div>

            <div className="flex-1 p-5 sm:p-7">
              <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <MailIcon className="h-5 w-5" />
                    </span>
                    <input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="w-full rounded-xl border border-gray-700 bg-gray-800/60 py-3 pl-12 pr-4 text-white placeholder:text-gray-500 transition-all outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-300">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <LockIcon className="h-5 w-5" />
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-gray-700 bg-gray-800/60 py-3 pl-12 pr-12 text-white placeholder:text-gray-500 transition-all outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-white"
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex cursor-pointer items-center text-gray-400">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-600 bg-gray-800 accent-yellow-500 focus:ring-2 focus:ring-yellow-500"
                    />
                    <span className="ml-2">Ghi nhớ đăng nhập</span>
                  </label>

                  <button type="button" className="text-left text-yellow-500 transition-colors hover:text-yellow-400">
                    Quên mật khẩu?
                  </button>
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 py-3.5 font-bold text-black transition-all hover:scale-[1.02] hover:from-yellow-400 hover:to-amber-400 active:scale-[0.98]"
                >
                  <span>Đăng nhập</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-gray-900 px-4 text-gray-400">Hoặc đăng nhập với</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-900 transition-all hover:bg-gray-100"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-black text-gray-900">
                      G
                    </span>
                    <span>Tiếp tục với Google</span>
                  </button>

                  <p className="text-center text-xs leading-5 text-gray-500">
                    Frontend sẽ gọi trực tiếp BE qua endpoint{" "}
                    <span className="font-mono text-gray-300">/api/v1/auth/google/login</span>
                  </p>
                </div>

                <div className="rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl" aria-hidden="true">
                      👨‍💼
                    </span>
                    <div>
                      <p className="mb-1 text-sm font-medium text-blue-400">Đăng nhập dành cho nhân viên?</p>
                      <p className="text-xs leading-5 text-gray-400">
                        Sử dụng email có chứa &quot;<span className="font-mono text-yellow-500">staff</span>
                        &quot; để đăng nhập vào Staff Portal.
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        VD: <span className="font-mono text-gray-400">staff@cinepro.vn</span>
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="border-t border-white/8 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 p-4">
              <div className="flex flex-col items-center justify-center gap-3 text-sm text-gray-400 sm:flex-row sm:gap-6">
                <div className="flex items-center gap-2">
                  <CoinIcon className="h-5 w-5 text-yellow-500" />
                  <span>Tích điểm mỗi giao dịch</span>
                </div>
                <div className="flex items-center gap-2">
                  <TicketIcon className="h-5 w-5 text-yellow-500" />
                  <span>Ưu đãi độc quyền</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>© 2024 CINEPRO. Tất cả quyền được bảo lưu.</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <button type="button" className="transition-colors hover:text-yellow-500">
                Hỗ trợ
              </button>
              <span>•</span>
              <button type="button" className="transition-colors hover:text-yellow-500">
                Liên hệ
              </button>
              <span>•</span>
              <button type="button" className="transition-colors hover:text-yellow-500">
                FAQ
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

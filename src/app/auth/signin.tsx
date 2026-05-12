"use client";

import { Field, Form, Formik, type FormikHelpers } from "formik";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRightIcon, CoinIcon, EyeIcon, EyeOffIcon, GoogleIcon, LockIcon, MailIcon, TicketIcon } from "@/public/icons/AuthIcons";
import type { LoginRequest, LoginResponse } from "@/src/interface/auth";
import { getRoleHomePath, type AppRole } from "@/src/lib/auth-shared";
import { API_GG, API_SignIn } from "@/src/api/API_Auth";

type LoginErrors = Partial<Record<keyof LoginRequest, string>>;

type SignInPageProps = {
  compact?: boolean;
  onClose?: () => void;
  onSwitchMode?: (mode: "signin" | "signup") => void;
};

const initialSignInValues: LoginRequest = {
  email: "",
  password: "",
};

function validateSignIn(values: LoginRequest): LoginErrors {
  const errors: LoginErrors = {};
  const email = values.email.trim();

  if (!email) {
    errors.email = "Vui lòng nhập email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Email không hợp lệ.";
  }

  if (!values.password) {
    errors.password = "Vui lòng nhập mật khẩu.";
  } else if (values.password.length < 6) {
    errors.password = "Mật khẩu tối thiểu 6 ký tự.";
  }

  return errors;
}

function normalizeRole(role?: string): AppRole {
  const normalizedRole = role?.toLowerCase();

  return normalizedRole === "admin" || normalizedRole === "staff" || normalizedRole === "user"
    ? normalizedRole
    : "user";
}

function saveLoginCookies(data: LoginResponse["data"], provider: "credentials" | "google" = "credentials") {
  const role = normalizeRole(data.user.role);

  Cookies.set("ACCESS_TOKEN", data.access_token);
  Cookies.set("REFRESH_TOKEN", data.refresh_token);
  Cookies.set("ROLE", role);
  Cookies.set("USER_ID", data.user.id);
  Cookies.set("USER_EMAIL", data.user.email);
  Cookies.set("USER_NAME", data.user.full_name);
  Cookies.set("AUTH_PROVIDER", provider);
}

export default function SignInPage({ compact = false, onClose, onSwitchMode }: SignInPageProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(values: LoginRequest, actions: FormikHelpers<LoginRequest>) {
    actions.setStatus(undefined);

    try {
      const response = await API_SignIn(values);
      const role = normalizeRole(response.data.user.role);

      saveLoginCookies(response.data);
      router.push(getRoleHomePath(role));
      router.refresh();
      onClose?.();
    } catch {
      actions.setStatus("Email hoặc mật khẩu không đúng. Vui lòng thử lại.");
    } finally {
      actions.setSubmitting(false);
    }
  }

  function handleGoogleLogin() {
    Cookies.set("AUTH_PROVIDER", "google");
  }

  function handleQuickRoleLogin(role: "staff" | "admin") {
    Cookies.set("ROLE", role);
    Cookies.remove("USER_NAME");
    Cookies.remove("USER_POINTS");
    Cookies.remove("MEMBERSHIP_LEVEL");
    Cookies.remove("ACCESS_TOKEN");
    Cookies.remove("REFRESH_TOKEN");
    Cookies.set("AUTH_PROVIDER", "mock");

    router.push(getRoleHomePath(role));
    router.refresh();
    onClose?.();
  }

  return (
    <main
      className={`auth-modal-shell relative isolate overflow-x-hidden text-white ${compact ? "min-h-0 bg-transparent" : "min-h-screen bg-transparent"}`}
    >
      <div className={`relative z-10 flex items-center justify-center ${compact ? "px-0 py-0" : "min-h-screen px-4 py-12 sm:px-6"}`}>
        <div className="w-full max-w-140">
          {!compact ? (
            <div className="mb-8 text-center">
              <Link href="/" className="inline-block">
                <h1 className="text-4xl font-black tracking-[0.04em] sm:text-[2.7rem]">
                  <span className="text-red-500">CINE</span>
                  <span className="text-yellow-500">PRO</span>
                </h1>
              </Link>
              <p className="mt-2 text-sm text-gray-400 sm:text-base">Trải nghiệm điện ảnh đỉnh cao</p>
            </div>
          ) : null}

          <div
            className={`flex flex-col overflow-hidden border border-white/8 bg-gray-900/75 backdrop-blur-2xl ${compact ? "rounded-[1.75rem] shadow-[0_20px_60px_rgba(0,0,0,0.45)]" : "min-h-176 rounded-[2rem] shadow-[0_28px_90px_rgba(0,0,0,0.45)]"}`}
          >
            <div className="flex border-b border-white/8 text-sm sm:text-base">
              <button type="button" className="relative flex-1 py-4 text-center font-semibold text-yellow-500">
                Đăng nhập
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-yellow-500 to-amber-500" />
              </button>

              <Link
                href="/auth/signup"
                onClick={(event) => {
                  if (compact && onSwitchMode) {
                    event.preventDefault();
                    onSwitchMode("signup");
                    return;
                  }

                  onClose?.();
                }}
                className="relative flex-1 py-4 text-center font-semibold text-gray-400 transition-colors hover:text-white"
              >
                Đăng ký
              </Link>

              {compact ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 text-gray-400 transition-colors hover:text-white"
                  aria-label="Đóng đăng nhập"
                >
                  ✕
                </button>
              ) : null}
            </div>

            <div className="flex-1 p-5 sm:p-7">
              <Formik<LoginRequest> initialValues={initialSignInValues} validate={validateSignIn} onSubmit={handleLogin}>
                {({ errors, isSubmitting, status, touched }) => (
                  <Form className="space-y-5">
                    <div>
                      <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-300">
                        Email
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <MailIcon className="h-5 w-5" />
                        </span>
                        <Field
                          id="email"
                          name="email"
                          type="email"
                          placeholder="your@email.com"
                          className="w-full rounded-xl border border-gray-700 bg-gray-800/60 py-3 pl-12 pr-4 text-white placeholder:text-gray-500 transition-all outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                        />
                      </div>
                      {touched.email && errors.email ? (
                        <p className="mt-2 text-xs font-medium text-red-400">{errors.email}</p>
                      ) : null}
                    </div>

                    <div>
                      <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-300">
                        Mật khẩu
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <LockIcon className="h-5 w-5" />
                        </span>
                        <Field
                          id="password"
                          name="password"
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
                      {touched.password && errors.password ? (
                        <p className="mt-2 text-xs font-medium text-red-400">{errors.password}</p>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                      <label className="flex cursor-pointer items-center text-gray-400">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-600 bg-gray-800 accent-yellow-500 focus:ring-2 focus:ring-yellow-500"
                        />
                        <span className="ml-2">Ghi nhớ đăng nhập</span>
                      </label>

                      <button type="button" className="text-left text-yellow-500 transition-colors hover:cursor-pointer hover:text-yellow-400">
                        Quên mật khẩu?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-yellow-500 to-amber-500 py-3.5 font-bold text-black transition-all hover:cursor-pointer hover:scale-[1.02] hover:from-yellow-400 hover:to-amber-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <span>Đăng nhập</span>
                      <ArrowRightIcon className="h-5 w-5" />
                    </button>
                    {status ? <p className="text-center text-xs font-medium text-red-400">{status}</p> : null}

                    <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">Đăng nhập nhanh nội bộ</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => handleQuickRoleLogin("staff")}
                          className="rounded-xl border border-sky-500/20 bg-sky-500/10 px-4 py-3 text-sm font-bold text-sky-400 transition-all hover:cursor-pointer hover:scale-[1.02] hover:bg-sky-500/15"
                        >
                          Vào Staff
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickRoleLogin("admin")}
                          className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-3 text-sm font-bold text-fuchsia-400 transition-all hover:cursor-pointer hover:scale-[1.02] hover:bg-fuchsia-500/15"
                        >
                          Vào Admin
                        </button>
                      </div>
                      <p className="mt-3 text-xs leading-5 text-gray-500">
                        Luồng đăng nhập người dùng thường đã bỏ mock để bạn nối API thật vào nút <span className="font-medium text-gray-300">Đăng nhập</span>.
                      </p>
                    </div>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-700" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="bg-gray-900 px-4 text-gray-400">Hoặc đăng nhập với</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <a
                        href={API_GG}
                        onClick={handleGoogleLogin}
                        className="flex w-full items-center justify-center rounded-[1.4rem] border border-white/10 bg-[#050505] px-6 py-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_30px_rgba(0,0,0,0.22)] transition-all hover:cursor-pointer hover:border-white/20 hover:bg-[#0b0b0b]"
                      >
                        <span className="flex items-center gap-4">
                          <GoogleIcon className="h-7 w-7 shrink-0" />
                          <span className="text-base font-semibold tracking-[0.01em] text-white sm:text-[1.15rem]">
                            Tiếp tục với Google
                          </span>
                        </span>
                      </a>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>

            <div className="border-t border-white/8 bg-linear-to-r from-yellow-500/10 to-amber-500/10 p-4">
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

          {!compact ? (
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
          ) : null}
        </div>
      </div>
      <style>{`
        .auth-modal-shell,
        .auth-modal-shell * {
          scrollbar-width: none;
        }

        .auth-modal-shell::-webkit-scrollbar,
        .auth-modal-shell *::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>
    </main>
  );
}

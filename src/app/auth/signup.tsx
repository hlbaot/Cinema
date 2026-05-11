"use client";

import { Field, Form, Formik, type FormikHelpers } from "formik";
import Link from "next/link";
import { useState } from "react";
import { CoinIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon, PhoneIcon, TicketIcon, UserIcon, UserPlusIcon, GoogleIcon } from "@/public/icons/AuthIcons";
import type { RegisterRequest } from "@/src/interface/auth";

type RegisterErrors = Partial<Record<keyof RegisterRequest, string>>;

type SignUpPageProps = {
  compact?: boolean;
  onClose?: () => void;
  onSwitchMode?: (mode: "signin" | "signup") => void;
};

const initialSignUpValues: RegisterRequest = {
  birth_date: "",
  email: "",
  full_name: "",
  gender: "",
  password: "",
  phone: "",
};

function validateSignUp(values: RegisterRequest): RegisterErrors {
  const errors: RegisterErrors = {};
  const email = values.email.trim();
  const fullName = values.full_name.trim();
  const phone = values.phone.trim();

  if (!fullName) {
    errors.full_name = "Vui lòng nhập họ và tên.";
  } else if (fullName.length < 2) {
    errors.full_name = "Họ và tên tối thiểu 2 ký tự.";
  }

  if (!email) {
    errors.email = "Vui lòng nhập email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Email không hợp lệ.";
  }

  if (!phone) {
    errors.phone = "Vui lòng nhập số điện thoại.";
  } else if (!/^[0-9]{9,11}$/.test(phone)) {
    errors.phone = "Số điện thoại phải có 9-11 chữ số.";
  }

  if (!values.password) {
    errors.password = "Vui lòng nhập mật khẩu.";
  } else if (values.password.length < 6) {
    errors.password = "Mật khẩu tối thiểu 6 ký tự.";
  }

  if (!values.birth_date) {
    errors.birth_date = "Vui lòng chọn ngày sinh.";
  } else if (new Date(values.birth_date) > new Date()) {
    errors.birth_date = "Ngày sinh không hợp lệ.";
  }

  if (!values.gender) {
    errors.gender = "Vui lòng chọn giới tính.";
  }

  return errors;
}

export default function SignUpPage({ compact = false, onClose, onSwitchMode }: SignUpPageProps) {
  const [showPassword, setShowPassword] = useState(false);

  function handleSignUpSubmit(_values: RegisterRequest, actions: FormikHelpers<RegisterRequest>) {
    actions.setSubmitting(false);
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
              <Link
                href="/auth/signin"
                onClick={(event) => {
                  if (compact && onSwitchMode) {
                    event.preventDefault();
                    onSwitchMode("signin");
                    return;
                  }

                  onClose?.();
                }}
                className="relative flex-1 py-4 text-center font-semibold text-gray-400 transition-colors hover:text-white"
              >
                Đăng nhập
              </Link>
              <button type="button" className="relative flex-1 py-4 text-center font-semibold text-yellow-500">
                Đăng ký
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-yellow-500 to-amber-500" />
              </button>
              {compact ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 text-gray-400 transition-colors hover:text-white"
                  aria-label="Đóng đăng ký"
                >
                  ✕
                </button>
              ) : null}
            </div>

            <div className="flex-1 p-5 sm:p-7">
              <Formik<RegisterRequest> initialValues={initialSignUpValues} validate={validateSignUp} onSubmit={handleSignUpSubmit}>
                {({ errors, isSubmitting, touched, values }) => (
                  <Form className="space-y-4">
                    <div>
                      <label htmlFor="full_name" className="mb-2 block text-sm font-medium text-gray-300">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <UserIcon className="h-5 w-5" />
                        </span>
                        <Field
                          id="full_name"
                          name="full_name"
                          type="text"
                          placeholder="Nguyễn Văn A"
                          className="w-full rounded-xl border border-gray-700 bg-gray-800/60 py-3 pl-12 pr-4 text-white placeholder:text-gray-500 transition-all outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                        />
                      </div>
                      {touched.full_name && errors.full_name ? (
                        <p className="mt-2 text-xs font-medium text-red-400">{errors.full_name}</p>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-300">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <MailIcon className="h-5 w-5" />
                          </span>
                          <Field
                            id="email"
                            name="email"
                            type="email"
                            placeholder="email@example.com"
                            className="w-full rounded-xl border border-gray-700 bg-gray-800/60 py-3 pl-12 pr-4 text-white placeholder:text-gray-500 transition-all outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                          />
                        </div>
                        {touched.email && errors.email ? (
                          <p className="mt-2 text-xs font-medium text-red-400">{errors.email}</p>
                        ) : null}
                      </div>

                      <div>
                        <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-300">
                          Số điện thoại <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <PhoneIcon className="h-5 w-5" />
                          </span>
                          <Field
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="0901234567"
                            className="w-full rounded-xl border border-gray-700 bg-gray-800/60 py-3 pl-12 pr-4 text-white placeholder:text-gray-500 transition-all outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                          />
                        </div>
                        {touched.phone && errors.phone ? (
                          <p className="mt-2 text-xs font-medium text-red-400">{errors.phone}</p>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-300">
                        Mật khẩu <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <LockIcon className="h-5 w-5" />
                        </span>
                        <Field
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Tối thiểu 6 ký tự"
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

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label htmlFor="birth_date" className="mb-2 block text-sm font-medium text-gray-300">
                          Ngày sinh <span className="text-red-500">*</span>
                        </label>
                        <Field
                          id="birth_date"
                          name="birth_date"
                          type="date"
                          className="w-full rounded-xl border border-gray-700 bg-gray-800/60 px-4 py-3 text-white transition-all outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                          style={{ colorScheme: "dark" }}
                        />
                        {touched.birth_date && errors.birth_date ? (
                          <p className="mt-2 text-xs font-medium text-red-400">{errors.birth_date}</p>
                        ) : null}
                      </div>

                      <div>
                        <p className="mb-2 block text-sm font-medium text-gray-300">
                          Giới tính <span className="text-red-500">*</span>
                        </p>
                        <div className="flex gap-3">
                          {["Nam", "Nữ", "Khác"].map((gender) => {
                            const isSelected = values.gender === gender;

                            return (
                              <label
                                key={gender}
                                className={`flex-1 cursor-pointer rounded-xl border px-4 py-3 text-center transition-all ${isSelected
                                    ? "border-yellow-500 bg-yellow-500/10 text-yellow-400"
                                    : "border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600"
                                  }`}
                              >
                                <Field
                                  type="radio"
                                  name="gender"
                                  value={gender}
                                  className="hidden"
                                />
                                {gender}
                              </label>
                            );
                          })}
                        </div>
                        {touched.gender && errors.gender ? (
                          <p className="mt-2 text-xs font-medium text-red-400">{errors.gender}</p>
                        ) : null}
                      </div>
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
                      <button
                        type="button"
                        className="flex w-full items-center justify-center rounded-[1.4rem] border border-white/10 bg-[#050505] px-6 py-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_30px_rgba(0,0,0,0.22)] transition-all hover:border-white/20 hover:bg-[#0b0b0b]"
                      >
                        <span className="flex items-center gap-4">
                          <GoogleIcon className="h-7 w-7 shrink-0" />
                          <span className="text-base font-semibold tracking-[0.01em] text-white sm:text-[1.15rem]">
                            Tiếp tục với Google
                          </span>
                        </span>
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-yellow-500 to-amber-500 py-3.5 font-bold text-black transition-all hover:cursor-pointer hover:scale-[1.02] hover:from-yellow-400 hover:to-amber-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <span>Tạo tài khoản</span>
                      <UserPlusIcon className="h-5 w-5" />
                    </button>
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

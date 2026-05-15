"use client";

import Cookies from "js-cookie";
import type { LoginResponse, VerifyOtpResponse } from "@/src/interface/auth";
import type { AppRole } from "@/src/lib/auth-shared";

export function normalizeRole(role?: string): AppRole {
  const normalizedRole = role?.toLowerCase();

  return normalizedRole === "admin" || normalizedRole === "staff" || normalizedRole === "user"
    ? normalizedRole
    : "user";
}

export function saveLoginCookies(
  data: LoginResponse["data"],
  provider: "credentials" | "google" | "mock" = "credentials",
) {
  const role = normalizeRole(data.user.role);

  Cookies.set("ACCESS_TOKEN", data.access_token, { path: '/' });
  Cookies.set("REFRESH_TOKEN", data.refresh_token, { path: '/' });
  Cookies.set("ROLE", role, { path: '/' });
  Cookies.set("AUTH_PROVIDER", provider, { path: '/' });

  // Cố định lưu các trường quan trọng (email, id, name) để đảm bảo không bị thiếu
  if (data.user.id) Cookies.set("USER_ID", data.user.id, { path: '/' });
  if (data.user.email) Cookies.set("USER_EMAIL", data.user.email, { path: '/' });
  if (data.user.full_name) Cookies.set("USER_NAME", data.user.full_name, { path: '/' });

  // Lưu tự động toàn bộ các trường còn lại (phone, gender, points...)
  Object.entries(data.user).forEach(([key, value]) => {
    if (value !== null && value !== undefined && key !== 'id' && key !== 'email' && key !== 'full_name') {
      Cookies.set(`USER_${key.toUpperCase()}`, typeof value === 'object' ? JSON.stringify(value) : String(value), { path: '/' });
    }
  });
}

export function clearAuthCookies() {
  Cookies.remove("ACCESS_TOKEN", { path: '/' });
  Cookies.remove("REFRESH_TOKEN", { path: '/' });
  Cookies.remove("ROLE", { path: '/' });
  Cookies.remove("AUTH_PROVIDER", { path: '/' });
  Cookies.remove("USER_ID", { path: '/' });
  Cookies.remove("USER_EMAIL", { path: '/' });
  Cookies.remove("USER_NAME", { path: '/' });
  Cookies.remove("USER_POINTS", { path: '/' });
  Cookies.remove("MEMBERSHIP_LEVEL", { path: '/' });
}

export function markGoogleLogin() {
  Cookies.set("AUTH_PROVIDER", "google", { path: '/' });
}

function flattenBackendMessage(message: unknown): string | undefined {
  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }

  if (Array.isArray(message)) {
    const parts = message.map((part) => String(part).trim()).filter(Boolean);

    return parts.length ? parts.join(" ") : undefined;
  }

  return undefined;
}

/** Chuẩn hoá thông báo lỗi validation phổ biến từ BE sang tiếng Việt. */
function mapValidationMessageToVi(text: string): string {
  const lower = text.toLowerCase();

  if (lower.includes("property otp should not exist")) {
    return "Yêu cầu xác minh không đúng định dạng. Vui lòng thử lại.";
  }

  if (lower.includes("otp_code must be a string")) {
    return "Mã OTP phải là chuỗi (6 chữ số).";
  }

  if (lower.includes("otp_code") && lower.includes("should not be empty")) {
    return "Vui lòng nhập mã OTP.";
  }

  if (lower.includes("otp") && lower.includes("must be") && lower.includes("6")) {
    return "Mã OTP phải gồm đúng 6 ký tự.";
  }

  return text;
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: unknown } } }).response;
    const raw = flattenBackendMessage(response?.data?.message);

    if (raw) {
      return mapValidationMessageToVi(raw);
    }
  }

  return fallback;
}

export function hasLoginData(data?: VerifyOtpResponse["data"]): data is LoginResponse["data"] {
  return Boolean(data?.access_token && data.refresh_token && data.user);
}

export type DecodedJwtPayload = {
  email?: string;
  sub?: string;
  id?: string;
  role?: string;
  [key: string]: unknown;
};

export function decodeJwtPayload(token: string): DecodedJwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed: unknown = JSON.parse(jsonPayload);
    return parsed && typeof parsed === "object" ? (parsed as DecodedJwtPayload) : null;
  } catch {
    return null;
  }
}

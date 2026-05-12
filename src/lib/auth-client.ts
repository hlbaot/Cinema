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

  Cookies.set("ACCESS_TOKEN", data.access_token);
  Cookies.set("REFRESH_TOKEN", data.refresh_token);
  Cookies.set("ROLE", role);
  Cookies.set("USER_ID", data.user.id);
  Cookies.set("USER_EMAIL", data.user.email);
  Cookies.set("USER_NAME", data.user.full_name);
  Cookies.set("AUTH_PROVIDER", provider);
}

export function clearAuthCookies() {
  Cookies.remove("ACCESS_TOKEN");
  Cookies.remove("REFRESH_TOKEN");
  Cookies.remove("USER_ID");
  Cookies.remove("USER_EMAIL");
  Cookies.remove("USER_NAME");
  Cookies.remove("USER_POINTS");
  Cookies.remove("MEMBERSHIP_LEVEL");
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;

    return response?.data?.message || fallback;
  }

  return fallback;
}

export function hasLoginData(data?: VerifyOtpResponse["data"]): data is LoginResponse["data"] {
  return Boolean(data?.access_token && data.refresh_token && data.user);
}

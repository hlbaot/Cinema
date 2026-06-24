"use client";

import type { User } from "@/src/interface/user";

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

export function normalizeAuthUser(value: unknown): User | null {
  if (!value || typeof value !== "object") return null;

  const user = value as Record<string, unknown>;
  const profile = user.profile && typeof user.profile === "object" ? user.profile as Record<string, unknown> : {};
  const google = user.google && typeof user.google === "object" ? user.google as Record<string, unknown> : {};

  const email = firstString(user.email, user.user_email, user.userEmail, user.mail, profile.email, google.email);
  if (!email) return null;

  const id = firstString(user.id, user._id, user.user_id, user.userId, user.sub, profile.id, google.id) ?? email;
  const fullName = firstString(user.full_name, user.fullName, user.name, user.displayName, profile.name, google.name) ?? email;
  const role = firstString(user.role, user.user_role, user.userRole, user.type) ?? "user";
  const status = firstString(user.status, user.user_status, user.userStatus) ?? "ACTIVE";

  return {
    id,
    email,
    full_name: fullName,
    role,
    status,
  };
}

export function getUserFromAuthResponse(payload: unknown): User | null {
  const rootUser = normalizeAuthUser(payload);
  if (rootUser) return rootUser;

  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  const directUser = normalizeAuthUser(record.user);
  const dataUser = normalizeAuthUser(record.data);

  if (directUser) return directUser;
  if (dataUser) return dataUser;

  if (record.data && typeof record.data === "object") {
    const data = record.data as Record<string, unknown>;
    return normalizeAuthUser(data.user ?? data.customer ?? data.account ?? data.profile);
  }

  return null;
}

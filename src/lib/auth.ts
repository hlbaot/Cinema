import { cookies } from "next/headers";
import type { AppRole, HeaderUser, MembershipLevel } from "@/src/lib/auth-shared";

export { getRoleHomePath } from "@/src/lib/auth-shared";
export type { AppRole, HeaderUser, MembershipLevel } from "@/src/lib/auth-shared";

const DEFAULT_ROLE: AppRole = "user";

export async function getRoleFromCookies(): Promise<AppRole> {
  const cookieStore = await cookies();
  const role = cookieStore.get("ROLE")?.value?.toLowerCase();

  return role === "admin" || role === "staff" || role === "user" ? role : DEFAULT_ROLE;
}

export async function getHeaderUserFromCookies(): Promise<HeaderUser | null> {
  const cookieStore = await cookies();
  const role = cookieStore.get("ROLE")?.value?.toLowerCase();

  if (role !== "user") {
    return null;
  }

  const membershipValue = cookieStore.get("MEMBERSHIP_LEVEL")?.value;
  const membershipLevel: MembershipLevel =
    membershipValue === "Silver" || membershipValue === "Gold" || membershipValue === "Platinum"
      ? membershipValue
      : "Member";
  const points = Number(cookieStore.get("USER_POINTS")?.value ?? "1250");

  return {
    membershipLevel,
    name: cookieStore.get("USER_NAME")?.value ?? "Khach hang",
    points: Number.isFinite(points) ? points : 1250,
  };
}

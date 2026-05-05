export type AppRole = "admin" | "staff" | "user";
export type MembershipLevel = "Member" | "Silver" | "Gold" | "Platinum";

export type HeaderUser = {
  membershipLevel: MembershipLevel;
  name: string;
  points: number;
};

export function getRoleHomePath(role: AppRole): string {
  switch (role) {
    case "admin":
      return "/admin/overView";
    case "staff":
      return "/staff/checkVe";
    default:
      return "/trangChu";
  }
}

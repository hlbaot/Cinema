import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import StaffNavbar from "@/src/component/staff/navbar";
import { getRoleFromCookies, getRoleHomePath } from "@/src/lib/auth";

export default async function StaffLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const role = await getRoleFromCookies();

  if (role !== "staff") {
    redirect(getRoleHomePath(role));
  }

  return (
    <div className="flex min-h-screen bg-emerald-100/40">
      <StaffNavbar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

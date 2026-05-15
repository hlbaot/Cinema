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
    <div className="flex min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100">
      <StaffNavbar />
      <main className="min-w-0 flex-1 overflow-x-hidden bg-gradient-to-br from-zinc-950 via-zinc-950 to-emerald-950/20 p-6 sm:p-8">{children}</main>
    </div>
  );
}

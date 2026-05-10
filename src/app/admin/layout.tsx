import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import AdminNavbar from "@/src/component/admin/navbar";
import { getRoleFromCookies, getRoleHomePath } from "@/src/lib/auth";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const role = await getRoleFromCookies();

  if (role !== "admin") {
    redirect(getRoleHomePath(role));
  }

  return (
    <div className="min-h-screen bg-[#0b0b14] text-white md:flex md:h-screen md:overflow-hidden">
      <AdminNavbar />
      <main className="min-h-screen min-w-0 flex-1 md:h-screen md:min-h-0 md:overflow-hidden">{children}</main>
    </div>
  );
}

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

    <div className="flex min-h-screen bg-[#0b0b14] text-white">
      <AdminNavbar />
      <main className="flex-1 px-4 py-4 pt-[4.5rem] md:px-8 md:py-6 md:pt-6 min-w-0">{children}</main>

    <div className="flex min-h-screen bg-[#0b0b14] text-white md:h-screen md:overflow-hidden">
      <AdminNavbar />
      <main className="min-h-screen min-w-0 flex-1 md:h-screen md:min-h-0 md:overflow-hidden">{children}</main>

    </div>
  );
}

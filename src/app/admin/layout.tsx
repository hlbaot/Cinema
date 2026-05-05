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
    <div className="min-h-screen bg-[#0b0b14] text-white">
      <AdminNavbar />
      <main className="min-h-screen px-4 py-6 md:ml-64 md:px-8 md:py-8">{children}</main>
    </div>
  );
}

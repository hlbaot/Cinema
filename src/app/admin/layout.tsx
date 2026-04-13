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
    <div className="flex min-h-screen bg-slate-100">
      <AdminNavbar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

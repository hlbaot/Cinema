import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import UserFooter from "@/src/component/user/footer";
import UserHeader from "@/src/component/user/header";
import { getHeaderUserFromCookies, getRoleFromCookies, getRoleHomePath } from "@/src/lib/auth";

export default async function UserLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const role = await getRoleFromCookies();
  const user = await getHeaderUserFromCookies();

  if (role !== "user") {
    redirect(getRoleHomePath(role));
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <UserHeader user={user} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 px-6 pb-10 pt-28 lg:pt-32">
        {children}
      </main>
      <UserFooter />
    </div>
  );
}

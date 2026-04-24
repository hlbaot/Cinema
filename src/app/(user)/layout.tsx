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
    <div className="">
      <UserHeader user={user} />
      <main className="">
        {children}
      </main>
      <UserFooter />
    </div>
  );
}

import { redirect } from "next/navigation";
import { getRoleFromCookies, getRoleHomePath } from "@/src/lib/auth";

export default async function Main() {
  const role = await getRoleFromCookies();

  redirect(getRoleHomePath(role));
}

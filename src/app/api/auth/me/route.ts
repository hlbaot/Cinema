import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_URL } from "@/src/api/url";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value ?? cookieStore.get("ACCESS_TOKEN")?.value;
  const cookieNames = cookieStore.getAll().map((cookie) => cookie.name);
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${encodeURIComponent(cookie.value)}`)
    .join("; ");

  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (cookieHeader) {
    headers.Cookie = cookieHeader;
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_URL}/api/v1/users/me`, {
    headers,
    cache: "no-store",
  });
  const text = await response.text();

  console.log("[auth/me] backend response", {
    status: response.status,
    hasAccessToken: Boolean(accessToken),
    cookieNames,
    contentType: response.headers.get("Content-Type"),
    bodyPreview: text.slice(0, 500),
  });

  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  });
}

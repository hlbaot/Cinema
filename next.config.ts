import type { NextConfig } from "next";

function remotePatternFromBaseUrl(
  baseUrl: string | undefined,
): { protocol: "http" | "https"; hostname: string; port?: string } | null {
  if (!baseUrl?.trim()) return null;
  try {
    const u = new URL(baseUrl.trim());
    return {
      protocol: u.protocol === "https:" ? "https" : "http",
      hostname: u.hostname,
      ...(u.port ? { port: u.port } : {}),
    };
  } catch {
    return null;
  }
}

const apiImagePattern = remotePatternFromBaseUrl(process.env.NEXT_PUBLIC_API_URL);

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.36.120.223", "172.25.29.163", "localhost"],
  images: {
    qualities: [75, 88],
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "media.tmdb.org" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
      ...(apiImagePattern ? [apiImagePattern] : []),
      // Fallback khi chưa set NEXT_PUBLIC_API_URL
      { protocol: "http", hostname: "10.36.120.153", port: "5050" },
    ],
  },
};

export default nextConfig;

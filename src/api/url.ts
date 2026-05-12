const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://10.36.120.153:5050";

if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn("Warning: NEXT_PUBLIC_API_URL is missing, using fallback.");
}

export const API_URL = apiUrl;

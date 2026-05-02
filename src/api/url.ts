const apiUrl = process.env.API_URL?.trim();

if (!apiUrl) {
  throw new Error("Missing API_URL in environment variables");
}

export const API_URL = apiUrl;

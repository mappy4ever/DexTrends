export function baseUrl() {
  if (typeof window !== "undefined") return "";
  const u = process.env.SITE_URL || process.env.VERCEL_URL || process.env.NEXT_PUBLIC_SITE_URL || "";
  if (!u) return "";
  return u.startsWith("http") ? u.replace(/\/$/,"") : `https://${u.replace(/\/$/,"")}`;
}
export async function serverGet(path: string, init?: RequestInit) {
  const url = `${baseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  return fetch(url, { ...init, cache: "no-store" });
}

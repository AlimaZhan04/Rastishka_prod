/** One canonical fallback for metadata, crawlers and links in notifications. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://rastishka.pro"
).replace(/\/+$/, "");

export function adminRecordUrl(kind: "applications" | "responses", id: string): string {
  const base = (process.env.ADMIN_BASE_URL?.trim() || `${SITE_URL}/admin`).replace(/\/+$/, "");
  return `${base}/${kind}/${encodeURIComponent(id)}`;
}

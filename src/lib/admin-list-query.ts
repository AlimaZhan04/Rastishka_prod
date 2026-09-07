export const ADMIN_PAGE_SIZE = 25;

export type AdminListSearchParams = Record<string, string | string[] | undefined>;

export function parseAdminListQuery<T extends string>(
  query: AdminListSearchParams,
  statuses: Record<T, string>,
) {
  const q = typeof query.q === "string" ? query.q.trim().slice(0, 120) : "";
  const status =
    typeof query.status === "string" && Object.hasOwn(statuses, query.status)
      ? (query.status as T)
      : undefined;
  const page =
    typeof query.page === "string" && /^\d+$/.test(query.page)
      ? Math.max(1, Math.min(1_000_000, Number(query.page)))
      : 1;
  return { q, status, page };
}

export function adminPageHref(path: string, query: { q: string; status?: string }, page: number) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.status) params.set("status", query.status);
  if (page > 1) params.set("page", String(page));
  return params.size ? `${path}?${params}` : path;
}

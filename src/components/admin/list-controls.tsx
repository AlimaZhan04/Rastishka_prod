import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ADMIN_PAGE_SIZE, adminPageHref } from "@/lib/admin-list-query";

export function AdminListFilters({
  path,
  q,
  status,
  statuses,
}: {
  path: string;
  q: string;
  status?: string;
  statuses: Record<string, string>;
}) {
  return (
    <form action={path} className="mb-5 flex flex-wrap items-end gap-3">
      <div className="min-w-0 flex-1 basis-52 space-y-2">
        <Label htmlFor="admin-search">Поиск</Label>
        <Input
          id="admin-search"
          name="q"
          defaultValue={q}
          maxLength={120}
          placeholder="Имя, название или телефон"
        />
      </div>
      <div className="min-w-0 flex-1 basis-40 space-y-2">
        <Label htmlFor="admin-status-filter">Статус</Label>
        <select
          id="admin-status-filter"
          name="status"
          defaultValue={status ?? ""}
          className="border-input bg-background h-11 w-full rounded-xl border px-3 text-sm"
        >
          <option value="">Все статусы</option>
          {Object.entries(statuses).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit">Найти</Button>
      {q || status ? (
        <Button variant="outline" render={<Link href={path} />}>
          Сбросить
        </Button>
      ) : null}
    </form>
  );
}

export function AdminPagination({
  path,
  q,
  status,
  page,
  total,
}: {
  path: string;
  q: string;
  status?: string;
  page: number;
  total: number;
}) {
  const pages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  return (
    <nav
      aria-label="Страницы списка"
      className="mt-5 flex flex-wrap items-center justify-between gap-3"
    >
      <p className="text-muted-foreground text-sm">
        Всего: {total} · Страница {page} из {pages}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Button
            variant="outline"
            render={<Link href={adminPageHref(path, { q, status }, page - 1)} />}
          >
            Назад
          </Button>
        ) : null}
        {page < pages ? (
          <Button
            variant="outline"
            render={<Link href={adminPageHref(path, { q, status }, page + 1)} />}
          >
            Далее
          </Button>
        ) : null}
      </div>
    </nav>
  );
}

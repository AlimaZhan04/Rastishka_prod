import Link from "next/link";
import { archiveNews } from "@/app/actions/admin-content";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAdminDate, CONTENT_STATUS_LABELS } from "@/lib/admin-labels";
import { AdminListFilters, AdminPagination } from "@/components/admin/list-controls";
import {
  ADMIN_PAGE_SIZE,
  parseAdminListQuery,
  type AdminListSearchParams,
} from "@/lib/admin-list-query";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/server/admin-auth";

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<AdminListSearchParams>;
}) {
  await requireAdminPage("content");
  const query = parseAdminListQuery(await searchParams, CONTENT_STATUS_LABELS);
  const where: Prisma.NewsWhereInput = {
    status: query.status,
    ...(query.q
      ? {
          OR: [
            { title: { contains: query.q, mode: "insensitive" } },
            { slug: { contains: query.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const total = await prisma.news.count({ where });
  const page = Math.min(query.page, Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)));
  const news = await prisma.news.findMany({
    where,
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    orderBy: [{ date: "desc" }, { id: "desc" }],
    take: ADMIN_PAGE_SIZE,
    select: { id: true, title: true, slug: true, status: true, date: true },
  });
  return (
    <>
      <AdminPageHeader
        title="Новости"
        description="Создание, публикация и архив новостей."
        action={<Button render={<Link href="/admin/news/new" />}>Новая новость</Button>}
      />
      <AdminListFilters
        path="/admin/news"
        q={query.q}
        status={query.status}
        statuses={CONTENT_STATUS_LABELS}
      />
      <div className="border-border bg-card overflow-hidden rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {news.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{formatAdminDate(item.date)}</TableCell>
                <TableCell>
                  <Link
                    className="text-primary font-semibold hover:underline"
                    href={`/admin/news/${item.id}`}
                  >
                    {item.title}
                  </Link>
                </TableCell>
                <TableCell>{item.slug}</TableCell>
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>
                <TableCell>
                  {item.status !== "ARCHIVED" ? (
                    <form action={archiveNews}>
                      <input type="hidden" name="id" value={item.id} />
                      <Button type="submit" size="sm" variant="ghost">
                        В архив
                      </Button>
                    </form>
                  ) : (
                    "—"
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!news.length ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground py-10 text-center">
                  {query.q || query.status
                    ? "По заданным условиям ничего не найдено."
                    : "Новостей пока нет."}
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
      <AdminPagination
        path="/admin/news"
        q={query.q}
        status={query.status}
        page={page}
        total={total}
      />
    </>
  );
}

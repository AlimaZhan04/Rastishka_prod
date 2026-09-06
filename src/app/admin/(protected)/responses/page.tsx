import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAdminDate, RESPONSE_STATUS_LABELS } from "@/lib/admin-labels";
import { AdminListFilters, AdminPagination } from "@/components/admin/list-controls";
import {
  ADMIN_PAGE_SIZE,
  parseAdminListQuery,
  type AdminListSearchParams,
} from "@/lib/admin-list-query";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/server/admin-auth";

export default async function ResponsesPage({
  searchParams,
}: {
  searchParams: Promise<AdminListSearchParams>;
}) {
  await requireAdminPage("responses");
  const query = parseAdminListQuery(await searchParams, RESPONSE_STATUS_LABELS);
  const where: Prisma.VacancyResponseWhereInput = {
    status: query.status,
    ...(query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: "insensitive" } },
            { phone: { contains: query.q.replace(/[\s()-]/g, ""), mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const total = await prisma.vacancyResponse.count({ where });
  const page = Math.min(query.page, Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)));
  const responses = await prisma.vacancyResponse.findMany({
    where,
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: ADMIN_PAGE_SIZE,
    select: {
      id: true,
      name: true,
      phone: true,
      status: true,
      createdAt: true,
      vacancy: { select: { title: true } },
      responsible: { select: { name: true } },
    },
  });
  return (
    <>
      <AdminPageHeader title="Отклики" description="Отклики кандидатов на вакансии." />
      <AdminListFilters
        path="/admin/responses"
        q={query.q}
        status={query.status}
        statuses={RESPONSE_STATUS_LABELS}
      />
      <div className="border-border bg-card overflow-hidden rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Кандидат</TableHead>
              <TableHead>Вакансия</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Ответственный</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {responses.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Link
                    className="text-primary font-semibold hover:underline"
                    href={`/admin/responses/${item.id}`}
                  >
                    {formatAdminDate(item.createdAt)}
                  </Link>
                </TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.vacancy.title}</TableCell>
                <TableCell>{item.phone}</TableCell>
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>
                <TableCell>{item.responsible?.name ?? "—"}</TableCell>
              </TableRow>
            ))}
            {!responses.length ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                  {query.q || query.status
                    ? "По заданным условиям ничего не найдено."
                    : "Откликов пока нет."}
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
      <AdminPagination
        path="/admin/responses"
        q={query.q}
        status={query.status}
        page={page}
        total={total}
      />
    </>
  );
}

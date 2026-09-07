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
import { formatAdminDate, APPLICATION_STATUS_LABELS } from "@/lib/admin-labels";
import { AdminListFilters, AdminPagination } from "@/components/admin/list-controls";
import {
  ADMIN_PAGE_SIZE,
  parseAdminListQuery,
  type AdminListSearchParams,
} from "@/lib/admin-list-query";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/server/admin-auth";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<AdminListSearchParams>;
}) {
  await requireAdminPage("applications");
  const query = parseAdminListQuery(await searchParams, APPLICATION_STATUS_LABELS);
  const where: Prisma.ApplicationWhereInput = {
    status: query.status,
    ...(query.q
      ? {
          OR: [
            { parentName: { contains: query.q, mode: "insensitive" } },
            { phone: { contains: query.q.replace(/[\s()-]/g, ""), mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const total = await prisma.application.count({ where });
  const page = Math.min(query.page, Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)));
  const applications = await prisma.application.findMany({
    where,
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: ADMIN_PAGE_SIZE,
    select: {
      id: true,
      parentName: true,
      phone: true,
      status: true,
      createdAt: true,
      responsible: { select: { name: true } },
    },
  });

  return (
    <>
      <AdminPageHeader
        title="Заявки"
        description="Заявки на консультацию: поиск, статусы и ответственные."
      />
      <AdminListFilters
        path="/admin/applications"
        q={query.q}
        status={query.status}
        statuses={APPLICATION_STATUS_LABELS}
      />
      <div className="border-border bg-card overflow-hidden rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Родитель</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Ответственный</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Link
                    className="text-primary font-semibold hover:underline"
                    href={`/admin/applications/${item.id}`}
                  >
                    {formatAdminDate(item.createdAt)}
                  </Link>
                </TableCell>
                <TableCell>{item.parentName}</TableCell>
                <TableCell>{item.phone}</TableCell>
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>
                <TableCell>{item.responsible?.name ?? "—"}</TableCell>
              </TableRow>
            ))}
            {!applications.length ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground py-10 text-center">
                  {query.q || query.status
                    ? "По заданным условиям ничего не найдено."
                    : "Заявок пока нет."}
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
      <AdminPagination
        path="/admin/applications"
        q={query.q}
        status={query.status}
        page={page}
        total={total}
      />
    </>
  );
}

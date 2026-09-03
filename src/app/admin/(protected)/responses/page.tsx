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
import { formatAdminDate } from "@/lib/admin-labels";
import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/server/admin-auth";

export default async function ResponsesPage() {
  await requireAdminPage("responses");
  const responses = await prisma.vacancyResponse.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
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
                  Откликов пока нет.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

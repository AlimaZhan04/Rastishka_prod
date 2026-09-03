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

export default async function ApplicationsPage() {
  await requireAdminPage("applications");
  const applications = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
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
      <AdminPageHeader title="Заявки" description="Последние 100 заявок на консультацию." />
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
                  Заявок пока нет.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

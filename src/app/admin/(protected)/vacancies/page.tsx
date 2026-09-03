import Link from "next/link";
import { archiveVacancy } from "@/app/actions/admin-content";
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
import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/server/admin-auth";

export default async function AdminVacanciesPage() {
  await requireAdminPage("content");
  const vacancies = await prisma.vacancy.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      sortOrder: true,
      responsesCount: true,
    },
  });
  return (
    <>
      <AdminPageHeader
        title="Вакансии"
        description="Управление активными вакансиями и порядком карточек."
        action={<Button render={<Link href="/admin/vacancies/new" />}>Новая вакансия</Button>}
      />
      <div className="border-border bg-card overflow-hidden rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Порядок</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Отклики</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vacancies.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.sortOrder}</TableCell>
                <TableCell>
                  <Link
                    className="text-primary font-semibold hover:underline"
                    href={`/admin/vacancies/${item.id}`}
                  >
                    {item.title}
                  </Link>
                </TableCell>
                <TableCell>{item.slug}</TableCell>
                <TableCell>{item.responsesCount}</TableCell>
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>
                <TableCell>
                  {item.status !== "ARCHIVED" ? (
                    <form action={archiveVacancy}>
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
            {!vacancies.length ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                  Вакансий пока нет.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

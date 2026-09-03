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
import { formatAdminDate } from "@/lib/admin-labels";
import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/server/admin-auth";

export default async function AdminNewsPage() {
  await requireAdminPage("content");
  const news = await prisma.news.findMany({
    orderBy: { date: "desc" },
    take: 100,
    select: { id: true, title: true, slug: true, status: true, date: true },
  });
  return (
    <>
      <AdminPageHeader
        title="Новости"
        description="Создание, публикация и архив новостей."
        action={<Button render={<Link href="/admin/news/new" />}>Новая новость</Button>}
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
                  Новостей пока нет.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

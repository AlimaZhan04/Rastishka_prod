import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { NewsForm } from "@/components/admin/content-forms";
import { prisma } from "@/lib/db";
import { formatAdminDateInput } from "@/lib/admin-labels";
import { requireAdminPage } from "@/lib/server/admin-auth";

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage("content");
  const { id } = await params;
  const news = await prisma.news.findUnique({ where: { id } });
  if (!news) notFound();
  return (
    <>
      <AdminPageHeader title="Редактирование новости" description={news.title} />
      <NewsForm news={{ ...news, date: formatAdminDateInput(news.date) }} />
    </>
  );
}

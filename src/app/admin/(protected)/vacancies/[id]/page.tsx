import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { VacancyForm } from "@/components/admin/content-forms";
import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/server/admin-auth";

export default async function EditVacancyPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage("content");
  const { id } = await params;
  const vacancy = await prisma.vacancy.findUnique({ where: { id } });
  if (!vacancy) notFound();
  return (
    <>
      <AdminPageHeader title="Редактирование вакансии" description={vacancy.title} />
      <VacancyForm vacancy={vacancy} />
    </>
  );
}

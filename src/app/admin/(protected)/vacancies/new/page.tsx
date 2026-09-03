import { AdminPageHeader } from "@/components/admin/page-header";
import { VacancyForm } from "@/components/admin/content-forms";
import { requireAdminPage } from "@/lib/server/admin-auth";

export default async function NewVacancyPage() {
  await requireAdminPage("content");
  return (
    <>
      <AdminPageHeader
        title="Новая вакансия"
        description="Создайте черновик или опубликуйте вакансию."
      />
      <VacancyForm />
    </>
  );
}

import { AdminPageHeader } from "@/components/admin/page-header";
import { NewsForm } from "@/components/admin/content-forms";
import { requireAdminPage } from "@/lib/server/admin-auth";

export default async function NewNewsPage() {
  await requireAdminPage("content");
  return (
    <>
      <AdminPageHeader
        title="Новая новость"
        description="Сохраните черновик или сразу опубликуйте материал."
      />
      <NewsForm />
    </>
  );
}

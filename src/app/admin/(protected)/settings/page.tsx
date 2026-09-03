import { AdminPageHeader } from "@/components/admin/page-header";
import { SiteSettingsForm } from "@/components/admin/settings-forms";
import { getSiteSettings } from "@/lib/content/site";
import { requireAdminPage } from "@/lib/server/admin-auth";

export default async function SettingsPage() {
  await requireAdminPage("settings");
  const settings = await getSiteSettings();
  return (
    <>
      <AdminPageHeader
        title="Сайт и контакты"
        description="Главный экран, аудитория, телефон, соцсети и точка на карте."
      />
      <SiteSettingsForm settings={settings} />
    </>
  );
}

import { getSiteSettings } from "@/lib/content/site";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";

export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings();
  return (
    <>
      <PublicHeader phone={settings.phone} socials={settings.socials} />
      <main className="flex-1">{children}</main>
      <Footer phone={settings.phone} socials={settings.socials} />
      {/* AnketaModal монтируется здесь в Фазе 2 */}
    </>
  );
}

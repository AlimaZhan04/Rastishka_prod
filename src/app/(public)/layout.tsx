import { getSiteSettings } from "@/lib/content/site";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { AnketaModal } from "@/components/anketa/anketa-modal";

// Contact settings are edited independently from deployments and must stay fresh.
export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings();
  return (
    <>
      <a
        href="#main-content"
        className="focus:ring-ring/50 bg-primary text-primary-foreground fixed top-3 left-4 z-[100] -translate-y-20 rounded-full px-4 py-2.5 font-semibold shadow-lg transition-transform focus:translate-y-0 focus:ring-3 focus:outline-none"
      >
        К основному содержанию
      </a>
      <PublicHeader phone={settings.phone} socials={settings.socials} />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <Footer phone={settings.phone} socials={settings.socials} />
      <AnketaModal />
    </>
  );
}

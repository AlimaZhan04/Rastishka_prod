import { getSiteSettings } from "@/lib/content/site";
import { Hero } from "@/components/home/hero";
import { AudienceSection } from "@/components/home/audience-section";
import { VisitFormatsSection } from "@/components/home/visit-formats-section";

export default async function HomePage() {
  const settings = await getSiteSettings();
  return (
    <>
      <Hero hero={settings.hero} />
      <AudienceSection audience={settings.audience} />
      <VisitFormatsSection />
    </>
  );
}

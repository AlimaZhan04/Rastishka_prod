import { getSiteSettings } from "@/lib/content/site";
import { Hero } from "@/components/home/hero";
import { AudienceSection } from "@/components/home/audience-section";
import { VisitFormatsSection } from "@/components/home/visit-formats-section";
import { LatestNewsSection } from "@/components/home/latest-news-section";
import { ContactsSection } from "@/components/home/contacts-section";
import { listPublishedNews } from "@/lib/content/news";

export default async function HomePage() {
  const settings = await getSiteSettings();
  const latestNews = await listPublishedNews(3);
  return (
    <>
      <Hero hero={settings.hero} />
      <AudienceSection audience={settings.audience} />
      <VisitFormatsSection />
      <LatestNewsSection items={latestNews} />
      <ContactsSection settings={settings} />
    </>
  );
}

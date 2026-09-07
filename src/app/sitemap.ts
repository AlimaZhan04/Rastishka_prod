import type { MetadataRoute } from "next";
import { listPublishedNews } from "@/lib/content/news";
import { listPublishedVacancySlugs } from "@/lib/content/vacancies";
import { SITE_URL as siteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [news, vacancies] = await Promise.all([listPublishedNews(), listPublishedVacancySlugs()]);
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/news`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/vacancies`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/contacts`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  return [
    ...staticPages,
    ...news.map((item) => ({
      url: `${siteUrl}/news/${item.slug}`,
      lastModified: item.date,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
    ...vacancies.map((vacancy) => ({
      url: `${siteUrl}/vacancies/${vacancy.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.65,
    })),
  ];
}

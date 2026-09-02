import "server-only";

import { cache } from "react";
import { prisma } from "@/lib/db";
import { logServerError } from "@/lib/observability";

export type PublicNewsItem = {
  slug: string;
  title: string;
  shortText: string;
  fullText: string;
  image: string | null;
  alt: string | null;
  date: Date;
  seoTitle: string | null;
  seoDescription: string | null;
};

const publicNewsSelect = {
  slug: true,
  title: true,
  shortText: true,
  fullText: true,
  image: true,
  alt: true,
  date: true,
  seoTitle: true,
  seoDescription: true,
} as const;

/** Only published news is ever exposed to the public site. */
export const listPublishedNews = cache(async (limit?: number): Promise<PublicNewsItem[]> => {
  try {
    return await prisma.news.findMany({
      where: { status: "PUBLISHED" },
      select: publicNewsSelect,
      orderBy: { date: "desc" },
      ...(limit ? { take: limit } : {}),
    });
  } catch (error) {
    logServerError("news.list_failed", error, { operation: "list_published_news" });
    return [];
  }
});

export const getPublishedNewsBySlug = cache(
  async (slug: string): Promise<PublicNewsItem | null> => {
    try {
      return await prisma.news.findFirst({
        where: { slug, status: "PUBLISHED" },
        select: publicNewsSelect,
      });
    } catch (error) {
      logServerError("news.fetch_failed", error, { operation: "get_published_news" });
      return null;
    }
  },
);

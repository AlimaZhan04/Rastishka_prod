import "server-only";

import { cache } from "react";
import { prisma } from "@/lib/db";
import { logServerError } from "@/lib/observability";

export type PublicVacancy = {
  id: string;
  slug: string;
  title: string;
  preview: string;
  duties: string;
  requirements: string;
  offer: string;
  icon: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

const publicVacancySelect = {
  id: true,
  slug: true,
  title: true,
  preview: true,
  duties: true,
  requirements: true,
  offer: true,
  icon: true,
  seoTitle: true,
  seoDescription: true,
} as const;

/** The public list is intentionally capped at ten active vacancies (FR-VAC-02). */
export const listPublishedVacancies = cache(async (): Promise<PublicVacancy[]> => {
  try {
    return await prisma.vacancy.findMany({
      where: { status: "PUBLISHED" },
      select: publicVacancySelect,
      orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
      take: 10,
    });
  } catch (error) {
    logServerError("vacancies.list_failed", error, { operation: "list_published_vacancies" });
    return [];
  }
});

export const getPublishedVacancyBySlug = cache(
  async (slug: string): Promise<PublicVacancy | null> => {
    try {
      return await prisma.vacancy.findFirst({
        where: { slug, status: "PUBLISHED" },
        select: publicVacancySelect,
      });
    } catch (error) {
      logServerError("vacancies.fetch_failed", error, { operation: "get_published_vacancy" });
      return null;
    }
  },
);

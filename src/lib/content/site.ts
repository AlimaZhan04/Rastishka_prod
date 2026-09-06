import { cache } from "react";
import { prisma } from "@/lib/db";
import { logServerError } from "@/lib/observability";

export type SiteSettings = {
  hero: { title: string; subtitle: string; imageAlt: string; imageUrl?: string };
  audience: { key: string; title: string; description: string }[];
  phone: string;
  socials: { instagram?: string; facebook?: string; threads?: string };
  branches: { title: string; address: string; lat?: number; lng?: number }[];
};

/** Безопасные значения по умолчанию (рендер не падает без записи в БД). */
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  hero: {
    title: "Детский сад для особенных детей",
    subtitle: "Комплексное психолого-педагогическое сопровождение на протяжении всего дня",
    imageAlt: "Ребёнок на развивающем занятии в детском саду «РАСтишка»",
  },
  audience: [
    {
      key: "ras",
      title: "РАС",
      description: "Индивидуальный маршрут, ABA-подход, тьютор, сенсорная интеграция.",
    },
    {
      key: "zprr",
      title: "ЗПРР и ЗРР",
      description: "Логопед-дефектолог, логоритмика, игровые занятия.",
    },
    {
      key: "adhd",
      title: "СДВГ",
      description: "Структурированный режим, поведенческие стратегии, психолог, АФК.",
    },
    {
      key: "down",
      title: "Синдром Дауна",
      description: "Индивидуальная программа, развитие речи и бытовых навыков.",
    },
  ],
  phone: "+996 502 114 888",
  socials: {
    instagram: "https://www.instagram.com/rastishkasad/",
    facebook: "https://www.facebook.com/people/Rastishka-Sad/61577141936142/",
  },
  branches: [{ title: "Главный филиал", address: "г. Бишкек", lat: 42.8303178, lng: 74.5723253 }],
};

/** Настройки сайта (singleton) с безопасным fallback. Дедуплицируется в рамках запроса. */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { id: "singleton" } });
    if (!row?.data) return DEFAULT_SITE_SETTINGS;
    return { ...DEFAULT_SITE_SETTINGS, ...(row.data as Partial<SiteSettings>) };
  } catch (error) {
    logServerError("site_settings.fetch_failed", error, { operation: "find_site_settings" });
    return DEFAULT_SITE_SETTINGS;
  }
});

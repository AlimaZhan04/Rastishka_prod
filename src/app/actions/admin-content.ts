"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { optionalImageUrlSchema } from "@/lib/admin-content-validation";
import { requireAdminAction } from "@/lib/server/admin-auth";
import { writeAdminAudit } from "@/lib/server/admin-audit";

export type AdminContentState = { message?: string; fieldErrors?: Record<string, string> };

const slugSchema = z
  .string()
  .trim()
  .min(2, "Укажите slug")
  .max(160, "Slug слишком длинный")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Только латинские буквы, цифры и дефисы");

const contentStatus = z.enum(["DRAFT", "PUBLISHED", "HIDDEN", "ARCHIVED"]);

const newsSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().trim().min(3, "Укажите заголовок").max(200),
    slug: slugSchema,
    shortText: z.string().trim().min(10, "Добавьте краткое описание").max(500),
    fullText: z.string().trim().min(20, "Добавьте полный текст"),
    image: optionalImageUrlSchema,
    alt: z.string().trim().max(200),
    date: z.iso.date("Укажите существующую дату"),
    status: contentStatus,
    seoTitle: z.string().trim().max(180),
    seoDescription: z.string().trim().max(320),
  })
  .refine((data) => data.status !== "PUBLISHED" || !data.image || Boolean(data.alt), {
    path: ["alt"],
    message: "Для опубликованного изображения нужен alt-текст",
  });

const vacancySchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3, "Укажите название").max(200),
  slug: slugSchema,
  preview: z.string().trim().min(10, "Добавьте краткое описание").max(100),
  duties: z.string().trim().min(10, "Добавьте обязанности"),
  requirements: z.string().trim().min(10, "Добавьте требования"),
  offer: z.string().trim().min(10, "Добавьте условия"),
  icon: z.string().trim().max(80),
  sortOrder: z.coerce.number().int().min(0).max(1000),
  status: contentStatus,
  seoTitle: z.string().trim().max(180),
  seoDescription: z.string().trim().max(320),
});

function formValue(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !result[key]) result[key] = issue.message;
  }
  return result;
}

function isUniqueError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export async function saveNews(
  _previousState: AdminContentState,
  formData: FormData,
): Promise<AdminContentState> {
  const actor = await requireAdminAction("content");
  const parsed = newsSchema.safeParse({
    id: formValue(formData, "id") || undefined,
    title: formValue(formData, "title"),
    slug: formValue(formData, "slug"),
    shortText: formValue(formData, "shortText"),
    fullText: formValue(formData, "fullText"),
    image: formValue(formData, "image"),
    alt: formValue(formData, "alt"),
    date: formValue(formData, "date"),
    status: formValue(formData, "status"),
    seoTitle: formValue(formData, "seoTitle"),
    seoDescription: formValue(formData, "seoDescription"),
  });
  if (!parsed.success)
    return { message: "Проверьте поля новости", fieldErrors: fieldErrors(parsed.error) };

  const data = parsed.data;
  const existing = data.id
    ? await prisma.news.findUnique({
        where: { id: data.id },
        select: { slug: true, status: true, publishedAt: true },
      })
    : null;
  if (data.id && !existing) return { message: "Новость больше не существует. Обновите список." };
  try {
    const news = data.id
      ? await prisma.news.update({
          where: { id: data.id },
          data: {
            title: data.title,
            slug: data.slug,
            shortText: data.shortText,
            fullText: data.fullText,
            image: data.image || null,
            alt: data.alt || null,
            date: new Date(`${data.date}T12:00:00+06:00`),
            status: data.status,
            seoTitle: data.seoTitle || null,
            seoDescription: data.seoDescription || null,
            publishedAt:
              data.status === "PUBLISHED"
                ? (existing?.publishedAt ?? new Date())
                : existing?.publishedAt,
          },
        })
      : await prisma.news.create({
          data: {
            title: data.title,
            slug: data.slug,
            shortText: data.shortText,
            fullText: data.fullText,
            image: data.image || null,
            alt: data.alt || null,
            date: new Date(`${data.date}T12:00:00+06:00`),
            status: data.status,
            seoTitle: data.seoTitle || null,
            seoDescription: data.seoDescription || null,
            authorId: actor.id,
            publishedAt: data.status === "PUBLISHED" ? new Date() : null,
          },
        });
    await writeAdminAudit({
      userId: actor.id,
      action: existing ? "news.updated" : "news.created",
      entityType: "News",
      entityId: news.id,
      diff: { status: news.status, slug: news.slug },
    });
    revalidatePath("/news");
    revalidatePath("/admin/news");
    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath(`/news/${news.slug}`);
    if (existing?.slug && existing.slug !== news.slug) revalidatePath(`/news/${existing.slug}`);
  } catch (error) {
    if (isUniqueError(error))
      return {
        message: "Новость с таким slug уже существует",
        fieldErrors: { slug: "Slug должен быть уникальным" },
      };
    throw error;
  }
  redirect("/admin/news");
}

export async function archiveNews(formData: FormData): Promise<void> {
  const actor = await requireAdminAction("content");
  const id = z.string().min(1).parse(formData.get("id"));
  const news = await prisma.news.update({
    where: { id },
    data: { status: "ARCHIVED" },
    select: { id: true, slug: true },
  });
  await writeAdminAudit({
    userId: actor.id,
    action: "news.archived",
    entityType: "News",
    entityId: id,
  });
  revalidatePath("/admin/news");
  revalidatePath("/news");
  revalidatePath(`/news/${news.slug}`);
  revalidatePath("/");
}

export async function saveVacancy(
  _previousState: AdminContentState,
  formData: FormData,
): Promise<AdminContentState> {
  const actor = await requireAdminAction("content");
  const parsed = vacancySchema.safeParse({
    id: formValue(formData, "id") || undefined,
    title: formValue(formData, "title"),
    slug: formValue(formData, "slug"),
    preview: formValue(formData, "preview"),
    duties: formValue(formData, "duties"),
    requirements: formValue(formData, "requirements"),
    offer: formValue(formData, "offer"),
    icon: formValue(formData, "icon"),
    sortOrder: formValue(formData, "sortOrder"),
    status: formValue(formData, "status"),
    seoTitle: formValue(formData, "seoTitle"),
    seoDescription: formValue(formData, "seoDescription"),
  });
  if (!parsed.success)
    return { message: "Проверьте поля вакансии", fieldErrors: fieldErrors(parsed.error) };
  const data = parsed.data;
  const existing = data.id
    ? await prisma.vacancy.findUnique({
        where: { id: data.id },
        select: { slug: true, status: true, publishedAt: true },
      })
    : null;
  if (data.id && !existing) return { message: "Вакансия больше не существует. Обновите список." };
  try {
    const vacancy = data.id
      ? await prisma.vacancy.update({
          where: { id: data.id },
          data: {
            title: data.title,
            slug: data.slug,
            preview: data.preview,
            duties: data.duties,
            requirements: data.requirements,
            offer: data.offer,
            icon: data.icon || null,
            sortOrder: data.sortOrder,
            status: data.status,
            seoTitle: data.seoTitle || null,
            seoDescription: data.seoDescription || null,
            publishedAt:
              data.status === "PUBLISHED"
                ? (existing?.publishedAt ?? new Date())
                : existing?.publishedAt,
          },
        })
      : await prisma.vacancy.create({
          data: {
            title: data.title,
            slug: data.slug,
            preview: data.preview,
            duties: data.duties,
            requirements: data.requirements,
            offer: data.offer,
            icon: data.icon || null,
            sortOrder: data.sortOrder,
            status: data.status,
            seoTitle: data.seoTitle || null,
            seoDescription: data.seoDescription || null,
            publishedAt: data.status === "PUBLISHED" ? new Date() : null,
          },
        });
    await writeAdminAudit({
      userId: actor.id,
      action: existing ? "vacancy.updated" : "vacancy.created",
      entityType: "Vacancy",
      entityId: vacancy.id,
      diff: { status: vacancy.status, slug: vacancy.slug, sortOrder: vacancy.sortOrder },
    });
    revalidatePath("/vacancies");
    revalidatePath("/admin/vacancies");
    revalidatePath("/admin");
    revalidatePath(`/vacancies/${vacancy.slug}`);
    if (existing?.slug && existing.slug !== vacancy.slug)
      revalidatePath(`/vacancies/${existing.slug}`);
  } catch (error) {
    if (isUniqueError(error))
      return {
        message: "Вакансия с таким slug уже существует",
        fieldErrors: { slug: "Slug должен быть уникальным" },
      };
    throw error;
  }
  redirect("/admin/vacancies");
}

export async function archiveVacancy(formData: FormData): Promise<void> {
  const actor = await requireAdminAction("content");
  const id = z.string().min(1).parse(formData.get("id"));
  const vacancy = await prisma.vacancy.update({
    where: { id },
    data: { status: "ARCHIVED" },
    select: { id: true, slug: true },
  });
  await writeAdminAudit({
    userId: actor.id,
    action: "vacancy.archived",
    entityType: "Vacancy",
    entityId: id,
  });
  revalidatePath("/admin/vacancies");
  revalidatePath("/vacancies");
  revalidatePath(`/vacancies/${vacancy.slug}`);
}

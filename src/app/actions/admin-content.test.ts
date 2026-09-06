import { saveNews, saveVacancy } from "./admin-content";
import { prisma } from "@/lib/db";
import { requireAdminAction } from "@/lib/server/admin-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

jest.mock("@/lib/db", () => ({
  prisma: {
    news: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    vacancy: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  },
}));
jest.mock("@/lib/server/admin-auth", () => ({ requireAdminAction: jest.fn() }));
jest.mock("@/lib/server/admin-audit", () => ({ writeAdminAudit: jest.fn() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("next/navigation", () => ({ redirect: jest.fn() }));

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(requireAdminAction).mockResolvedValue({ id: "actor" } as never);
  jest.mocked(redirect).mockImplementation((path) => {
    throw new Error(`redirect:${path}`);
  });
  for (const model of [prisma.news, prisma.vacancy]) {
    jest
      .mocked(model.create)
      .mockResolvedValue({ id: "created", slug: "audit-content", status: "PUBLISHED" } as never);
    jest
      .mocked(model.update)
      .mockResolvedValue({ id: "existing", slug: "audit-content", status: "PUBLISHED" } as never);
  }
});

function news(overrides: Record<string, string> = {}) {
  const form = new FormData();
  Object.entries({
    title: "Тестовая новость",
    slug: "audit-content",
    shortText: "Краткое описание новости",
    fullText: "Полный текст новости для проверки публикации",
    image: "",
    alt: "",
    date: "2026-09-07",
    status: "DRAFT",
    ...overrides,
  }).forEach(([key, value]) => form.set(key, value));
  return form;
}

function vacancy(overrides: Record<string, string> = {}) {
  const form = new FormData();
  Object.entries({
    title: "Тестовая вакансия",
    slug: "audit-content",
    preview: "Описание вакансии",
    duties: "Обязанности сотрудника",
    requirements: "Требования к сотруднику",
    offer: "Условия для сотрудника",
    status: "DRAFT",
    sortOrder: "0",
    ...overrides,
  }).forEach(([key, value]) => form.set(key, value));
  return form;
}

it.each(["2026-02-30", "2026-13-01", "invalid"])(
  "rejects nonexistent publication date %s before writing",
  async (date) => {
    expect(await saveNews({}, news({ date }))).toMatchObject({
      fieldErrors: { date: expect.any(String) },
    });
    expect(prisma.news.create).not.toHaveBeenCalled();
  },
);

it("rejects executable image URLs and requires alt text for a published image", async () => {
  expect(await saveNews({}, news({ image: "javascript:alert(1)" }))).toMatchObject({
    fieldErrors: { image: expect.any(String) },
  });
  expect(
    await saveNews({}, news({ image: "https://example.com/image.jpg", status: "PUBLISHED" })),
  ).toMatchObject({ fieldErrors: { alt: expect.any(String) } });
  expect(prisma.news.create).not.toHaveBeenCalled();
});

it.each(["DRAFT", "PUBLISHED", "HIDDEN", "ARCHIVED"])(
  "creates news and vacancies with status %s and refreshes admin lists",
  async (status) => {
    await expect(saveNews({}, news({ status }))).rejects.toThrow("redirect:/admin/news");
    await expect(saveVacancy({}, vacancy({ status }))).rejects.toThrow("redirect:/admin/vacancies");
    expect(prisma.news.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status,
        publishedAt: status === "PUBLISHED" ? expect.any(Date) : null,
      }),
    });
    expect(prisma.vacancy.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status,
        publishedAt: status === "PUBLISHED" ? expect.any(Date) : null,
      }),
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/news");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/vacancies");
  },
);

it("preserves the first publication time and invalidates the former public slug", async () => {
  const publishedAt = new Date("2026-09-01T06:00:00Z");
  jest
    .mocked(prisma.news.findUnique)
    .mockResolvedValue({ slug: "former-slug", status: "PUBLISHED", publishedAt } as never);
  await expect(saveNews({}, news({ id: "existing", status: "PUBLISHED" }))).rejects.toThrow(
    "redirect:/admin/news",
  );
  expect(prisma.news.update).toHaveBeenCalledWith({
    where: { id: "existing" },
    data: expect.objectContaining({ publishedAt }),
  });
  expect(revalidatePath).toHaveBeenCalledWith("/news/former-slug");
});

it("reports duplicate slugs and missing records as recoverable form errors", async () => {
  jest.mocked(prisma.news.create).mockRejectedValue({ code: "P2002" });
  expect(await saveNews({}, news())).toMatchObject({ fieldErrors: { slug: expect.any(String) } });
  jest.mocked(prisma.vacancy.findUnique).mockResolvedValue(null);
  expect(await saveVacancy({}, vacancy({ id: "deleted" }))).toMatchObject({
    message: expect.stringContaining("не существует"),
  });
  expect(prisma.vacancy.update).not.toHaveBeenCalled();
});

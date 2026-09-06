import { saveSiteSettings, saveAdminUser, retryNotification } from "./admin-settings";
import { prisma } from "@/lib/db";
import { requireAdminAction } from "@/lib/server/admin-auth";
import { notifyNewApplicationInTelegram } from "@/lib/server/telegram-notifier";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

jest.mock("@/lib/db", () => ({
  prisma: {
    siteSetting: { findUnique: jest.fn(), upsert: jest.fn() },
    adminUser: { findUnique: jest.fn(), count: jest.fn(), create: jest.fn(), update: jest.fn() },
    notificationLog: { findUniqueOrThrow: jest.fn(), updateMany: jest.fn(), update: jest.fn() },
  },
}));
jest.mock("@node-rs/argon2", () => ({ hash: jest.fn().mockResolvedValue("hashed-password") }));
jest.mock("@/lib/server/admin-auth", () => ({ requireAdminAction: jest.fn() }));
jest.mock("@/lib/server/admin-audit", () => ({ writeAdminAudit: jest.fn() }));
jest.mock("@/lib/server/telegram-notifier", () => ({
  notifyNewApplicationInTelegram: jest.fn(),
  notifyNewVacancyResponseInTelegram: jest.fn(),
  sendTelegramConnectivityTest: jest.fn(),
}));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("next/navigation", () => ({ redirect: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(requireAdminAction).mockResolvedValue({ id: "actor" } as never);
  jest.mocked(prisma.siteSetting.findUnique).mockResolvedValue(null);
  jest.mocked(redirect).mockImplementation((path) => {
    throw new Error(`redirect:${path}`);
  });
  jest
    .mocked(prisma.notificationLog.findUniqueOrThrow)
    .mockResolvedValue({
      eventType: "NEW_APPLICATION",
      channel: "TELEGRAM",
      status: "FAILED",
      applicationId: "app-1",
    } as never);
  jest.mocked(prisma.notificationLog.updateMany).mockResolvedValue({ count: 1 });
  jest.mocked(notifyNewApplicationInTelegram).mockResolvedValue(true);
});

function form(values: Record<string, string>) {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
}

function settings(overrides: Record<string, string> = {}) {
  const values: Record<string, string> = {
    heroTitle: "Детский сад для детей",
    heroSubtitle: "Развитие и поддержка каждого ребёнка",
    heroImageUrl: "",
    heroImageAlt: "Занятие с ребёнком",
    phone: "+996 502 114 888",
    instagram: "",
    facebook: "",
    threads: "",
    branchTitle: "Главный филиал",
    branchAddress: "г. Бишкек",
    branchLat: "42.83",
    branchLng: "74.57",
  };
  for (const key of ["ras", "zprr", "adhd", "down"]) {
    values[`audience.${key}.title`] = key.toUpperCase();
    values[`audience.${key}.description`] = "Индивидуальный подход к развитию";
  }
  return form({ ...values, ...overrides });
}

it("preserves extra branches and settings not represented by the editor", async () => {
  const second = { title: "Второй филиал", address: "Другой адрес", lat: 42, lng: 74 };
  jest
    .mocked(prisma.siteSetting.findUnique)
    .mockResolvedValue({
      data: {
        extraSetting: "keep",
        branches: [{ title: "Старый", mapUrl: "https://maps.example.com" }, second],
      },
    } as never);
  expect(await saveSiteSettings({}, settings())).toMatchObject({ success: true });
  expect(prisma.siteSetting.upsert).toHaveBeenCalledWith(
    expect.objectContaining({
      update: expect.objectContaining({
        data: expect.objectContaining({
          extraSetting: "keep",
          branches: [
            expect.objectContaining({
              title: "Главный филиал",
              mapUrl: "https://maps.example.com",
            }),
            second,
          ],
        }),
      }),
    }),
  );
  expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
});

it.each([
  ["phone", "not-a-phone"],
  ["instagram", "javascript:alert(1)"],
  ["branchLat", ""],
  ["branchLng", "181"],
])("rejects invalid setting %s and identifies the field", async (key, value) => {
  expect(await saveSiteSettings({}, settings({ [key]: value }))).toMatchObject({
    fieldErrors: { [key]: expect.any(String) },
  });
  expect(prisma.siteSetting.upsert).not.toHaveBeenCalled();
});

it("protects the current administrator from disabling their own access", async () => {
  expect(
    await saveAdminUser(
      {},
      form({ id: "actor", name: "Admin", login: "admin", role: "CONTENT_MANAGER" }),
    ),
  ).toMatchObject({ message: expect.stringContaining("собственную") });
  expect(prisma.adminUser.update).not.toHaveBeenCalled();
});

it("does not create an account with a short password", async () => {
  expect(
    await saveAdminUser(
      {},
      form({
        name: "New admin",
        login: "newadmin",
        role: "CONTENT_MANAGER",
        password: "short",
        active: "on",
      }),
    ),
  ).toMatchObject({ fieldErrors: { password: expect.any(String) } });
  expect(prisma.adminUser.create).not.toHaveBeenCalled();
});

it("resolves the original failed delivery after a successful retry", async () => {
  await expect(retryNotification(form({ id: "delivery-1" }))).rejects.toThrow(
    "redirect:/admin/notifications?retried=1",
  );
  expect(prisma.notificationLog.updateMany).toHaveBeenCalledWith({
    where: { id: "delivery-1", status: "FAILED" },
    data: { status: "PENDING", retryCount: { increment: 1 } },
  });
  expect(prisma.notificationLog.update).toHaveBeenCalledWith({
    where: { id: "delivery-1" },
    data: { status: "SENT", error: null },
  });
});

it("retains a failed retry as retryable when Telegram is disabled", async () => {
  jest.mocked(notifyNewApplicationInTelegram).mockResolvedValue(false);
  await expect(retryNotification(form({ id: "delivery-1" }))).rejects.toThrow("retryError=1");
  expect(prisma.notificationLog.update).toHaveBeenCalledWith({
    where: { id: "delivery-1" },
    data: expect.objectContaining({ status: "FAILED" }),
  });
});

it("does not send a second message when another request already claimed the retry", async () => {
  jest.mocked(prisma.notificationLog.updateMany).mockResolvedValue({ count: 0 });
  await expect(retryNotification(form({ id: "delivery-1" }))).rejects.toThrow("retryError=1");
  expect(notifyNewApplicationInTelegram).not.toHaveBeenCalled();
});

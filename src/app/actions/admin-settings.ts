"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hash } from "@node-rs/argon2";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { optionalImageUrlSchema, optionalWebUrlSchema } from "@/lib/admin-content-validation";
import { requireAdminAction } from "@/lib/server/admin-auth";
import { writeAdminAudit } from "@/lib/server/admin-audit";
import {
  notifyNewApplicationInTelegram,
  notifyNewVacancyResponseInTelegram,
  sendTelegramConnectivityTest,
} from "@/lib/server/telegram-notifier";

const siteSettingsSchema = z.object({
  heroTitle: z.string().trim().min(5).max(200),
  heroSubtitle: z.string().trim().min(10).max(500),
  heroImageUrl: optionalImageUrlSchema,
  heroImageAlt: z.string().trim().min(3).max(200),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine(
      (value) => /^\+\d{8,15}$/.test(value.replace(/[\s()-]/g, "")),
      "Укажите телефон с кодом страны, например +996 502 114 888",
    ),
  instagram: optionalWebUrlSchema,
  facebook: optionalWebUrlSchema,
  threads: optionalWebUrlSchema,
  branchTitle: z.string().trim().min(2).max(120),
  branchAddress: z.string().trim().min(2).max(240),
  branchLat: z
    .string()
    .trim()
    .min(1, "Укажите широту")
    .transform(Number)
    .pipe(z.number().min(-90).max(90)),
  branchLng: z
    .string()
    .trim()
    .min(1, "Укажите долготу")
    .transform(Number)
    .pipe(z.number().min(-180).max(180)),
  audience: z
    .array(
      z.object({
        key: z.string(),
        title: z.string().trim().min(2).max(120),
        description: z.string().trim().min(10).max(500),
      }),
    )
    .length(4),
});

export type AdminSettingsState = {
  message?: string;
  success?: boolean;
  fieldErrors?: Record<string, string>;
};

function stringValue(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function mapErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

export async function saveSiteSettings(
  _previousState: AdminSettingsState,
  formData: FormData,
): Promise<AdminSettingsState> {
  const actor = await requireAdminAction("settings");
  const audienceKeys = ["ras", "zprr", "adhd", "down"];
  const parsed = siteSettingsSchema.safeParse({
    heroTitle: stringValue(formData, "heroTitle"),
    heroSubtitle: stringValue(formData, "heroSubtitle"),
    heroImageUrl: stringValue(formData, "heroImageUrl"),
    heroImageAlt: stringValue(formData, "heroImageAlt"),
    phone: stringValue(formData, "phone"),
    instagram: stringValue(formData, "instagram"),
    facebook: stringValue(formData, "facebook"),
    threads: stringValue(formData, "threads"),
    branchTitle: stringValue(formData, "branchTitle"),
    branchAddress: stringValue(formData, "branchAddress"),
    branchLat: stringValue(formData, "branchLat"),
    branchLng: stringValue(formData, "branchLng"),
    audience: audienceKeys.map((key) => ({
      key,
      title: stringValue(formData, `audience.${key}.title`),
      description: stringValue(formData, `audience.${key}.description`),
    })),
  });
  if (!parsed.success)
    return { message: "Проверьте настройки сайта", fieldErrors: mapErrors(parsed.error) };
  const data = parsed.data;
  const previous = await prisma.siteSetting.findUnique({
    where: { id: "singleton" },
    select: { data: true },
  });
  const stored = previous?.data;
  const previousData = stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
  const previousBranches = Array.isArray(previousData.branches) ? previousData.branches : [];
  const firstBranch = previousBranches[0];
  const previousBranch =
    firstBranch && typeof firstBranch === "object" && !Array.isArray(firstBranch)
      ? firstBranch
      : {};
  const settingsData = {
    ...previousData,
    hero: {
      title: data.heroTitle,
      subtitle: data.heroSubtitle,
      imageUrl: data.heroImageUrl || undefined,
      imageAlt: data.heroImageAlt,
    },
    audience: data.audience,
    phone: data.phone,
    socials: {
      instagram: data.instagram || undefined,
      facebook: data.facebook || undefined,
      threads: data.threads || undefined,
    },
    branches: [
      {
        ...previousBranch,
        title: data.branchTitle,
        address: data.branchAddress,
        lat: data.branchLat,
        lng: data.branchLng,
      },
      ...previousBranches.slice(1),
    ],
  };
  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: { data: settingsData, updatedById: actor.id },
    create: { id: "singleton", data: settingsData, updatedById: actor.id },
  });
  await writeAdminAudit({
    userId: actor.id,
    action: "site_settings.updated",
    entityType: "SiteSetting",
    entityId: "singleton",
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { success: true, message: "Настройки сайта сохранены" };
}

export async function saveNotificationSettings(formData: FormData): Promise<never> {
  const actor = await requireAdminAction("notifications");
  const chatId = stringValue(formData, "telegramChatId").trim();
  const enabled = formData.get("telegramEnabled") === "on";
  await prisma.notificationConfig.upsert({
    where: { id: "singleton" },
    update: { telegramEnabled: enabled, telegramChatId: chatId || null },
    create: {
      id: "singleton",
      telegramEnabled: enabled,
      telegramChatId: chatId || null,
      emailRecipients: [],
    },
  });
  await writeAdminAudit({
    userId: actor.id,
    action: "notifications.settings_updated",
    entityType: "NotificationConfig",
    entityId: "singleton",
    diff: { telegramEnabled: enabled, chatConfigured: Boolean(chatId) },
  });
  revalidatePath("/admin/notifications");
  redirect("/admin/notifications?saved=1");
}

export async function testTelegramNotification(): Promise<never> {
  const actor = await requireAdminAction("notifications");
  try {
    await sendTelegramConnectivityTest();
  } catch {
    redirect("/admin/notifications?testError=1");
  }
  await writeAdminAudit({
    userId: actor.id,
    action: "notifications.telegram_test_sent",
    entityType: "NotificationConfig",
    entityId: "singleton",
  });
  redirect("/admin/notifications?tested=1");
}

export async function retryNotification(formData: FormData): Promise<never> {
  const actor = await requireAdminAction("notifications");
  const id = z.string().min(1).parse(formData.get("id"));
  const notification = await prisma.notificationLog.findUniqueOrThrow({
    where: { id },
    select: {
      eventType: true,
      channel: true,
      status: true,
      applicationId: true,
      vacancyResponseId: true,
    },
  });
  if (notification.channel !== "TELEGRAM" || notification.status !== "FAILED") {
    redirect("/admin/notifications?retryError=1");
  }
  // Claim the failed delivery so double submissions cannot trigger duplicate sends.
  const claimed = await prisma.notificationLog.updateMany({
    where: { id, status: "FAILED" },
    data: { status: "PENDING", retryCount: { increment: 1 } },
  });
  if (!claimed.count) redirect("/admin/notifications?retryError=1");
  let sent = false;
  try {
    if (notification.eventType === "NEW_APPLICATION" && notification.applicationId) {
      sent = await notifyNewApplicationInTelegram(notification.applicationId);
    } else if (notification.eventType === "NEW_RESPONSE" && notification.vacancyResponseId) {
      sent = await notifyNewVacancyResponseInTelegram(notification.vacancyResponseId);
    }
  } catch {
    await prisma.notificationLog.update({
      where: { id },
      data: { status: "FAILED", error: "Telegram delivery failed" },
    });
    revalidatePath("/admin/notifications");
    redirect("/admin/notifications?retryError=1");
  }
  if (!sent) {
    await prisma.notificationLog.update({
      where: { id },
      data: {
        status: "FAILED",
        error: "Telegram is disabled or the notification reference is unavailable",
      },
    });
    revalidatePath("/admin/notifications");
    redirect("/admin/notifications?retryError=1");
  }
  await prisma.notificationLog.update({
    where: { id },
    data: { status: "SENT", error: null },
  });
  await writeAdminAudit({
    userId: actor.id,
    action: "notification.retried",
    entityType: "NotificationLog",
    entityId: id,
  });
  revalidatePath("/admin/notifications");
  redirect("/admin/notifications?retried=1");
}

const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Укажите имя").max(120),
  login: z
    .string()
    .trim()
    .min(3, "Минимум 3 символа")
    .max(120)
    .regex(/^[a-zA-Z0-9._-]+$/, "Только латиница, цифры, точка, дефис и подчёркивание"),
  email: z.union([z.literal(""), z.email("Некорректный e-mail")]),
  role: z.enum(["ADMIN", "CONTENT_MANAGER"]),
  password: z.string().max(256),
});

export async function saveAdminUser(
  _previousState: AdminSettingsState,
  formData: FormData,
): Promise<AdminSettingsState> {
  const actor = await requireAdminAction("users");
  const parsed = userSchema.safeParse({
    id: stringValue(formData, "id") || undefined,
    name: stringValue(formData, "name"),
    login: stringValue(formData, "login"),
    email: stringValue(formData, "email"),
    role: stringValue(formData, "role"),
    password: stringValue(formData, "password"),
  });
  if (!parsed.success)
    return { message: "Проверьте данные пользователя", fieldErrors: mapErrors(parsed.error) };
  const data = parsed.data;
  if (!data.id && data.password.length < 12)
    return {
      message: "Для нового пользователя нужен пароль не короче 12 символов",
      fieldErrors: { password: "Минимум 12 символов" },
    };
  if (data.password && data.password.length < 12)
    return { message: "Пароль слишком короткий", fieldErrors: { password: "Минимум 12 символов" } };

  const active = formData.get("active") === "on";
  const canViewApplications = formData.get("canViewApplications") === "on";
  const canViewResponses = formData.get("canViewResponses") === "on";
  if (data.id === actor.id && (!active || data.role !== "ADMIN"))
    return { message: "Нельзя отключить или понизить собственную учётную запись" };

  const existing = data.id
    ? await prisma.adminUser.findUnique({
        where: { id: data.id },
        select: { role: true, active: true },
      })
    : null;
  if (data.id && !existing)
    return { message: "Пользователь больше не существует. Обновите список." };
  if (existing?.role === "ADMIN" && existing.active && (!active || data.role !== "ADMIN")) {
    const activeAdmins = await prisma.adminUser.count({ where: { role: "ADMIN", active: true } });
    if (activeAdmins <= 1)
      return { message: "В системе должен остаться хотя бы один активный администратор" };
  }

  try {
    const passwordData = data.password ? { passwordHash: await hash(data.password) } : {};
    const user = data.id
      ? await prisma.adminUser.update({
          where: { id: data.id },
          data: {
            name: data.name,
            login: data.login,
            email: data.email || null,
            role: data.role,
            active,
            canViewApplications,
            canViewResponses,
            ...passwordData,
          },
        })
      : await prisma.adminUser.create({
          data: {
            name: data.name,
            login: data.login,
            email: data.email || null,
            role: data.role,
            active,
            canViewApplications,
            canViewResponses,
            passwordHash: await hash(data.password),
          },
        });
    await writeAdminAudit({
      userId: actor.id,
      action: existing ? "admin_user.updated" : "admin_user.created",
      entityType: "AdminUser",
      entityId: user.id,
      diff: {
        role: user.role,
        active: user.active,
        canViewApplications: user.canViewApplications,
        canViewResponses: user.canViewResponses,
        passwordChanged: Boolean(data.password),
      },
    });
    revalidatePath("/admin/users");
    return { success: true, message: existing ? "Пользователь обновлён" : "Пользователь создан" };
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002")
      return { message: "Логин или e-mail уже используется" };
    throw error;
  }
}

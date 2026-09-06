"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminAction } from "@/lib/server/admin-auth";
import { writeAdminAudit } from "@/lib/server/admin-audit";

export type AdminWorkflowState = {
  success?: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

const applicationWorkflowSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["NEW", "IN_PROGRESS", "CONTACTED", "ENROLLED", "REJECTED", "ARCHIVED"]),
  adminComment: z.string().trim().max(5000).optional(),
  responsibleId: z.string().trim().optional(),
});

const responseWorkflowSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["NEW", "IN_REVIEW", "INVITED", "REJECTED", "ARCHIVED"]),
  adminComment: z.string().trim().max(5000).optional(),
  responsibleId: z.string().trim().optional(),
});

async function validateResponsible(
  responsibleId: string | undefined,
  permission: "canViewApplications" | "canViewResponses",
): Promise<boolean> {
  if (!responsibleId) return true;
  return Boolean(
    await prisma.adminUser.findFirst({
      where: { id: responsibleId, active: true, OR: [{ role: "ADMIN" }, { [permission]: true }] },
      select: { id: true },
    }),
  );
}

function validationFailure(error: z.ZodError): AdminWorkflowState {
  return {
    message: "Проверьте статус, ответственного и длину комментария (до 5000 символов).",
    fieldErrors: Object.fromEntries(
      error.issues.map((issue) => [String(issue.path[0]), issue.message]),
    ),
  };
}

export async function updateApplicationWorkflow(
  _previousState: AdminWorkflowState,
  formData: FormData,
): Promise<AdminWorkflowState> {
  const actor = await requireAdminAction("applications");
  const result = applicationWorkflowSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    adminComment: formData.get("adminComment") ?? "",
    responsibleId: formData.get("responsibleId") ?? "",
  });
  if (!result.success) return validationFailure(result.error);
  const parsed = result.data;
  if (!(await validateResponsible(parsed.responsibleId, "canViewApplications"))) {
    return {
      message: "Выберите активного сотрудника с доступом к заявкам.",
      fieldErrors: { responsibleId: "Сотрудник недоступен для назначения" },
    };
  }
  const before = await prisma.application.findUnique({
    where: { id: parsed.id },
    select: { status: true, adminComment: true, responsibleId: true },
  });
  if (!before) return { message: "Заявка больше не существует. Вернитесь к списку." };
  await prisma.application.update({
    where: { id: parsed.id },
    data: {
      status: parsed.status,
      adminComment: parsed.adminComment || null,
      responsibleId: parsed.responsibleId || null,
    },
  });
  await writeAdminAudit({
    userId: actor.id,
    action: "application.workflow_updated",
    entityType: "Application",
    entityId: parsed.id,
    diff: {
      fromStatus: before.status,
      toStatus: parsed.status,
      commentChanged: before.adminComment !== (parsed.adminComment || null),
      responsibleChanged: before.responsibleId !== (parsed.responsibleId || null),
    },
  });
  revalidatePath(`/admin/applications/${parsed.id}`);
  revalidatePath("/admin/applications");
  revalidatePath("/admin");
  return { success: true, message: "Изменения в заявке сохранены" };
}

export async function updateResponseWorkflow(
  _previousState: AdminWorkflowState,
  formData: FormData,
): Promise<AdminWorkflowState> {
  const actor = await requireAdminAction("responses");
  const result = responseWorkflowSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    adminComment: formData.get("adminComment") ?? "",
    responsibleId: formData.get("responsibleId") ?? "",
  });
  if (!result.success) return validationFailure(result.error);
  const parsed = result.data;
  if (!(await validateResponsible(parsed.responsibleId, "canViewResponses"))) {
    return {
      message: "Выберите активного сотрудника с доступом к откликам.",
      fieldErrors: { responsibleId: "Сотрудник недоступен для назначения" },
    };
  }
  const before = await prisma.vacancyResponse.findUnique({
    where: { id: parsed.id },
    select: { status: true, adminComment: true, responsibleId: true },
  });
  if (!before) return { message: "Отклик больше не существует. Вернитесь к списку." };
  await prisma.vacancyResponse.update({
    where: { id: parsed.id },
    data: {
      status: parsed.status,
      adminComment: parsed.adminComment || null,
      responsibleId: parsed.responsibleId || null,
    },
  });
  await writeAdminAudit({
    userId: actor.id,
    action: "vacancy_response.workflow_updated",
    entityType: "VacancyResponse",
    entityId: parsed.id,
    diff: {
      fromStatus: before.status,
      toStatus: parsed.status,
      commentChanged: before.adminComment !== (parsed.adminComment || null),
      responsibleChanged: before.responsibleId !== (parsed.responsibleId || null),
    },
  });
  revalidatePath(`/admin/responses/${parsed.id}`);
  revalidatePath("/admin/responses");
  revalidatePath("/admin");
  return { success: true, message: "Изменения в отклике сохранены" };
}

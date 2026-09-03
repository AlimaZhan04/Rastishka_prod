"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminAction } from "@/lib/server/admin-auth";
import { writeAdminAudit } from "@/lib/server/admin-audit";

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

export async function updateApplicationWorkflow(formData: FormData): Promise<void> {
  const actor = await requireAdminAction("applications");
  const parsed = applicationWorkflowSchema.parse({
    id: formData.get("id"),
    status: formData.get("status"),
    adminComment: formData.get("adminComment"),
    responsibleId: formData.get("responsibleId"),
  });
  const before = await prisma.application.findUniqueOrThrow({
    where: { id: parsed.id },
    select: { status: true, adminComment: true, responsibleId: true },
  });
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
}

export async function updateResponseWorkflow(formData: FormData): Promise<void> {
  const actor = await requireAdminAction("responses");
  const parsed = responseWorkflowSchema.parse({
    id: formData.get("id"),
    status: formData.get("status"),
    adminComment: formData.get("adminComment"),
    responsibleId: formData.get("responsibleId"),
  });
  const before = await prisma.vacancyResponse.findUniqueOrThrow({
    where: { id: parsed.id },
    select: { status: true, adminComment: true, responsibleId: true },
  });
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
}

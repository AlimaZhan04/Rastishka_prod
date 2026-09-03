import "server-only";

import { prisma } from "@/lib/db";

export async function writeAdminAudit(input: {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  diff?: Record<string, string | number | boolean | null>;
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      diff: input.diff,
    },
  });
}

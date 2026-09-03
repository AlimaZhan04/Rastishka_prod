import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  hasAdminPermission,
  type AdminPermission,
  type CurrentAdmin,
} from "@/lib/admin-permissions";
import { prisma } from "@/lib/db";

export type { AdminPermission, CurrentAdmin } from "@/lib/admin-permissions";
export { hasAdminPermission } from "@/lib/admin-permissions";

export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.adminUser.findFirst({
    where: { id: session.user.id, active: true },
    select: {
      id: true,
      name: true,
      login: true,
      role: true,
      canViewApplications: true,
      canViewResponses: true,
    },
  });
});

export async function requireAdminPage(permission: AdminPermission): Promise<CurrentAdmin> {
  const user = await getCurrentAdmin();
  if (!user) redirect("/admin/login");
  if (!hasAdminPermission(user, permission)) redirect("/admin?denied=1");
  return user;
}

export async function requireAdminAction(permission: AdminPermission): Promise<CurrentAdmin> {
  const user = await getCurrentAdmin();
  if (!user || !hasAdminPermission(user, permission)) {
    throw new Error("Недостаточно прав для выполнения действия");
  }
  return user;
}

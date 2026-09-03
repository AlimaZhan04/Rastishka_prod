import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminUserForm } from "@/components/admin/settings-forms";
import { Badge } from "@/components/ui/badge";
import { ADMIN_ROLE_LABELS, formatAdminDate } from "@/lib/admin-labels";
import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/server/admin-auth";

export default async function UsersPage() {
  await requireAdminPage("users");
  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      login: true,
      email: true,
      role: true,
      active: true,
      canViewApplications: true,
      canViewResponses: true,
      lastLoginAt: true,
    },
  });
  return (
    <>
      <AdminPageHeader title="Пользователи" description="Роли и доступ к персональным данным." />
      <section className="mb-7">
        <h2 className="font-heading text-primary mb-4 text-xl font-bold">Новый пользователь</h2>
        <AdminUserForm />
      </section>
      <section className="space-y-4">
        <h2 className="font-heading text-primary text-xl font-bold">Учётные записи</h2>
        {users.map((user) => (
          <details key={user.id} className="border-border bg-card rounded-2xl border p-5">
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
              <span>
                <span className="font-semibold">{user.name}</span>
                <span className="text-muted-foreground ml-2 text-sm">@{user.login}</span>
              </span>
              <span className="flex items-center gap-2">
                <Badge variant={user.active ? "secondary" : "outline"}>
                  {user.active ? "Активен" : "Отключён"}
                </Badge>
                <Badge variant="outline">{ADMIN_ROLE_LABELS[user.role]}</Badge>
              </span>
            </summary>
            <p className="text-muted-foreground mt-3 mb-4 text-xs">
              Последний вход:{" "}
              {user.lastLoginAt ? formatAdminDate(user.lastLoginAt) : "ещё не входил"}
            </p>
            <AdminUserForm user={user} />
          </details>
        ))}
      </section>
    </>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";
import {
  Bell,
  BriefcaseBusiness,
  FileText,
  Home,
  LayoutDashboard,
  Newspaper,
  Settings,
  Users,
} from "lucide-react";
import { logoutAdmin } from "@/app/actions/admin-auth";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  hasAdminPermission,
  type AdminPermission,
  type CurrentAdmin,
} from "@/lib/server/admin-auth";

const navItems: Array<{
  href: string;
  label: string;
  permission: AdminPermission;
  icon: typeof Home;
}> = [
  { href: "/admin", label: "Обзор", permission: "dashboard", icon: LayoutDashboard },
  { href: "/admin/applications", label: "Заявки", permission: "applications", icon: FileText },
  { href: "/admin/responses", label: "Отклики", permission: "responses", icon: BriefcaseBusiness },
  { href: "/admin/news", label: "Новости", permission: "content", icon: Newspaper },
  { href: "/admin/vacancies", label: "Вакансии", permission: "content", icon: BriefcaseBusiness },
  { href: "/admin/settings", label: "Сайт", permission: "settings", icon: Settings },
  { href: "/admin/notifications", label: "Уведомления", permission: "notifications", icon: Bell },
  { href: "/admin/users", label: "Пользователи", permission: "users", icon: Users },
];

export function AdminShell({ user, children }: { user: CurrentAdmin; children: ReactNode }) {
  const availableItems = navItems.filter((item) => hasAdminPermission(user, item.permission));

  return (
    <div className="bg-muted/35 min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <aside className="border-border bg-card border-b md:min-h-screen md:border-r md:border-b-0">
        <div className="border-border flex h-18 items-center border-b px-5">
          <Logo />
        </div>
        <nav className="flex gap-1 overflow-x-auto p-3 md:flex-col" aria-label="Админ-навигация">
          {availableItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="text-foreground hover:bg-secondary hover:text-primary flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors"
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0">
        <header className="border-border bg-background/90 flex min-h-18 items-center justify-between gap-4 border-b px-4 py-3 backdrop-blur md:px-7">
          <div className="min-w-0">
            <p className="truncate font-semibold">{user.name}</p>
            <p className="text-muted-foreground text-xs">
              {user.role === "ADMIN" ? "Администратор" : "Контент-менеджер"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" render={<Link href="/" />}>
              На сайт
            </Button>
            <form action={logoutAdmin}>
              <Button variant="ghost" size="sm" type="submit">
                Выйти
              </Button>
            </form>
          </div>
        </header>
        <main className="p-4 md:p-7">{children}</main>
      </div>
    </div>
  );
}

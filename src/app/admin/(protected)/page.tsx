import Link from "next/link";
import { BriefcaseBusiness, FileText, Newspaper, Users } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/server/admin-auth";

export default async function AdminDashboardPage() {
  const user = await requireAdminPage("dashboard");
  const [applications, responses, news, vacancies, users] = await Promise.all([
    user.role === "ADMIN" || user.canViewApplications ? prisma.application.count() : null,
    user.role === "ADMIN" || user.canViewResponses ? prisma.vacancyResponse.count() : null,
    prisma.news.count(),
    prisma.vacancy.count(),
    user.role === "ADMIN" ? prisma.adminUser.count() : null,
  ]);

  const cards = [
    { label: "Заявки", value: applications, href: "/admin/applications", icon: FileText },
    { label: "Отклики", value: responses, href: "/admin/responses", icon: BriefcaseBusiness },
    { label: "Новости", value: news, href: "/admin/news", icon: Newspaper },
    { label: "Вакансии", value: vacancies, href: "/admin/vacancies", icon: BriefcaseBusiness },
    { label: "Пользователи", value: users, href: "/admin/users", icon: Users },
  ].filter((item) => item.value !== null);

  return (
    <>
      <AdminPageHeader
        title="Обзор"
        description="Заявки, контент и настройки сайта в одном месте."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card className="hover:ring-primary/30 h-full transition-shadow">
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>{item.label}</CardTitle>
                  <Icon className="text-primary size-5" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <p className="font-heading text-primary text-4xl font-extrabold">{item.value}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}

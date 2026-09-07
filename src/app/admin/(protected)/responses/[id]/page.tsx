import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { WorkflowForm } from "@/components/admin/workflow-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { formatAdminDate } from "@/lib/admin-labels";
import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/server/admin-auth";
import { getResumeDownloadUrl } from "@/lib/server/resume-storage";

export default async function ResponseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage("responses");
  const { id } = await params;
  const [response, admins] = await Promise.all([
    prisma.vacancyResponse.findUnique({
      where: { id },
      include: { vacancy: { select: { title: true } } },
    }),
    prisma.adminUser.findMany({
      where: { active: true, OR: [{ role: "ADMIN" }, { canViewResponses: true }] },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!response) notFound();
  const resumeUrl = response.resumeFilePath
    ? await getResumeDownloadUrl(response.resumeFilePath)
    : null;

  return (
    <>
      <AdminPageHeader
        title={`Отклик · ${response.name}`}
        description={`${response.vacancy.title} · ${formatAdminDate(response.createdAt)}`}
        action={
          <Button variant="outline" render={<Link href="/admin/responses" />}>
            К списку
          </Button>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="border-border bg-card rounded-2xl border p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-primary text-xl font-bold">Данные кандидата</h2>
            <StatusBadge status={response.status} />
          </div>
          <dl className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground text-xs font-semibold uppercase">ФИО</dt>
              <dd className="mt-1">{response.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs font-semibold uppercase">Телефон</dt>
              <dd className="mt-1">{response.phone}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground text-xs font-semibold uppercase">Опыт</dt>
              <dd className="mt-1 whitespace-pre-wrap">{response.experienceText ?? "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground text-xs font-semibold uppercase">Резюме</dt>
              <dd className="mt-1">
                {response.resumeFileName ? (
                  resumeUrl ? (
                    <a className="text-primary font-semibold underline" href={resumeUrl}>
                      Скачать {response.resumeFileName}
                    </a>
                  ) : (
                    `${response.resumeFileName} · хранилище недоступно`
                  )
                ) : (
                  "Не приложено"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs font-semibold uppercase">Источник</dt>
              <dd className="mt-1">{response.sourcePage ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs font-semibold uppercase">Согласие</dt>
              <dd className="mt-1">
                {response.consentGiven ? `Получено · ${response.consentVersion}` : "Нет"}
              </dd>
            </div>
          </dl>
        </section>
        <WorkflowForm kind="response" record={response} admins={admins} />
      </div>
    </>
  );
}

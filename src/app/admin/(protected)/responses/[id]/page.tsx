import Link from "next/link";
import { notFound } from "next/navigation";
import { updateResponseWorkflow } from "@/app/actions/admin-workflow";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatAdminDate, RESPONSE_STATUS_LABELS } from "@/lib/admin-labels";
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
      where: { active: true },
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
        <form
          action={updateResponseWorkflow}
          className="border-border bg-card h-fit space-y-5 rounded-2xl border p-5"
        >
          <input type="hidden" name="id" value={response.id} />
          <h2 className="font-heading text-primary text-xl font-bold">Работа с откликом</h2>
          <div className="space-y-2">
            <Label htmlFor="response-status">Статус</Label>
            <select
              id="response-status"
              name="status"
              defaultValue={response.status}
              className="border-input bg-background h-11 w-full rounded-xl border px-3 text-sm"
            >
              {Object.entries(RESPONSE_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="response-responsible">Ответственный</Label>
            <select
              id="response-responsible"
              name="responsibleId"
              defaultValue={response.responsibleId ?? ""}
              className="border-input bg-background h-11 w-full rounded-xl border px-3 text-sm"
            >
              <option value="">Не назначен</option>
              {admins.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="response-comment">Внутренний комментарий</Label>
            <Textarea
              id="response-comment"
              name="adminComment"
              defaultValue={response.adminComment ?? ""}
              maxLength={5000}
            />
          </div>
          <Button type="submit" className="w-full">
            Сохранить
          </Button>
        </form>
      </div>
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { updateApplicationWorkflow } from "@/app/actions/admin-workflow";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { APPLICATION_STATUS_LABELS, formatAdminDate } from "@/lib/admin-labels";
import {
  BEHAVIOR_LABELS,
  EXPERIENCE_LABELS,
  FOOD_LABELS,
  SPEECH_LABELS,
  TOILET_LABELS,
  VISIT_FORMAT_LABELS,
} from "@/lib/enums";
import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/server/admin-auth";

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs font-semibold uppercase">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap">{children || "—"}</dd>
    </div>
  );
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage("applications");
  const { id } = await params;
  const [application, admins] = await Promise.all([
    prisma.application.findUnique({
      where: { id },
      include: { childProfile: true },
    }),
    prisma.adminUser.findMany({
      where: { active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!application) notFound();

  return (
    <>
      <AdminPageHeader
        title={`Заявка · ${application.parentName}`}
        description={formatAdminDate(application.createdAt)}
        action={
          <Button variant="outline" render={<Link href="/admin/applications" />}>
            К списку
          </Button>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <section className="border-border bg-card rounded-2xl border p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-heading text-primary text-xl font-bold">Исходные ответы</h2>
              <StatusBadge status={application.status} />
            </div>
            <dl className="mt-5 grid gap-5 sm:grid-cols-2">
              <Detail label="Родитель">{application.parentName}</Detail>
              <Detail label="Телефон">{application.phone}</Detail>
              <Detail label="Формат">{VISIT_FORMAT_LABELS[application.visitFormat]}</Detail>
              <Detail label="Пожелания по графику">{application.individualNote}</Detail>
              <Detail label="Речь">{SPEECH_LABELS[application.speech]}</Detail>
              <Detail label="Поведение">{BEHAVIOR_LABELS[application.behavior]}</Detail>
              <Detail label="Комментарий о поведении">{application.behaviorNote}</Detail>
              <Detail label="Туалет">{TOILET_LABELS[application.toilet]}</Detail>
              <Detail label="Питание">
                {application.food.map((item) => FOOD_LABELS[item]).join(", ")}
              </Detail>
              <Detail label="Предыдущий опыт">
                {EXPERIENCE_LABELS[application.previousExperience]}
              </Detail>
              <Detail label="Источник">
                {application.sourcePage ?? "—"}{" "}
                {application.sourceCta ? `· ${application.sourceCta}` : ""}
              </Detail>
              <Detail label="Согласие">
                {application.consentGiven ? `Получено · ${application.consentVersion}` : "Нет"}
              </Detail>
            </dl>
          </section>

          {application.childProfile ? (
            <section className="border-border bg-card rounded-2xl border p-5">
              <h2 className="font-heading text-primary text-xl font-bold">Профиль ребёнка</h2>
              <dl className="mt-5 grid gap-5">
                <Detail label="Речь">{application.childProfile.speechLevelText}</Detail>
                <Detail label="Поведение">{application.childProfile.behaviorNotes}</Detail>
                <Detail label="Самостоятельность">{application.childProfile.selfCare}</Detail>
                <Detail label="Питание">{application.childProfile.foodNotes}</Detail>
                <Detail label="Адаптация">{application.childProfile.adaptationExperience}</Detail>
                <Detail label="Возможный маршрут">
                  {application.childProfile.recommendedRoute}
                </Detail>
              </dl>
            </section>
          ) : null}
        </div>

        <form
          action={updateApplicationWorkflow}
          className="border-border bg-card h-fit space-y-5 rounded-2xl border p-5"
        >
          <input type="hidden" name="id" value={application.id} />
          <h2 className="font-heading text-primary text-xl font-bold">Работа с заявкой</h2>
          <div className="space-y-2">
            <Label htmlFor="application-status">Статус</Label>
            <select
              id="application-status"
              name="status"
              defaultValue={application.status}
              className="border-input bg-background h-11 w-full rounded-xl border px-3 text-sm"
            >
              {Object.entries(APPLICATION_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="application-responsible">Ответственный</Label>
            <select
              id="application-responsible"
              name="responsibleId"
              defaultValue={application.responsibleId ?? ""}
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
            <Label htmlFor="application-comment">Внутренний комментарий</Label>
            <Textarea
              id="application-comment"
              name="adminComment"
              defaultValue={application.adminComment ?? ""}
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

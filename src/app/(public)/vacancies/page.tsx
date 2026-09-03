import type { Metadata } from "next";
import { VacancyCard } from "@/components/content/vacancy-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageIntro } from "@/components/layout/page-intro";
import { listPublishedVacancies } from "@/lib/content/vacancies";

export const metadata: Metadata = {
  title: "Вакансии",
  description: "Открытые вакансии детского сада «РАСтишка».",
};

export default async function VacanciesPage() {
  const vacancies = await listPublishedVacancies();

  return (
    <>
      <PageIntro
        eyebrow="Работа в РАСтишке"
        title="Наши вакансии"
        description="Мы ищем внимательных специалистов, которым близка бережная работа с детьми и семьями."
      >
        <Breadcrumbs items={[{ label: "Вакансии" }]} />
      </PageIntro>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
        {vacancies.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {vacancies.map((vacancy) => (
              <VacancyCard key={vacancy.id} vacancy={vacancy} headingLevel={2} />
            ))}
          </div>
        ) : (
          <div className="border-brand-mint/35 shadow-soft mx-auto max-w-2xl rounded-[1.6rem] border bg-white/80 p-8 text-center">
            <p className="font-heading text-primary text-xl font-bold">
              Сейчас открытых вакансий нет
            </p>
            <p className="text-muted-foreground mt-2 leading-7">
              Следите за обновлениями — новые позиции появятся здесь.
            </p>
          </div>
        )}
      </section>
    </>
  );
}

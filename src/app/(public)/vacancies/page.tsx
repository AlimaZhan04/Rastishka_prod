import type { Metadata } from "next";
import { VacancyCard } from "@/components/content/vacancy-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { listPublishedVacancies } from "@/lib/content/vacancies";

export const metadata: Metadata = {
  title: "Вакансии",
  description: "Открытые вакансии детского сада «РАСтишка».",
};

export default async function VacanciesPage() {
  const vacancies = await listPublishedVacancies();

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <Breadcrumbs items={[{ label: "Вакансии" }]} />
      <p className="text-primary text-sm font-semibold tracking-wide uppercase">
        Работа в РАСтишке
      </p>
      <h1 className="font-heading text-primary mt-1 text-4xl font-extrabold">Вакансии</h1>
      <p className="text-muted-foreground mt-4 max-w-2xl">
        Мы ищем внимательных специалистов, которым близка бережная работа с детьми и семьями.
      </p>

      {vacancies.length ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {vacancies.map((vacancy) => (
            <VacancyCard key={vacancy.id} vacancy={vacancy} />
          ))}
        </div>
      ) : (
        <p className="bg-muted text-muted-foreground mt-8 rounded-xl p-5">
          Сейчас открытых вакансий нет. Следите за обновлениями на этой странице.
        </p>
      )}
    </section>
  );
}

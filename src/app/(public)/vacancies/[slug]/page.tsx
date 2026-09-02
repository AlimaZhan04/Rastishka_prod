import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VacancyResponseForm } from "@/components/vacancies/vacancy-response-form";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getPublishedVacancyBySlug } from "@/lib/content/vacancies";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const vacancy = await getPublishedVacancyBySlug(slug);
  if (!vacancy) return {};
  return {
    title: vacancy.seoTitle || vacancy.title,
    description: vacancy.seoDescription || vacancy.preview,
  };
}

export default async function VacancyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const vacancy = await getPublishedVacancyBySlug(slug);
  if (!vacancy) notFound();

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.1fr_0.9fr] md:py-16">
      <article>
        <Breadcrumbs
          items={[{ label: "Вакансии", href: "/vacancies" }, { label: vacancy.title }]}
        />
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">Вакансия</p>
        <h1 className="font-heading text-primary mt-1 text-4xl leading-tight font-extrabold md:text-5xl">
          {vacancy.title}
        </h1>
        <p className="text-muted-foreground mt-4 text-lg">{vacancy.preview}</p>

        <div className="mt-9 space-y-7">
          <section>
            <h2 className="font-heading text-primary text-2xl font-bold">Обязанности</h2>
            <p className="text-foreground mt-2 leading-7 whitespace-pre-line">{vacancy.duties}</p>
          </section>
          <section>
            <h2 className="font-heading text-primary text-2xl font-bold">Что важно для нас</h2>
            <p className="text-foreground mt-2 leading-7 whitespace-pre-line">
              {vacancy.requirements}
            </p>
          </section>
          <section>
            <h2 className="font-heading text-primary text-2xl font-bold">Что мы предлагаем</h2>
            <p className="text-foreground mt-2 leading-7 whitespace-pre-line">{vacancy.offer}</p>
          </section>
        </div>
      </article>

      <aside className="bg-muted/60 shadow-soft h-fit rounded-2xl p-5 md:sticky md:top-22 md:p-7">
        <h2 className="font-heading text-primary text-2xl font-bold">Откликнуться</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-5">
          Оставьте контакты и приложите резюме или расскажите об опыте.
        </p>
        <div className="mt-5">
          <VacancyResponseForm vacancyId={vacancy.id} sourcePage={`/vacancies/${vacancy.slug}`} />
        </div>
      </aside>
    </section>
  );
}

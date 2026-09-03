import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";
import { DoodleHeart } from "@/components/brand/brand-motifs";
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
    <section className="relative isolate overflow-hidden">
      <div
        className="bg-brand-rose/65 pointer-events-none absolute -top-32 -left-28 -z-10 size-96 rounded-full"
        aria-hidden="true"
      />
      <div
        className="bg-brand-mint-soft/75 pointer-events-none absolute top-52 -right-32 -z-10 size-96 rounded-full blur-sm"
        aria-hidden="true"
      />
      <DoodleHeart className="text-brand-pink/45 absolute top-32 right-[5%] hidden size-14 rotate-12 xl:block" />

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-6 md:py-16 lg:grid-cols-[1.12fr_0.88fr] lg:items-start lg:gap-10 lg:px-8">
        <article className="border-brand-mint/30 rounded-[2rem] border bg-white/78 p-6 shadow-sm backdrop-blur-sm sm:p-9">
          <Breadcrumbs
            items={[{ label: "Вакансии", href: "/vacancies" }, { label: vacancy.title }]}
          />
          <p className="text-brand-teal bg-brand-mint-soft/80 mt-5 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold">
            <Sparkles className="size-4" aria-hidden="true" /> Открытая вакансия
          </p>
          <h1 className="font-heading text-primary mt-4 text-4xl leading-[1.08] font-extrabold tracking-[-0.02em] text-balance md:text-5xl">
            {vacancy.title}
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl text-lg leading-7">
            {vacancy.preview}
          </p>

          <div className="mt-9 space-y-4">
            <section className="bg-brand-cream/75 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="bg-brand-mint-soft text-brand-teal grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold">
                  01
                </span>
                <h2 className="font-heading text-primary text-2xl font-bold">Обязанности</h2>
              </div>
              <p className="text-foreground mt-3 leading-7 whitespace-pre-line">{vacancy.duties}</p>
            </section>
            <section className="bg-brand-mint-soft/60 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="text-brand-teal grid size-9 shrink-0 place-items-center rounded-full bg-white text-sm font-bold shadow-sm">
                  02
                </span>
                <h2 className="font-heading text-primary text-2xl font-bold">Что важно для нас</h2>
              </div>
              <p className="text-foreground mt-3 leading-7 whitespace-pre-line">
                {vacancy.requirements}
              </p>
            </section>
            <section className="bg-secondary/70 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="text-primary grid size-9 shrink-0 place-items-center rounded-full bg-white text-sm font-bold shadow-sm">
                  03
                </span>
                <h2 className="font-heading text-primary text-2xl font-bold">Что мы предлагаем</h2>
              </div>
              <p className="text-foreground mt-3 leading-7 whitespace-pre-line">{vacancy.offer}</p>
            </section>
          </div>
        </article>

        <aside className="from-brand-mint-soft/85 to-secondary/75 shadow-soft border-brand-mint/45 h-fit rounded-[2rem] border bg-gradient-to-br via-white/92 p-5 sm:p-7 lg:sticky lg:top-24">
          <h2 className="font-heading text-primary text-2xl font-bold">Откликнуться</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-5">
            Оставьте контакты и приложите резюме или расскажите об опыте.
          </p>
          <div className="mt-5">
            <VacancyResponseForm vacancyId={vacancy.id} sourcePage={`/vacancies/${vacancy.slug}`} />
          </div>
        </aside>
      </div>
    </section>
  );
}

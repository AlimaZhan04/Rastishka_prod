import type { Metadata } from "next";
import { NewsCard } from "@/components/content/news-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageIntro } from "@/components/layout/page-intro";
import { listPublishedNews } from "@/lib/content/news";

export const metadata: Metadata = {
  title: "Новости",
  description: "Новости и события детского сада «РАСтишка».",
};

export default async function NewsPage() {
  const news = await listPublishedNews();

  return (
    <>
      <PageIntro
        eyebrow="Жизнь РАСтишки"
        title="Новости и объявления"
        description="Рассказываем о занятиях, событиях и важных изменениях в нашем детском саду."
      >
        <Breadcrumbs items={[{ label: "Новости" }]} />
      </PageIntro>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
        {news.length ? (
          <div className="grid gap-5 lg:grid-cols-[1.18fr_0.82fr]">
            {news.map((item, index) => (
              <NewsCard
                key={item.slug}
                item={item}
                featured={index === 0}
                headingLevel={2}
                eagerImage={index === 0}
              />
            ))}
          </div>
        ) : (
          <div className="border-brand-mint/35 shadow-soft mx-auto max-w-2xl rounded-[1.6rem] border bg-white/80 p-8 text-center">
            <p className="font-heading text-primary text-xl font-bold">Новости скоро появятся</p>
            <p className="text-muted-foreground mt-2 leading-7">
              Мы готовим истории о занятиях и событиях. А пока загляните в наши социальные сети.
            </p>
          </div>
        )}
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { NewsCard } from "@/components/content/news-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { listPublishedNews } from "@/lib/content/news";

export const metadata: Metadata = {
  title: "Новости",
  description: "Новости и события детского сада «РАСтишка».",
};

export default async function NewsPage() {
  const news = await listPublishedNews();

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <Breadcrumbs items={[{ label: "Новости" }]} />
      <p className="text-primary text-sm font-semibold tracking-wide uppercase">Жизнь РАСтишки</p>
      <h1 className="font-heading text-primary mt-1 text-4xl font-extrabold">Новости</h1>
      <p className="text-muted-foreground mt-4 max-w-2xl">
        Рассказываем о занятиях, событиях и важных изменениях в нашем детском саду.
      </p>

      {news.length ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <NewsCard key={item.slug} item={item} />
          ))}
        </div>
      ) : (
        <p className="bg-muted text-muted-foreground mt-8 rounded-xl p-5">
          Пока нет опубликованных новостей.
        </p>
      )}
    </section>
  );
}

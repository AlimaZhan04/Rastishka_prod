import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentDate } from "@/components/content/content-date";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getPublishedNewsBySlug } from "@/lib/content/news";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublishedNewsBySlug(slug);
  if (!item) return {};
  return {
    title: item.seoTitle || item.title,
    description: item.seoDescription || item.shortText,
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getPublishedNewsBySlug(slug);
  if (!item) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <Breadcrumbs items={[{ label: "Новости", href: "/news" }, { label: item.title }]} />
      <p className="text-muted-foreground text-sm font-medium">
        <ContentDate value={item.date} />
      </p>
      <h1 className="font-heading text-primary mt-3 text-4xl leading-tight font-extrabold md:text-5xl">
        {item.title}
      </h1>
      {item.image ? (
        <div
          role="img"
          aria-label={item.alt || item.title}
          className="shadow-soft mt-7 aspect-[16/9] rounded-2xl bg-cover bg-center"
          style={{ backgroundImage: `url("${item.image}")` }}
        />
      ) : null}
      <div className="text-foreground mt-8 text-base leading-7 whitespace-pre-line">
        {item.fullText}
      </div>
    </article>
  );
}

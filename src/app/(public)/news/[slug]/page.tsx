import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { ContentDate } from "@/components/content/content-date";
import { DoodleHeart } from "@/components/brand/brand-motifs";
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
    <section className="relative isolate overflow-hidden">
      <div
        className="bg-brand-mint-soft/70 pointer-events-none absolute -top-28 -right-24 -z-10 size-80 rounded-full blur-sm"
        aria-hidden="true"
      />
      <DoodleHeart className="text-brand-pink/45 absolute top-28 left-[4%] hidden size-14 -rotate-12 lg:block" />

      <article className="mx-auto max-w-5xl px-5 py-10 sm:px-6 md:py-16 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Breadcrumbs items={[{ label: "Новости", href: "/news" }, { label: item.title }]} />
          <p className="text-brand-teal bg-brand-mint-soft/75 mt-5 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold">
            <CalendarDays className="size-4" aria-hidden="true" />
            <ContentDate value={item.date} />
          </p>
          <h1 className="font-heading text-primary mt-4 text-4xl leading-[1.08] font-extrabold tracking-[-0.02em] text-balance md:text-5xl">
            {item.title}
          </h1>
          <p className="text-muted-foreground mt-4 text-lg leading-7">{item.shortText}</p>
        </div>

        {item.image ? (
          <div
            role="img"
            aria-label={item.alt || item.title}
            className="shadow-soft mt-8 aspect-[16/9] rounded-[2rem] border-4 border-white/90 bg-cover bg-center"
            style={{ backgroundImage: `url("${item.image}")` }}
          />
        ) : (
          <div className="shadow-soft relative mt-8 aspect-[16/9] overflow-hidden rounded-[2rem] border-4 border-white/90">
            <Image
              src="/images/rastishka-hero-v1.png"
              alt="Тёплое развивающее занятие в РАСтишке"
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 1023px) 92vw, 64rem"
              className="object-cover"
            />
            <div
              className="from-primary/12 absolute inset-0 bg-gradient-to-t via-transparent to-white/10"
              aria-hidden="true"
            />
          </div>
        )}

        <div className="border-brand-mint/35 text-foreground mx-auto mt-8 max-w-3xl rounded-[1.75rem] border bg-white/78 p-6 text-base leading-8 whitespace-pre-line shadow-sm sm:p-9">
          {item.fullText}
        </div>
      </article>
    </section>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NewsCard } from "@/components/content/news-card";
import type { PublicNewsItem } from "@/lib/content/news";

export function LatestNewsSection({ items }: { items: PublicNewsItem[] }) {
  if (items.length === 0) return null;

  return (
    <section
      className="bg-brand-mint-soft/38 relative overflow-hidden border-y border-white/70 py-14 sm:py-18"
      aria-labelledby="latest-news-title"
    >
      <div
        className="bg-brand-mint/20 pointer-events-none absolute top-10 -left-28 size-64 rounded-[48%_52%_61%_39%/57%_35%_65%_43%]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div className="reveal-on-scroll">
            <p className="text-brand-teal text-sm font-bold tracking-[0.16em] uppercase">
              Жизнь РАСтишки
            </p>
            <h2
              id="latest-news-title"
              className="font-heading text-primary mt-2 text-3xl font-extrabold text-balance sm:text-4xl"
            >
              Последние новости
            </h2>
          </div>
          <Link
            href="/news"
            className="text-primary focus-visible:ring-ring/40 inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 font-semibold transition-colors hover:bg-white/70 focus-visible:ring-3 focus-visible:outline-none"
          >
            Все новости <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.18fr_0.82fr]">
          {items.map((item, index) => (
            <NewsCard key={item.slug} item={item} featured={index === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NewsCard } from "@/components/content/news-card";
import type { PublicNewsItem } from "@/lib/content/news";

export function LatestNewsSection({ items }: { items: PublicNewsItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="bg-muted/35 py-12 md:py-16" aria-labelledby="latest-news-title">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-primary text-sm font-semibold tracking-wide uppercase">
              Жизнь РАСтишки
            </p>
            <h2
              id="latest-news-title"
              className="font-heading text-primary mt-1 text-3xl font-bold"
            >
              Последние новости
            </h2>
          </div>
          <Link
            href="/news"
            className="text-primary inline-flex items-center gap-1.5 font-medium hover:underline"
          >
            Все новости <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {items.map((item) => (
            <NewsCard key={item.slug} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

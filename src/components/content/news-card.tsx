import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentDate } from "@/components/content/content-date";
import type { PublicNewsItem } from "@/lib/content/news";

export function NewsCard({ item }: { item: PublicNewsItem }) {
  return (
    <Card className="h-full">
      {item.image ? (
        <div
          role="img"
          aria-label={item.alt || item.title}
          className="aspect-[16/9] bg-cover bg-center"
          style={{ backgroundImage: `url("${item.image}")` }}
        />
      ) : (
        <div
          aria-hidden="true"
          className="from-brand-cream via-brand-pink/50 to-brand-rose/60 flex aspect-[16/9] items-center justify-center bg-gradient-to-br"
        >
          <Newspaper className="text-primary/70 size-12" />
        </div>
      )}
      <CardHeader>
        <p className="text-muted-foreground text-xs font-medium">
          <ContentDate value={item.date} />
        </p>
        <CardTitle>{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground flex-1">{item.shortText}</CardContent>
      <CardFooter>
        <Link
          href={`/news/${item.slug}`}
          className="text-primary inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
        >
          Читать новость <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  );
}

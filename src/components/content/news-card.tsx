import Link from "next/link";
import { ContentImage } from "@/components/content/content-image";
import { ArrowRight, Blocks, Palette, Sprout } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentDate } from "@/components/content/content-date";
import type { PublicNewsItem } from "@/lib/content/news";
import { cn } from "@/lib/utils";

function FallbackIcon({ slug }: { slug: string }) {
  const checksum = Array.from(slug).reduce((total, char) => total + char.charCodeAt(0), 0);

  if (checksum % 3 === 0) {
    return <Palette className="size-11" />;
  }

  if (checksum % 3 === 1) {
    return <Blocks className="size-11" />;
  }

  return <Sprout className="size-11" />;
}

export function NewsCard({
  item,
  featured = false,
  headingLevel = 3,
  eagerImage = false,
}: {
  item: PublicNewsItem;
  featured?: boolean;
  headingLevel?: 2 | 3;
  eagerImage?: boolean;
}) {
  return (
    <Card
      className={cn(
        "shadow-soft hover:border-brand-mint/65 hover:shadow-card-hover h-full rounded-[1.6rem] border border-white/85 pt-0 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1",
        featured && "lg:row-span-2",
      )}
    >
      {item.image || featured ? (
        <div
          className={cn(
            "bg-brand-mint-soft relative aspect-[16/9] overflow-hidden",
            featured && "lg:aspect-auto lg:min-h-96 lg:flex-1",
          )}
        >
          <ContentImage
            src={item.image}
            alt={item.image ? item.alt || item.title : "Тёплое развивающее занятие в РАСтишке"}
            eager={eagerImage}
            sizes={
              featured
                ? "(max-width: 1023px) 92vw, (max-width: 1279px) 55vw, 44rem"
                : "(max-width: 1023px) 92vw, (max-width: 1279px) 40vw, 31rem"
            }
            className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-[1.015] motion-reduce:transform-none"
          />
          <div
            className="from-card pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t to-transparent"
            aria-hidden="true"
          />
        </div>
      ) : (
        <div
          aria-hidden="true"
          className={cn(
            "from-brand-mint-soft via-brand-cream to-brand-rose/70 relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-gradient-to-br",
            featured && "lg:aspect-auto lg:min-h-96 lg:flex-1",
          )}
        >
          <div className="absolute -top-12 -left-10 size-40 rounded-full bg-white/55" />
          <div className="bg-brand-mint/28 absolute -right-8 -bottom-16 size-44 rounded-[58%_42%_62%_38%]" />
          <div className="bg-brand-pink/55 absolute top-[28%] left-[18%] size-5 rotate-12 rounded-md" />
          <span className="shadow-soft text-primary/75 grid size-24 place-items-center rounded-[2rem] border border-white/80 bg-white/58 backdrop-blur-sm transition-transform duration-500 group-hover/card:scale-105 group-hover/card:rotate-3">
            <FallbackIcon slug={item.slug} />
          </span>
          <div className="from-card pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t to-transparent" />
        </div>
      )}
      <CardHeader>
        <p className="text-muted-foreground text-xs font-medium">
          <ContentDate value={item.date} />
        </p>
        <CardTitle
          as={headingLevel === 2 ? "h2" : "h3"}
          className={cn("text-primary font-bold", featured && "text-xl sm:text-2xl")}
        >
          {item.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground flex-1">{item.shortText}</CardContent>
      <CardFooter>
        <Link
          href={`/news/${item.slug}`}
          aria-label={`Читать новость: ${item.title}`}
          className="text-primary focus-visible:ring-ring/40 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold hover:underline focus-visible:rounded focus-visible:ring-3 focus-visible:outline-none"
        >
          Читать новость <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  );
}

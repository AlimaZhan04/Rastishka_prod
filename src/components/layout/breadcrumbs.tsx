import Link from "next/link";
import { ChevronRight, House } from "lucide-react";

export type BreadcrumbItem = { label: string; href?: string };

/** A compact, accessible page trail for public sections below the home page. */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const trail: BreadcrumbItem[] = [{ label: "Главная", href: "/" }, ...items];

  return (
    <nav aria-label="Хлебные крошки" className="mb-5 text-sm">
      <ol className="text-muted-foreground flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {trail.map((item, index) => {
          const isCurrent = index === trail.length - 1;
          return (
            <li
              key={`${item.label}-${item.href ?? "current"}`}
              className="flex min-w-0 items-center gap-1.5"
            >
              {index ? <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" /> : null}
              {isCurrent || !item.href ? (
                <span aria-current="page" className="text-foreground min-w-0 break-words">
                  {index === 0 ? <House className="size-3.5" aria-label="Главная" /> : item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  aria-label={index === 0 ? "Главная" : undefined}
                  className="hover:text-primary focus-visible:ring-ring/50 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-1 hover:underline focus-visible:ring-3 focus-visible:outline-none"
                >
                  {index === 0 ? <House className="size-4" aria-hidden="true" /> : item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

import Link from "next/link";
import { ChevronRight, House } from "lucide-react";

export type BreadcrumbItem = { label: string; href?: string };

/** A compact, accessible page trail for public sections below the home page. */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const trail: BreadcrumbItem[] = [{ label: "Главная", href: "/" }, ...items];

  return (
    <nav aria-label="Хлебные крошки" className="mb-5 overflow-x-auto text-sm">
      <ol className="text-muted-foreground flex min-w-max items-center gap-1.5">
        {trail.map((item, index) => {
          const isCurrent = index === trail.length - 1;
          return (
            <li
              key={`${item.label}-${item.href ?? "current"}`}
              className="flex items-center gap-1.5"
            >
              {index ? <ChevronRight className="size-3.5" aria-hidden="true" /> : null}
              {isCurrent || !item.href ? (
                <span aria-current="page" className="text-foreground max-w-56 truncate">
                  {index === 0 ? <House className="size-3.5" aria-label="Главная" /> : item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-primary inline-flex items-center hover:underline"
                >
                  {index === 0 ? <House className="size-3.5" aria-label="Главная" /> : item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

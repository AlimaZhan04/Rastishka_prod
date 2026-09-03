import Link from "next/link";
import { ArrowRight, BriefcaseBusiness } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { PublicVacancy } from "@/lib/content/vacancies";

export function VacancyCard({
  vacancy,
  headingLevel = 3,
}: {
  vacancy: PublicVacancy;
  headingLevel?: 2 | 3;
}) {
  return (
    <Card className="reveal-scale-on-scroll shadow-soft hover:border-brand-mint/65 hover:shadow-card-hover h-full rounded-[1.6rem] border border-white/85 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1">
      <CardHeader>
        <span className="bg-brand-mint-soft text-brand-teal mb-2 grid size-13 place-items-center rounded-2xl transition-transform duration-300 group-hover/card:scale-105 group-hover/card:-rotate-3">
          <BriefcaseBusiness className="size-6" aria-hidden="true" />
        </span>
        <CardTitle as={headingLevel === 2 ? "h2" : "h3"} className="text-primary text-xl font-bold">
          {vacancy.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground flex-1">{vacancy.preview}</CardContent>
      <CardFooter>
        <Link
          href={`/vacancies/${vacancy.slug}`}
          className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring/40 inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold shadow-[0_10px_22px_-14px_rgba(126,42,61,0.75)] transition-[transform,background-color] hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:outline-none"
        >
          Подробнее и откликнуться <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  );
}

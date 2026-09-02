import Link from "next/link";
import { ArrowRight, BriefcaseBusiness } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { PublicVacancy } from "@/lib/content/vacancies";

export function VacancyCard({ vacancy }: { vacancy: PublicVacancy }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <BriefcaseBusiness className="text-primary mb-2 size-7" aria-hidden="true" />
        <CardTitle>{vacancy.title}</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground flex-1">{vacancy.preview}</CardContent>
      <CardFooter>
        <Link
          href={`/vacancies/${vacancy.slug}`}
          className="text-primary inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
        >
          Подробнее и откликнуться <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  );
}

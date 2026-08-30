import type { ComponentType, SVGProps } from "react";
import { Puzzle, MessagesSquare, Brain, Heart } from "lucide-react";
import type { SiteSettings } from "@/lib/content/site";

const ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  ras: Puzzle,
  zprr: MessagesSquare,
  adhd: Brain,
  down: Heart,
};

export function AudienceSection({ audience }: { audience: SiteSettings["audience"] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="font-heading text-3xl font-bold text-primary">Для кого мы</h2>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Мы принимаем и поддерживаем детей с разными особенностями развития и помогаем подобрать
        индивидуальный маршрут сопровождения.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {audience.map((item) => {
          const Icon = ICONS[item.key] ?? Heart;
          return (
            <li
              key={item.key}
              className="rounded-3xl bg-card p-6 shadow-soft transition-transform hover:-translate-y-0.5"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-heading text-lg font-bold text-foreground">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

import type { ComponentType, SVGProps } from "react";
import { Puzzle, MessagesSquare, Brain, Heart } from "lucide-react";
import { DoodleHeart, LeafSprig } from "@/components/brand/brand-motifs";
import type { SiteSettings } from "@/lib/content/site";

const ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  ras: Puzzle,
  zprr: MessagesSquare,
  adhd: Brain,
  down: Heart,
};

export function AudienceSection({ audience }: { audience: SiteSettings["audience"] }) {
  return (
    <section className="relative overflow-hidden border-y border-white/70 bg-white/48 py-14 sm:py-18">
      <div
        className="bg-brand-rose/65 pointer-events-none absolute top-8 -right-24 size-56 rounded-[58%_42%_52%_48%/48%_58%_42%_52%]"
        aria-hidden="true"
      />
      <DoodleHeart className="text-brand-pink/80 absolute top-10 right-[4%] size-12 rotate-12" />
      <LeafSprig className="text-brand-sage/55 absolute -bottom-12 -left-5 h-40" />
      <div className="relative mx-auto grid max-w-7xl gap-8 px-5 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:gap-12 lg:px-8">
        <div className="reveal-on-scroll">
          <p className="text-brand-teal text-sm font-bold tracking-[0.16em] uppercase">
            Поддержка рядом
          </p>
          <h2 className="font-heading text-primary mt-2 text-3xl font-extrabold text-balance sm:text-4xl">
            Для кого мы
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl text-base leading-7 lg:text-lg">
            Мы принимаем и поддерживаем детей с разными особенностями развития и помогаем подобрать
            индивидуальный маршрут сопровождения.
          </p>
          <div
            className="from-brand-mint mt-6 hidden h-px w-28 bg-gradient-to-r to-transparent lg:block"
            aria-hidden="true"
          />
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:gap-4">
          {audience.map((item, index) => {
            const Icon = ICONS[item.key] ?? Heart;
            const mint = index % 3 === 1;
            return (
              <li
                key={item.key}
                className="reveal-scale-on-scroll bg-card/92 shadow-soft rounded-[1.6rem] border border-white/80 p-4 sm:p-6"
              >
                <span
                  className={`grid size-11 place-items-center rounded-2xl sm:size-13 ${mint ? "bg-brand-mint-soft text-brand-teal" : "bg-secondary text-primary"}`}
                >
                  <Icon className="size-5 sm:size-6" aria-hidden="true" />
                </span>
                <h3 className="font-heading text-foreground mt-3 text-base font-extrabold text-balance sm:mt-4 sm:text-lg">
                  {item.title}
                </h3>
                <p className="text-muted-foreground mt-1.5 hidden text-sm leading-6 sm:block">
                  {item.description}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

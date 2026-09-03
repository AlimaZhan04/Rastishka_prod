"use client";

import type { ComponentType, SVGProps } from "react";
import { Sun, Sunrise, Soup, CalendarClock, ChevronRight } from "lucide-react";
import { VISIT_FORMATS, type VisitFormat } from "@/lib/enums";
import { useAnketa } from "@/lib/anketa-store";
import { LeafSprig } from "@/components/brand/brand-motifs";

const ICONS: Record<VisitFormat, ComponentType<SVGProps<SVGSVGElement>>> = {
  FULL_DAY: Sun,
  MORNING: Sunrise,
  LUNCH: Soup,
  INDIVIDUAL: CalendarClock,
};

function VisitFormatCard({
  value,
  title,
  hours,
  index,
}: {
  value: VisitFormat;
  title: string;
  hours?: string;
  index: number;
}) {
  const open = useAnketa((s) => s.open);
  const Icon = ICONS[value];
  return (
    <button
      type="button"
      onClick={() =>
        open({ visitFormat: value, source: { page: "/", cta: `visit_${value.toLowerCase()}` } })
      }
      className="reveal-scale-on-scroll group bg-card/95 shadow-soft hover:border-brand-mint/65 hover:shadow-card-hover focus-visible:ring-ring/50 flex min-h-24 w-full cursor-pointer items-center gap-4 rounded-[1.6rem] border border-white/90 p-4 text-left transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 focus-visible:ring-3 focus-visible:outline-none active:scale-[0.985] sm:p-5"
    >
      <span
        className={`grid size-13 shrink-0 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3 ${index % 2 ? "bg-brand-mint-soft text-brand-teal" : "bg-secondary text-primary"}`}
      >
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="font-heading text-foreground block font-bold">{title}</span>
        {hours && <span className="text-muted-foreground block text-sm">{hours}</span>}
      </span>
      <ChevronRight
        className="text-primary size-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
        aria-hidden="true"
      />
    </button>
  );
}

export function VisitFormatsSection() {
  return (
    <section className="relative mx-auto max-w-7xl overflow-hidden px-5 py-14 sm:px-6 sm:py-18 lg:px-8">
      <LeafSprig className="text-brand-sage/45 absolute top-6 -right-5 hidden h-36 rotate-12 md:block" />
      <div className="reveal-on-scroll">
        <p className="text-brand-teal text-sm font-bold tracking-[0.16em] uppercase">Гибкий ритм</p>
        <h2 className="font-heading text-primary mt-2 text-3xl font-extrabold text-balance sm:text-4xl">
          Варианты посещения
        </h2>
        <p className="text-muted-foreground mt-3 max-w-2xl text-base leading-7">
          Выберите удобный формат — анкета откроется с уже выбранным вариантом.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {VISIT_FORMATS.map((f, index) => (
          <VisitFormatCard
            key={f.value}
            value={f.value}
            title={f.title}
            hours={f.hours}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

"use client";

import type { ComponentType, SVGProps } from "react";
import { Sun, Sunrise, Soup, CalendarClock, ChevronRight } from "lucide-react";
import { VISIT_FORMATS, type VisitFormat } from "@/lib/enums";
import { useAnketa } from "@/lib/anketa-store";

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
}: {
  value: VisitFormat;
  title: string;
  hours?: string;
}) {
  const open = useAnketa((s) => s.open);
  const Icon = ICONS[value];
  return (
    <button
      type="button"
      onClick={() =>
        open({ visitFormat: value, source: { page: "/", cta: `visit_${value.toLowerCase()}` } })
      }
      className="group flex w-full items-center gap-4 rounded-3xl bg-card p-5 text-left shadow-soft transition-transform hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-secondary text-primary">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-heading font-bold text-foreground">{title}</span>
        {hours && <span className="block text-sm text-muted-foreground">{hours}</span>}
      </span>
      <ChevronRight
        className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </button>
  );
}

export function VisitFormatsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="font-heading text-3xl font-bold text-primary">Варианты посещения</h2>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Выберите удобный формат — анкета откроется с уже выбранным вариантом.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {VISIT_FORMATS.map((f) => (
          <VisitFormatCard key={f.value} value={f.value} title={f.title} hours={f.hours} />
        ))}
      </div>
    </section>
  );
}

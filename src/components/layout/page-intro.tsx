import type { ReactNode } from "react";
import { DoodleHeart, LeafSprig } from "@/components/brand/brand-motifs";

export function PageIntro({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <header className="section-wash relative isolate overflow-hidden [--section-tint:rgba(255,255,255,0.42)]">
      <div
        className="bg-brand-mint-soft/85 pointer-events-none absolute -top-32 -right-28 -z-10 size-80 rounded-[46%_54%_61%_39%/58%_40%_60%_42%]"
        aria-hidden="true"
      />
      <div
        className="bg-brand-rose/75 pointer-events-none absolute -bottom-28 left-[8%] -z-10 size-52 rounded-[64%_36%_48%_52%/42%_60%_40%_58%]"
        aria-hidden="true"
      />
      <DoodleHeart className="motion-float text-brand-pink/80 absolute top-8 right-[12%] size-12 rotate-12 [--float-rotate:12deg]" />
      <LeafSprig className="text-brand-sage/55 absolute -right-2 -bottom-16 hidden h-44 -rotate-12 sm:block" />
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">
        {children}
        <p className="motion-rise text-brand-teal text-sm font-bold tracking-[0.16em] uppercase">
          {eyebrow}
        </p>
        <h1 className="motion-rise motion-delay-1 font-heading text-primary mt-2 max-w-4xl text-4xl leading-tight font-extrabold tracking-[-0.025em] text-balance sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="motion-rise motion-delay-2 text-muted-foreground mt-4 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8">
          {description}
        </p>
      </div>
    </header>
  );
}

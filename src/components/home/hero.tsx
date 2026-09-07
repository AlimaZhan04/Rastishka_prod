import { ContentImage } from "@/components/content/content-image";
import { ArrowRight, Heart, Sparkles } from "lucide-react";
import { AnketaTrigger } from "@/components/anketa/anketa-trigger";
import { DoodleHeart, LeafSprig } from "@/components/brand/brand-motifs";
import type { SiteSettings } from "@/lib/content/site";

export function Hero({ hero }: { hero: SiteSettings["hero"] }) {
  return (
    <section className="relative isolate overflow-hidden">
      <div
        className="bg-brand-mint-soft/70 pointer-events-none absolute -top-32 -left-28 -z-10 size-80 rounded-[45%_55%_64%_36%/52%_37%_63%_48%] blur-sm"
        aria-hidden="true"
      />
      <div
        className="bg-brand-rose/75 pointer-events-none absolute -right-28 -bottom-32 -z-10 size-96 rounded-[62%_38%_44%_56%/45%_55%_45%_55%]"
        aria-hidden="true"
      />
      <DoodleHeart className="motion-float text-brand-pink/75 absolute top-10 left-[5%] hidden size-12 -rotate-12 lg:block" />
      <DoodleHeart className="motion-float text-brand-pink/80 absolute right-[3%] bottom-20 hidden size-16 rotate-12 [--float-rotate:12deg] lg:block" />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-10 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:gap-14 lg:px-8 lg:py-18">
        <div className="order-2 min-w-0 text-center lg:order-1 lg:text-left">
          <div className="motion-rise border-brand-mint/55 text-brand-teal inline-flex items-center gap-2 rounded-full border bg-white/75 px-3.5 py-2 text-sm font-semibold shadow-sm backdrop-blur-sm">
            <Sparkles className="size-4" aria-hidden="true" />
            Бережная среда для развития
          </div>
          <h1 className="motion-rise motion-delay-1 font-heading text-primary mt-5 text-4xl leading-[1.08] font-extrabold tracking-[-0.025em] text-balance break-words sm:text-5xl lg:text-[3.6rem]">
            {hero.title}
          </h1>
          <p className="motion-rise motion-delay-2 text-muted-foreground mx-auto mt-5 max-w-xl text-base leading-7 sm:text-lg lg:mx-0 lg:text-xl lg:leading-8">
            {hero.subtitle}
          </p>
          <div className="motion-rise motion-delay-3 mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <AnketaTrigger
              ctaSource="hero"
              size="lg"
              className="h-auto min-h-13 w-full rounded-full px-5 py-3 text-base whitespace-normal shadow-[0_14px_30px_-14px_rgba(126,42,61,0.65)] sm:w-auto sm:px-7"
            >
              Записаться на консультацию <ArrowRight className="size-4" aria-hidden="true" />
            </AnketaTrigger>
            <span className="text-muted-foreground max-w-64 text-sm leading-5">
              Познакомимся и вместе подберём подходящий формат
            </span>
          </div>
        </div>

        <div className="motion-scale-in relative order-1 mx-auto w-full max-w-2xl min-w-0 sm:max-w-[31rem] lg:order-2 lg:max-w-2xl">
          <div
            className="bg-brand-mint/40 absolute -top-4 -right-3 -z-10 h-[92%] w-[86%] rotate-2 rounded-[46%_54%_41%_59%/54%_43%_57%_46%] blur-md sm:-right-6"
            aria-hidden="true"
          />
          <div
            className="shadow-soft bg-brand-mint-soft relative aspect-[4/3] overflow-hidden border border-white/60"
            style={{ borderRadius: "46% 54% 44% 56% / 39% 45% 55% 61%" }}
          >
            <ContentImage
              src={hero.imageUrl}
              alt={hero.imageAlt}
              eager
              sizes="(max-width: 639px) 92vw, (max-width: 1023px) 31rem, (max-width: 1279px) 52vw, 40rem"
              className="object-cover object-center"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(247,241,234,0.28)_100%)] shadow-[inset_0_0_32px_10px_rgba(247,241,234,0.18)]"
              aria-hidden="true"
            />
          </div>
          <div className="text-primary shadow-soft absolute -bottom-3 left-3 flex max-w-[78%] items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3.5 py-2.5 text-sm font-semibold backdrop-blur-sm sm:bottom-2 sm:left-0">
            <span className="bg-brand-mint-soft text-brand-teal grid size-7 shrink-0 place-items-center rounded-full">
              <Heart className="size-4 fill-current" aria-hidden="true" />
            </span>
            Каждый ребёнок развивается в своём темпе
          </div>
          <LeafSprig className="text-brand-sage absolute -right-5 -bottom-10 hidden h-36 w-24 rotate-12 sm:block" />
        </div>
      </div>
    </section>
  );
}

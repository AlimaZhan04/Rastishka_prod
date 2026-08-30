import { Heart } from "lucide-react";
import { AnketaTrigger } from "@/components/anketa/anketa-trigger";
import type { SiteSettings } from "@/lib/content/site";

export function Hero({ hero }: { hero: SiteSettings["hero"] }) {
  return (
    <section className="relative overflow-hidden">
      {/* декоративные сердечки */}
      <Heart
        className="pointer-events-none absolute top-10 right-[42%] size-6 rotate-12 fill-brand-pink text-brand-pink opacity-60"
        aria-hidden="true"
      />
      <Heart
        className="pointer-events-none absolute bottom-16 left-6 size-5 -rotate-12 fill-brand-rose text-brand-rose opacity-70"
        aria-hidden="true"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-16">
        <div className="order-2 md:order-1">
          <h1 className="font-heading text-4xl leading-tight font-extrabold text-primary md:text-5xl">
            {hero.title}
          </h1>
          <p className="mt-4 max-w-md text-base text-muted-foreground md:text-lg">
            {hero.subtitle}
          </p>
          <AnketaTrigger ctaSource="hero" className="mt-6 h-12 rounded-full px-8 text-base">
            Записаться
          </AnketaTrigger>
        </div>

        <div className="order-1 md:order-2">
          <div
            role="img"
            aria-label={hero.imageAlt}
            className="aspect-[4/3] w-full rounded-[2rem] bg-gradient-to-br from-brand-pink via-brand-rose to-brand-cream shadow-soft"
          />
        </div>
      </div>
    </section>
  );
}

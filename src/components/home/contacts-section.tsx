import Link from "next/link";
import { MapPin } from "lucide-react";
import { PhoneLink } from "@/components/brand/phone-link";
import { SocialLinks } from "@/components/brand/social-links";
import type { SiteSettings } from "@/lib/content/site";
import { DoodleHeart } from "@/components/brand/brand-motifs";

export function ContactsSection({ settings }: { settings: SiteSettings }) {
  return (
    <section className="px-5 py-14 sm:px-6 sm:py-18 lg:px-8" aria-labelledby="contacts-title">
      <div className="shadow-soft relative mx-auto grid max-w-7xl gap-8 overflow-hidden rounded-[2rem] border border-white/85 bg-white/62 px-5 py-8 sm:px-8 sm:py-10 md:grid-cols-[0.82fr_1.18fr] lg:px-12">
        <DoodleHeart className="text-brand-pink/60 absolute top-4 -right-2 size-18 rotate-12" />
        <div className="reveal-on-scroll">
          <p className="text-brand-teal text-sm font-bold tracking-[0.16em] uppercase">
            Связь с нами
          </p>
          <h2
            id="contacts-title"
            className="font-heading text-primary mt-2 text-3xl font-extrabold sm:text-4xl"
          >
            Контакты
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md leading-7">
            Позвоните нам или выберите удобный способ связи — поможем подобрать следующий шаг.
          </p>
          <div className="mt-5 flex flex-col items-start gap-4">
            <PhoneLink phone={settings.phone} />
            <SocialLinks socials={settings.socials} />
            <Link
              href="/contacts"
              className="text-primary focus-visible:ring-ring/40 inline-flex min-h-11 items-center rounded-lg font-semibold hover:underline focus-visible:ring-3 focus-visible:outline-none"
            >
              Все контакты
            </Link>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {settings.branches.map((branch) => {
            const search =
              branch.lat != null && branch.lng != null
                ? `${branch.lat},${branch.lng}`
                : branch.address;
            return (
              <a
                key={`${branch.title}-${branch.address}`}
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(search)}`}
                target="_blank"
                rel="noreferrer"
                className="reveal-scale-on-scroll group border-brand-mint/35 bg-card/95 hover:border-brand-teal/40 hover:shadow-card-hover focus-visible:ring-ring/40 rounded-[1.5rem] border p-5 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 focus-visible:ring-3 focus-visible:outline-none"
              >
                <span className="bg-brand-mint-soft text-brand-teal grid size-11 place-items-center rounded-2xl transition-transform duration-300 group-hover:-rotate-3">
                  <MapPin className="size-6" aria-hidden="true" />
                </span>
                <h3 className="font-heading text-primary mt-3 text-lg font-bold">{branch.title}</h3>
                <p className="text-muted-foreground mt-1 text-sm">{branch.address}</p>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

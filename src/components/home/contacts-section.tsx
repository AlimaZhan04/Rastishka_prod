import Link from "next/link";
import { MapPin } from "lucide-react";
import { PhoneLink } from "@/components/brand/phone-link";
import { SocialLinks } from "@/components/brand/social-links";
import type { SiteSettings } from "@/lib/content/site";

export function ContactsSection({ settings }: { settings: SiteSettings }) {
  return (
    <section className="py-12 md:py-16" aria-labelledby="contacts-title">
      <div className="mx-auto grid max-w-6xl gap-7 px-4 md:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">Связь с нами</p>
          <h2 id="contacts-title" className="font-heading text-primary mt-1 text-3xl font-bold">
            Контакты
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md">
            Позвоните нам или выберите удобный способ связи — поможем подобрать следующий шаг.
          </p>
          <div className="mt-5 flex flex-col items-start gap-4">
            <PhoneLink phone={settings.phone} />
            <SocialLinks socials={settings.socials} />
            <Link href="/contacts" className="text-primary font-medium hover:underline">
              Все контакты
            </Link>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {settings.branches.map((branch) => {
            const search =
              branch.lat && branch.lng ? `${branch.lat},${branch.lng}` : branch.address;
            return (
              <a
                key={`${branch.title}-${branch.address}`}
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(search)}`}
                target="_blank"
                rel="noreferrer"
                className="border-border bg-card hover:border-primary/40 hover:bg-muted/50 rounded-2xl border p-5 transition-colors"
              >
                <MapPin className="text-primary size-6" aria-hidden="true" />
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

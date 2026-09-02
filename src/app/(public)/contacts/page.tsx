import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { PhoneLink } from "@/components/brand/phone-link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { SocialLinks } from "@/components/brand/social-links";
import { getSiteSettings } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Контакты и адреса филиалов детского сада «РАСтишка».",
};

export default async function ContactsPage() {
  const settings = await getSiteSettings();

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <Breadcrumbs items={[{ label: "Контакты" }]} />
      <p className="text-primary text-sm font-semibold tracking-wide uppercase">Связь с нами</p>
      <h1 className="font-heading text-primary mt-1 text-4xl font-extrabold">Контакты</h1>
      <p className="text-muted-foreground mt-4 max-w-2xl">
        Свяжитесь с нами удобным способом или постройте маршрут до филиала.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-[0.8fr_1.2fr]">
        <div className="bg-muted/60 rounded-2xl p-6">
          <h2 className="font-heading text-primary text-2xl font-bold">На связи</h2>
          <div className="mt-5 flex flex-col items-start gap-5">
            <PhoneLink phone={settings.phone} />
            <SocialLinks socials={settings.socials} />
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
                className="border-border bg-card hover:border-primary/40 rounded-2xl border p-5 transition-colors"
              >
                <MapPin className="text-primary size-7" aria-hidden="true" />
                <h2 className="font-heading text-primary mt-3 text-xl font-bold">{branch.title}</h2>
                <p className="text-muted-foreground mt-2">{branch.address}</p>
                <span className="text-primary mt-4 inline-block text-sm font-medium underline underline-offset-2">
                  Открыть карту
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

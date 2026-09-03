import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { PhoneLink } from "@/components/brand/phone-link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { SocialLinks } from "@/components/brand/social-links";
import { getSiteSettings } from "@/lib/content/site";
import { PageIntro } from "@/components/layout/page-intro";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Контакты и адреса филиалов детского сада «РАСтишка».",
};

export default async function ContactsPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PageIntro
        eyebrow="Связь с нами"
        title="Контакты"
        description="Свяжитесь с нами удобным способом или постройте маршрут до филиала."
      >
        <Breadcrumbs items={[{ label: "Контакты" }]} />
      </PageIntro>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-5 md:grid-cols-[0.78fr_1.22fr]">
          <div className="reveal-scale-on-scroll border-brand-mint/35 bg-brand-mint-soft/70 shadow-soft rounded-[1.6rem] border p-6 sm:p-8">
            <h2 className="font-heading text-primary text-2xl font-bold">На связи</h2>
            <div className="mt-5 flex flex-col items-start gap-5">
              <PhoneLink phone={settings.phone} />
              <SocialLinks socials={settings.socials} />
            </div>
          </div>
          <div className={cn("grid gap-4", settings.branches.length > 1 && "sm:grid-cols-2")}>
            {settings.branches.map((branch) => {
              const search =
                branch.lat && branch.lng ? `${branch.lat},${branch.lng}` : branch.address;
              return (
                <a
                  key={`${branch.title}-${branch.address}`}
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(search)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="reveal-scale-on-scroll group bg-card shadow-soft hover:border-brand-mint hover:shadow-card-hover rounded-[1.6rem] border border-white/85 p-6 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1"
                >
                  <span className="bg-brand-mint-soft text-brand-teal grid size-12 place-items-center rounded-2xl transition-transform duration-300 group-hover:-rotate-3">
                    <MapPin className="size-6" aria-hidden="true" />
                  </span>
                  <h2 className="font-heading text-primary mt-3 text-xl font-bold">
                    {branch.title}
                  </h2>
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
    </>
  );
}

import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { SocialLinks } from "@/components/brand/social-links";
import { PhoneLink } from "@/components/brand/phone-link";
import { AnketaTrigger } from "@/components/anketa/anketa-trigger";
import { DoodleHeart, LeafSprig } from "@/components/brand/brand-motifs";

type Socials = { instagram?: string; facebook?: string; threads?: string };

const NAV = [
  { href: "/", label: "Главная" },
  { href: "/news", label: "Новости" },
  { href: "/vacancies", label: "Вакансии" },
  { href: "/contacts", label: "Контакты" },
];

export function Footer({ phone, socials }: { phone: string; socials: Socials }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-border/60 bg-card mt-18 border-t">
      <div className="border-brand-mint/25 bg-brand-mint-soft/65 relative overflow-hidden border-b">
        <DoodleHeart className="motion-float text-brand-pink/70 absolute -top-2 right-[12%] size-16 rotate-12 [--float-rotate:12deg]" />
        <LeafSprig className="text-brand-sage/60 absolute -bottom-16 left-[4%] h-40" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 py-9 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
          <div>
            <p className="text-brand-teal text-sm font-bold tracking-[0.16em] uppercase">
              Первый шаг
            </p>
            <h2 className="font-heading text-primary mt-1 text-2xl font-extrabold text-balance sm:text-3xl">
              Давайте познакомимся с вашим ребёнком
            </h2>
          </div>
          <AnketaTrigger ctaSource="footer" className="h-12 w-full rounded-full px-6 sm:w-auto">
            Заполнить анкету
          </AnketaTrigger>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-9 px-5 py-10 sm:px-6 md:grid-cols-[1.3fr_0.7fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-6">
            Коррекционный детский сад с психолого-педагогическим сопровождением детей с
            особенностями развития.
          </p>
        </div>

        <nav className="flex flex-col gap-2" aria-label="Подвал">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-primary focus-visible:ring-ring/40 flex min-h-11 items-center text-sm transition-colors focus-visible:rounded focus-visible:ring-3 focus-visible:outline-none"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/privacy"
            className="text-muted-foreground hover:text-primary focus-visible:ring-ring/40 flex min-h-11 items-center rounded text-sm transition-colors focus-visible:ring-3 focus-visible:outline-none"
          >
            Персональные данные
          </Link>
        </nav>

        <div className="flex flex-col gap-4">
          <PhoneLink phone={phone} />
          <SocialLinks socials={socials} />
        </div>
      </div>

      <div className="border-border/60 text-muted-foreground border-t py-4 text-center text-xs">
        © {year} РАСтишка. Все права защищены.
      </div>
    </footer>
  );
}

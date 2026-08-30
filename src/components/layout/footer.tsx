import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { SocialLinks } from "@/components/brand/social-links";
import { PhoneLink } from "@/components/brand/phone-link";

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
    <footer className="mt-16 border-t border-border/60 bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Коррекционный детский сад с психолого-педагогическим сопровождением детей с
            особенностями развития.
          </p>
        </div>

        <nav className="flex flex-col gap-2" aria-label="Подвал">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-4">
          <PhoneLink phone={phone} />
          <SocialLinks socials={socials} />
        </div>
      </div>

      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {year} РАСтишка. Все права защищены.
      </div>
    </footer>
  );
}

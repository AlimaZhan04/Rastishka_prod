"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Menu } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { SocialLinks } from "@/components/brand/social-links";
import { PhoneLink } from "@/components/brand/phone-link";
import { AnketaTrigger } from "@/components/anketa/anketa-trigger";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type Socials = { instagram?: string; facebook?: string; threads?: string };

const NAV = [
  { href: "/", label: "Главная" },
  { href: "/news", label: "Новости" },
  { href: "/vacancies", label: "Вакансии" },
  { href: "/contacts", label: "Контакты" },
];

export function PublicHeader({ phone, socials }: { phone: string; socials: Socials }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const canGoBack = pathname !== "/";
  const backLink = pathname.startsWith("/news/")
    ? { href: "/news", label: "К новостям" }
    : pathname.startsWith("/vacancies/")
      ? { href: "/vacancies", label: "К вакансиям" }
      : { href: "/", label: "На главную" };

  return (
    <header className="border-border/55 bg-background/88 sticky top-0 z-40 border-b shadow-[0_10px_30px_-28px_rgba(126,42,61,0.55)] backdrop-blur-xl">
      <div className="mx-auto flex h-[4.75rem] max-w-7xl items-center justify-between gap-4 px-5 sm:px-6 lg:h-21 lg:px-8">
        <div className="flex min-w-0 items-center gap-1.5">
          {canGoBack ? (
            <Link
              href={backLink.href}
              aria-label={backLink.label}
              className="hover:bg-secondary focus-visible:ring-ring/50 grid size-11 shrink-0 place-items-center rounded-full transition-colors focus-visible:ring-3 focus-visible:outline-none"
            >
              <ArrowLeft className="size-5" aria-hidden="true" />
            </Link>
          ) : null}
          <Logo />
        </div>

        {/* Desktop: соцсети, телефон, CTA (FR-COM-02) */}
        <div className="hidden items-center gap-5 lg:flex">
          <SocialLinks socials={socials} />
          <PhoneLink phone={phone} />
          <AnketaTrigger ctaSource="header" className="h-11 rounded-full px-5">
            Записаться
          </AnketaTrigger>
        </div>

        {/* Mobile: burger-меню */}
        <div className="flex items-center gap-1 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Открыть меню" />}>
              <Menu className="size-6" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent
              side="right"
              aria-label="Меню сайта"
              className="border-l-brand-mint/40 bg-background overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))] data-[side=right]:w-[min(88vw,22rem)]"
            >
              <SheetHeader className="border-border/60 border-b pb-5">
                <SheetTitle className="sr-only">Меню сайта</SheetTitle>
                <Logo onClick={() => setOpen(false)} />
              </SheetHeader>

              <nav aria-label="Основная навигация" className="flex flex-col gap-1 px-4">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={
                      item.href === "/"
                        ? pathname === "/"
                          ? "page"
                          : undefined
                        : pathname.startsWith(item.href)
                          ? "page"
                          : undefined
                    }
                    className={cn(
                      "text-foreground focus-visible:ring-ring/50 min-h-11 rounded-xl px-3.5 py-3 text-base font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none",
                      (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href))
                        ? "bg-brand-mint-soft text-brand-teal"
                        : "hover:bg-secondary",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-2 flex flex-col gap-4 px-4">
                <AnketaTrigger
                  ctaSource="mobile_menu"
                  className="h-11 w-full rounded-full"
                  onClick={() => setOpen(false)}
                >
                  Записаться
                </AnketaTrigger>
                <PhoneLink phone={phone} />
                <SocialLinks socials={socials} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <nav aria-label="Основная навигация" className="border-border/45 hidden border-t lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-8 py-1">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-visible:ring-ring/50 inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none",
                  active
                    ? "bg-brand-mint-soft text-brand-teal"
                    : "text-muted-foreground hover:bg-secondary hover:text-primary",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

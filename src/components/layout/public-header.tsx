"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { SocialLinks } from "@/components/brand/social-links";
import { PhoneLink } from "@/components/brand/phone-link";
import { AnketaTrigger } from "@/components/anketa/anketa-trigger";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type Socials = { instagram?: string; facebook?: string; threads?: string };

const NAV = [
  { href: "/", label: "Главная" },
  { href: "/news", label: "Новости" },
  { href: "/vacancies", label: "Вакансии" },
  { href: "/contacts", label: "Контакты" },
];

export function PublicHeader({ phone, socials }: { phone: string; socials: Socials }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />

        {/* Desktop: соцсети, телефон, CTA (FR-COM-02) */}
        <div className="hidden items-center gap-5 md:flex">
          <SocialLinks socials={socials} />
          <PhoneLink phone={phone} />
          <AnketaTrigger ctaSource="header" className="h-10 rounded-full px-5">
            Записаться
          </AnketaTrigger>
        </div>

        {/* Mobile: burger-меню */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" aria-label="Открыть меню" />}
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col gap-1 px-4">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-secondary"
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
    </header>
  );
}

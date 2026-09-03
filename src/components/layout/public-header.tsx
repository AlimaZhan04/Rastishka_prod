"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();
  const canGoBack = pathname !== "/";

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push("/");
  }

  return (
    <header className="border-border/55 bg-background/88 sticky top-0 z-40 border-b shadow-[0_10px_30px_-28px_rgba(126,42,61,0.55)] backdrop-blur-xl">
      <div className="mx-auto flex h-[4.75rem] max-w-7xl items-center justify-between gap-4 px-5 sm:px-6 lg:h-21 lg:px-8">
        <div className="flex min-w-0 items-center gap-1.5">
          {canGoBack ? (
            <Button type="button" variant="ghost" size="icon" onClick={goBack} aria-label="Назад">
              <ArrowLeft className="size-5" aria-hidden="true" />
            </Button>
          ) : null}
          <Logo />
        </div>

        {/* Desktop: соцсети, телефон, CTA (FR-COM-02) */}
        <div className="hidden items-center gap-5 lg:flex">
          <SocialLinks socials={socials} />
          <PhoneLink phone={phone} />
          <AnketaTrigger ctaSource="header" className="h-10 rounded-full px-5">
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
              className="border-l-brand-mint/40 bg-background w-[min(88vw,22rem)]"
            >
              <SheetHeader className="border-border/60 border-b pb-5">
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
                      "text-foreground min-h-11 rounded-xl px-3.5 py-3 text-base font-semibold transition-colors",
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
    </header>
  );
}

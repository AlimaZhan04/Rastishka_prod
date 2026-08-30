"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { useAnketa } from "@/lib/anketa-store";
import type { VisitFormat } from "@/lib/enums";

type Props = ComponentProps<typeof Button> & {
  /** Метка источника запуска анкеты (FR-APP-15). */
  ctaSource?: string;
  /** Предвыбранная форма посещения. */
  visitFormat?: VisitFormat;
};

export function AnketaTrigger({
  ctaSource = "cta",
  visitFormat,
  children = "Записаться",
  onClick,
  ...props
}: Props) {
  const open = useAnketa((s) => s.open);
  return (
    <Button
      onClick={(e) => {
        const search = new URLSearchParams(window.location.search);
        open({
          visitFormat,
          source: {
            page: window.location.pathname,
            cta: ctaSource,
            utmSource: search.get("utm_source") || undefined,
            utmMedium: search.get("utm_medium") || undefined,
            utmCampaign: search.get("utm_campaign") || undefined,
          },
        });
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

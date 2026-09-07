"use client";

import { create } from "zustand";
import type { VisitFormat } from "@/lib/enums";

export type AnketaSource = {
  page?: string;
  cta?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

type AnketaState = {
  isOpen: boolean;
  /** Предвыбранная форма посещения (открытие из карточки). */
  visitFormat?: VisitFormat;
  /** Источник запуска анкеты (для FR-APP-15 / FR-COM-09). */
  source?: AnketaSource;
  open: (opts?: { visitFormat?: VisitFormat; source?: AnketaSource }) => void;
  close: () => void;
};

function currentPageSource(): AnketaSource | undefined {
  if (typeof window === "undefined") return undefined;
  const search = new URLSearchParams(window.location.search);
  return {
    page: window.location.pathname,
    utmSource: search.get("utm_source") || undefined,
    utmMedium: search.get("utm_medium") || undefined,
    utmCampaign: search.get("utm_campaign") || undefined,
  };
}

export const useAnketa = create<AnketaState>((set) => ({
  isOpen: false,
  visitFormat: undefined,
  source: undefined,
  open: (opts) =>
    set({
      isOpen: true,
      visitFormat: opts?.visitFormat,
      source: { ...currentPageSource(), ...opts?.source },
    }),
  close: () => set({ isOpen: false, visitFormat: undefined, source: undefined }),
}));

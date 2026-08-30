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

export const useAnketa = create<AnketaState>((set) => ({
  isOpen: false,
  visitFormat: undefined,
  source: undefined,
  open: (opts) =>
    set({ isOpen: true, visitFormat: opts?.visitFormat, source: opts?.source }),
  close: () => set({ isOpen: false, visitFormat: undefined, source: undefined }),
}));

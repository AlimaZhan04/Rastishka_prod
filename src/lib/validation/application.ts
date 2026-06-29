import { z } from "zod";
import {
  VISIT_FORMAT_VALUES,
  SPEECH_VALUES,
  BEHAVIOR_VALUES,
  TOILET_VALUES,
  FOOD_VALUES,
  EXPERIENCE_VALUES,
} from "@/lib/enums";
import { nameSchema, consentSchema, note200 } from "./common";
import { phoneSchema } from "./phone";

export const sourceSchema = z
  .object({
    page: z.string().max(200).optional(),
    cta: z.string().max(80).optional(),
    utmSource: z.string().max(120).optional(),
    utmMedium: z.string().max(120).optional(),
    utmCampaign: z.string().max(120).optional(),
  })
  .optional();

/** Полная схема анкеты (7 шагов). Серверная валидация — авторитетна. */
export const applicationSchema = z
  .object({
    visitFormat: z.enum(VISIT_FORMAT_VALUES),
    individualNote: note200.optional(),
    speech: z.enum(SPEECH_VALUES),
    behavior: z.enum(BEHAVIOR_VALUES),
    behaviorNote: note200.optional(),
    toilet: z.enum(TOILET_VALUES),
    food: z.array(z.enum(FOOD_VALUES)).min(1, "Выберите хотя бы один вариант"),
    previousExperience: z.enum(EXPERIENCE_VALUES),
    parentName: nameSchema,
    phone: phoneSchema,
    consent: consentSchema,
    source: sourceSchema,
  })
  .refine((d) => d.visitFormat !== "INDIVIDUAL" || !!d.individualNote?.trim(), {
    path: ["individualNote"],
    message: "Опишите желаемый график",
  })
  .refine((d) => d.behavior !== "HAS_ISSUES" || !!d.behaviorNote?.trim(), {
    path: ["behaviorNote"],
    message: "Опишите, что беспокоит",
  });

export type ApplicationInput = z.infer<typeof applicationSchema>;

/** Срезы для пошаговой валидации внутри модального окна анкеты. */
export const stepSchemas = {
  1: z
    .object({ visitFormat: z.enum(VISIT_FORMAT_VALUES), individualNote: note200.optional() })
    .refine((d) => d.visitFormat !== "INDIVIDUAL" || !!d.individualNote?.trim(), {
      path: ["individualNote"],
      message: "Опишите желаемый график",
    }),
  2: z.object({ speech: z.enum(SPEECH_VALUES) }),
  3: z
    .object({ behavior: z.enum(BEHAVIOR_VALUES), behaviorNote: note200.optional() })
    .refine((d) => d.behavior !== "HAS_ISSUES" || !!d.behaviorNote?.trim(), {
      path: ["behaviorNote"],
      message: "Опишите, что беспокоит",
    }),
  4: z.object({ toilet: z.enum(TOILET_VALUES) }),
  5: z.object({ food: z.array(z.enum(FOOD_VALUES)).min(1, "Выберите хотя бы один вариант") }),
  6: z.object({ previousExperience: z.enum(EXPERIENCE_VALUES) }),
  7: z.object({ parentName: nameSchema, phone: phoneSchema, consent: consentSchema }),
} as const;

export const TOTAL_STEPS = 7;

import { z } from "zod";
import { nameSchema, consentSchema } from "./common";
import { phoneSchema } from "./phone";
import { resumeFileMetaSchema } from "./file";

/** Отклик на вакансию: ФИО + телефон + (резюме-файл ИЛИ текст опыта ≤2000) + согласие. */
export const vacancyResponseSchema = z
  .object({
    vacancyId: z.string().min(1),
    name: nameSchema,
    phone: phoneSchema,
    resume: resumeFileMetaSchema.optional(),
    experienceText: z.string().trim().max(2000, "Не более 2000 символов").optional(),
    consent: consentSchema,
    source: z.object({ page: z.string().max(200).optional() }).optional(),
  })
  .refine((d) => !!d.resume || !!d.experienceText?.trim(), {
    path: ["experienceText"],
    message: "Прикрепите резюме или опишите опыт",
  });

export type VacancyResponseInput = z.infer<typeof vacancyResponseSchema>;

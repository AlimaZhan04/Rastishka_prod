import { z } from "zod";

/** Резюме: pdf/doc/docx/jpg/png, до 10 МБ (ТЗ §9, FR-VAC-06). */
export const ALLOWED_RESUME_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
] as const;
export const MAX_RESUME_BYTES = 10 * 1024 * 1024;

/** Изображения контента: jpg/png/webp (ТЗ §9, FR-NEWS-08). */
export const ALLOWED_IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_RESUME_EXT = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"] as const;

/** Метаданные уже загруженного в Storage файла резюме. */
export const resumeFileMetaSchema = z.object({
  key: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.enum(ALLOWED_RESUME_MIME),
  size: z.number().int().positive().max(MAX_RESUME_BYTES, "Файл больше 10 МБ"),
});

export type ResumeFileMeta = z.infer<typeof resumeFileMetaSchema>;

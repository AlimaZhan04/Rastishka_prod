import { z } from "zod";

/** Резюме: pdf/doc/docx/jpg/png, до 25 МБ (FR-VAC-06). */
export const ALLOWED_RESUME_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
] as const;
export const MAX_RESUME_BYTES = 25 * 1024 * 1024;

/** Изображения контента: jpg/png/webp (ТЗ §9, FR-NEWS-08). */
export const ALLOWED_IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_RESUME_EXT = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"] as const;

const RESUME_TYPES_BY_EXTENSION: Record<(typeof ALLOWED_RESUME_EXT)[number], readonly string[]> = {
  ".pdf": ["application/pdf"],
  ".doc": ["application/msword"],
  ".docx": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
};

type UploadedFileDescriptor = { name: string; type: string; size: number };

export type ResumeFileValidation =
  { ok: true; extension: (typeof ALLOWED_RESUME_EXT)[number] } | { ok: false; message: string };

/**
 * Checks browser-supplied file metadata before an upload. The server repeats this check;
 * Storage remains private and a binary signature check is performed there as an extra guard.
 */
export function validateResumeFile(file: UploadedFileDescriptor): ResumeFileValidation {
  if (!Number.isInteger(file.size) || file.size <= 0) {
    return { ok: false, message: "Выберите файл резюме" };
  }
  if (file.size > MAX_RESUME_BYTES) {
    return { ok: false, message: "Размер файла не должен превышать 25 МБ" };
  }

  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!(ALLOWED_RESUME_EXT as readonly string[]).includes(extension)) {
    return { ok: false, message: "Разрешены PDF, DOC, DOCX, JPG и PNG" };
  }

  const expectedMimeTypes =
    RESUME_TYPES_BY_EXTENSION[extension as (typeof ALLOWED_RESUME_EXT)[number]];
  if (!expectedMimeTypes.includes(file.type)) {
    return { ok: false, message: "Тип файла не соответствует его расширению" };
  }

  return { ok: true, extension: extension as (typeof ALLOWED_RESUME_EXT)[number] };
}

/** Метаданные уже загруженного в Storage файла резюме. */
export const resumeFileMetaSchema = z.object({
  key: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.enum(ALLOWED_RESUME_MIME),
  size: z.number().int().positive().max(MAX_RESUME_BYTES, "Файл больше 25 МБ"),
});

export type ResumeFileMeta = z.infer<typeof resumeFileMetaSchema>;

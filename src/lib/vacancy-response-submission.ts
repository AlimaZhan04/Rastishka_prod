import type { z } from "zod";
import { validateResumeFile, type ResumeFileMeta } from "@/lib/validation/file";
import { vacancyResponseSchema, type VacancyResponseInput } from "@/lib/validation/vacancyResponse";

export const VACANCY_RESPONSE_CONSENT_VERSION = "draft-2026-09-02";

export type VacancyResponseSubmissionState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

export const initialVacancyResponseSubmissionState: VacancyResponseSubmissionState = {
  status: "idle",
};

export type ParsedVacancyResponse =
  | { success: true; data: VacancyResponseInput; file?: File }
  | { success: false; fieldErrors: Record<string, string> };

function formString(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/** Required text must reach Zod as an empty string so it emits its human-readable rule. */
function requiredFormString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function getFieldErrors(error: z.ZodError<VacancyResponseInput>): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !fieldErrors[field]) fieldErrors[field] = issue.message;
  }
  return fieldErrors;
}

function selectedResume(formData: FormData): {
  file?: File;
  meta?: ResumeFileMeta;
  error?: string;
} {
  const candidate = formData.get("resumeFile");
  if (typeof File === "undefined" || !(candidate instanceof File) || candidate.size === 0)
    return {};

  const validation = validateResumeFile(candidate);
  if (!validation.ok) return { error: validation.message };

  return {
    file: candidate,
    // The object key is assigned only after the private storage upload succeeds.
    meta: {
      key: "pending-upload",
      fileName: candidate.name,
      mimeType: candidate.type as ResumeFileMeta["mimeType"],
      size: candidate.size,
    },
  };
}

/** Converts a multipart form into the exact validated repository contract. */
export function parseVacancyResponseFormData(formData: FormData): ParsedVacancyResponse {
  const resume = selectedResume(formData);
  if (resume.error) return { success: false, fieldErrors: { resumeFile: resume.error } };

  const parsed = vacancyResponseSchema.safeParse({
    vacancyId: formString(formData, "vacancyId"),
    name: requiredFormString(formData, "name"),
    phone: requiredFormString(formData, "phone"),
    resume: resume.meta,
    experienceText: formString(formData, "experienceText"),
    consent: formData.get("consent") === "on",
    source: {
      page: formString(formData, "sourcePage"),
    },
  });
  if (!parsed.success) return { success: false, fieldErrors: getFieldErrors(parsed.error) };
  return { success: true, data: parsed.data, ...(resume.file ? { file: resume.file } : {}) };
}

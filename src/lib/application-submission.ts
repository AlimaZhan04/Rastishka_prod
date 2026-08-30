import type { z } from "zod";
import { applicationSchema, type ApplicationInput } from "@/lib/validation/application";

export type { ApplicationInput } from "@/lib/validation/application";

export const APPLICATION_CONSENT_VERSION = "draft-2026-08-30";

export type ApplicationSubmissionState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

export const initialApplicationSubmissionState: ApplicationSubmissionState = { status: "idle" };

type SubmissionGuard =
  | { ok: true; idempotencyKey: string }
  | { ok: false; message: string };

const GENERIC_SUBMISSION_ERROR = "Не удалось отправить анкету. Попробуйте ещё раз немного позже.";

function formString(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/**
 * Converts an untrusted form payload into the single validated data contract used by the
 * persistence layer. This is intentionally shared by the server action and unit tests.
 */
export function parseApplicationFormData(
  formData: FormData,
): z.ZodSafeParseResult<ApplicationInput> {
  return applicationSchema.safeParse({
    visitFormat: formString(formData, "visitFormat"),
    individualNote: formString(formData, "individualNote"),
    speech: formString(formData, "speech"),
    behavior: formString(formData, "behavior"),
    behaviorNote: formString(formData, "behaviorNote"),
    toilet: formString(formData, "toilet"),
    food: formData.getAll("food").filter((value): value is string => typeof value === "string"),
    previousExperience: formString(formData, "previousExperience"),
    parentName: formString(formData, "parentName"),
    phone: formString(formData, "phone"),
    consent: formData.get("consent") === "on",
    source: {
      page: formString(formData, "sourcePage"),
      cta: formString(formData, "sourceCta"),
      utmSource: formString(formData, "utmSource"),
      utmMedium: formString(formData, "utmMedium"),
      utmCampaign: formString(formData, "utmCampaign"),
    },
  });
}

export function getApplicationFieldErrors(
  error: z.ZodError<ApplicationInput>,
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }
  return fieldErrors;
}

/** Basic bot friction; server validation and rate limiting remain authoritative. */
export function validateSubmissionGuard(formData: FormData): SubmissionGuard {
  if (formString(formData, "website")) {
    return { ok: false, message: GENERIC_SUBMISSION_ERROR };
  }

  const idempotencyKey = formString(formData, "idempotencyKey");
  if (!idempotencyKey || !/^[A-Za-z0-9_-]{16,128}$/.test(idempotencyKey)) {
    return { ok: false, message: GENERIC_SUBMISSION_ERROR };
  }

  return { ok: true, idempotencyKey };
}

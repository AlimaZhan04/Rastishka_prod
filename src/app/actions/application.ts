"use server";

import { headers } from "next/headers";
import {
  getApplicationFieldErrors,
  initialApplicationSubmissionState,
  parseApplicationFormData,
  validateSubmissionGuard,
  type ApplicationSubmissionState,
} from "@/lib/application-submission";
import { logServerError } from "@/lib/observability";
import { saveApplication } from "@/lib/server/application-repository";
import { allowApplicationSubmission } from "@/lib/server/submission-rate-limit";
import { notifyNewApplicationInTelegram } from "@/lib/server/telegram-notifier";

function clientIdentifier(requestHeaders: Headers): string {
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || requestHeaders.get("x-real-ip")?.trim() || "unknown";
}

export async function submitApplication(
  _previousState: ApplicationSubmissionState = initialApplicationSubmissionState,
  formData: FormData,
): Promise<ApplicationSubmissionState> {
  void _previousState;
  const guard = validateSubmissionGuard(formData);
  if (!guard.ok) return { status: "error", message: guard.message };

  const parsed = parseApplicationFormData(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Проверьте, пожалуйста, заполнение анкеты.",
      fieldErrors: getApplicationFieldErrors(parsed.error),
    };
  }

  const requestHeaders = await headers();
  if (!allowApplicationSubmission(clientIdentifier(requestHeaders))) {
    return {
      status: "error",
      message: "Слишком много попыток. Пожалуйста, попробуйте снова через несколько минут.",
    };
  }

  try {
    const saved = await saveApplication(parsed.data, guard.idempotencyKey);
    if (saved.created) {
      try {
        await notifyNewApplicationInTelegram(saved.applicationId);
      } catch (error) {
        // A messaging outage must not make a successfully saved application look failed.
        logServerError("application.telegram_notification_failed", error, {
          operation: "send_new_application_notification",
        });
      }
    }
    return { status: "success" };
  } catch (error) {
    logServerError("application.submit_failed", error, { operation: "create_application" });
    return {
      status: "error",
      message: "Не удалось отправить анкету. Попробуйте ещё раз немного позже.",
    };
  }
}

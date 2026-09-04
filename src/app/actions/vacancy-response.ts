"use server";

import { headers } from "next/headers";
import {
  initialVacancyResponseSubmissionState,
  parseVacancyResponseFormData,
  type VacancyResponseSubmissionState,
} from "@/lib/vacancy-response-submission";
import { logServerError } from "@/lib/observability";
import { InvalidResumeContentError, prepareResume } from "@/lib/server/resume-storage";
import {
  assertVacancyIsPublished,
  saveVacancyResponse,
  VacancyUnavailableError,
} from "@/lib/server/vacancy-response-repository";
import { allowVacancyResponseSubmission } from "@/lib/server/submission-rate-limit";
import { notifyNewVacancyResponseInTelegram } from "@/lib/server/telegram-notifier";
import { validateSubmissionGuard } from "@/lib/application-submission";

function clientIdentifier(requestHeaders: Headers): string {
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || requestHeaders.get("x-real-ip")?.trim() || "unknown";
}

export async function submitVacancyResponse(
  _previousState: VacancyResponseSubmissionState = initialVacancyResponseSubmissionState,
  formData: FormData,
): Promise<VacancyResponseSubmissionState> {
  void _previousState;
  const guard = validateSubmissionGuard(formData);
  if (!guard.ok)
    return { status: "error", message: "Не удалось отправить отклик. Попробуйте ещё раз." };

  const parsed = parseVacancyResponseFormData(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Проверьте, пожалуйста, заполнение формы.",
      fieldErrors: parsed.fieldErrors,
    };
  }

  const requestHeaders = await headers();
  if (!allowVacancyResponseSubmission(clientIdentifier(requestHeaders))) {
    return {
      status: "error",
      message: "Слишком много попыток. Пожалуйста, попробуйте снова через несколько минут.",
    };
  }

  try {
    await assertVacancyIsPublished(parsed.data.vacancyId);
    const resume = parsed.file ? await prepareResume(parsed.file) : undefined;
    const saved = await saveVacancyResponse({ ...parsed.data, resume }, guard.idempotencyKey);

    if (saved.created) {
      try {
        await notifyNewVacancyResponseInTelegram(saved.vacancyResponseId);
      } catch (error) {
        logServerError("vacancy_response.telegram_notification_failed", error, {
          operation: "send_new_vacancy_response_notification",
        });
      }
    }
    return { status: "success" };
  } catch (error) {
    if (error instanceof InvalidResumeContentError) {
      return {
        status: "error",
        message: "Проверьте файл резюме.",
        fieldErrors: { resumeFile: "Файл не соответствует указанному типу" },
      };
    }
    if (error instanceof VacancyUnavailableError) {
      return {
        status: "error",
        message: "Эта вакансия уже закрыта. Выберите другую актуальную вакансию.",
      };
    }
    logServerError("vacancy_response.submit_failed", error, {
      operation: "create_vacancy_response",
    });
    return {
      status: "error",
      message: "Не удалось отправить отклик. Попробуйте ещё раз немного позже.",
    };
  }
}

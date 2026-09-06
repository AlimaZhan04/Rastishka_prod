"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { CheckCircle2, Paperclip } from "lucide-react";
import { submitVacancyResponse } from "@/app/actions/vacancy-response";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  initialVacancyResponseSubmissionState,
  parseVacancyResponseFormData,
  type VacancyResponseSubmissionState,
} from "@/lib/vacancy-response-submission";
import { formatKgPhone } from "@/lib/phone-format";
import { validateResumeFile } from "@/lib/validation/file";

const FIELD_IDS: Record<string, string> = {
  name: "response-name",
  phone: "response-phone",
  resumeFile: "resume-file",
  experienceText: "experience-text",
  consent: "response-consent",
};

function ErrorText({ message, id }: { message?: string; id?: string }) {
  return message ? (
    <p id={id} className="text-destructive mt-1.5 text-sm" role="alert">
      {message}
    </p>
  ) : null;
}

export function VacancyResponseForm({
  vacancyId,
  sourcePage,
}: {
  vacancyId: string;
  sourcePage: string;
}) {
  const idempotencyKeyRef = useRef("");
  const fileRef = useRef<HTMLInputElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const submissionInFlight = useRef(false);
  const [phone, setPhone] = useState("");
  const [fileName, setFileName] = useState<string>();
  const [fileError, setFileError] = useState<string>();
  const [feedback, setFeedback] =
    useState<Extract<VacancyResponseSubmissionState, { status: "error" }>>();
  const [state, formAction, isPending] = useActionState<VacancyResponseSubmissionState, FormData>(
    async (previousState, payload) => {
      try {
        const result = await submitVacancyResponse(previousState, payload);
        setFeedback(result.status === "error" ? result : undefined);
        return result;
      } catch {
        const result = {
          status: "error" as const,
          message:
            "Не удалось связаться с сервером. Проверьте соединение и попробуйте ещё раз — данные сохранены в форме.",
        };
        setFeedback(result);
        return result;
      } finally {
        submissionInFlight.current = false;
      }
    },
    initialVacancyResponseSubmissionState,
  );
  const fieldErrors = feedback?.fieldErrors;

  useEffect(() => {
    if (feedback) feedbackRef.current?.focus();
  }, [feedback]);

  function clearResume() {
    if (fileRef.current) fileRef.current.value = "";
    setFileName(undefined);
    setFileError(undefined);
    setFeedback(undefined);
    fileRef.current?.focus();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending || submissionInFlight.current) return;
    const payload = new FormData(event.currentTarget);
    const parsed = parseVacancyResponseFormData(payload);
    if (!parsed.success) {
      setFeedback({
        status: "error",
        message: "Проверьте, пожалуйста, заполнение формы.",
        fieldErrors: parsed.fieldErrors,
      });
      return;
    }
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = `vacancy_response_${crypto.randomUUID()}`;
    }
    payload.set("idempotencyKey", idempotencyKeyRef.current);
    submissionInFlight.current = true;
    setFeedback(undefined);
    startTransition(() => formAction(payload));
  }

  if (state.status === "success") {
    return (
      <div className="bg-brand-mint-soft/75 rounded-2xl p-6 text-center">
        <CheckCircle2 className="text-brand-teal mx-auto size-11" aria-hidden="true" />
        <h2 className="font-heading text-primary mt-3 text-2xl font-bold">Отклик отправлен</h2>
        <p className="text-muted-foreground mt-2">
          Спасибо! Мы рассмотрим информацию и свяжемся с вами.
        </p>
      </div>
    );
  }

  return (
    <form
      method="post"
      onSubmit={handleSubmit}
      className="space-y-5"
      aria-busy={isPending}
      noValidate
    >
      <input type="hidden" name="vacancyId" value={vacancyId} />
      <input type="hidden" name="sourcePage" value={sourcePage} />
      <div className="hidden" aria-hidden="true">
        <Label htmlFor="vacancy-website">Не заполняйте это поле</Label>
        <Input id="vacancy-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {feedback ? (
        <div
          ref={feedbackRef}
          tabIndex={-1}
          className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm"
          role="alert"
        >
          <p>{feedback.message}</p>
          {fieldErrors && (
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {Object.entries(fieldErrors)
                .filter(([field]) => FIELD_IDS[field])
                .map(([field, message]) => (
                  <li key={field}>
                    <a
                      href={`#${FIELD_IDS[field]}`}
                      className="underline underline-offset-2"
                      onClick={(event) => {
                        event.preventDefault();
                        document.getElementById(FIELD_IDS[field])?.focus();
                      }}
                    >
                      {message}
                    </a>
                  </li>
                ))}
            </ul>
          )}
        </div>
      ) : null}

      <div>
        <Label htmlFor="response-name">ФИО</Label>
        <Input
          id="response-name"
          name="name"
          className="mt-2"
          autoComplete="name"
          maxLength={120}
          aria-invalid={Boolean(fieldErrors?.name)}
          aria-describedby={fieldErrors?.name ? "response-name-error" : undefined}
        />
        <ErrorText id="response-name-error" message={fieldErrors?.name} />
      </div>

      <div>
        <Label htmlFor="response-phone">Телефон</Label>
        <Input
          id="response-phone"
          name="phone"
          className="mt-2"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+996 XXX XXX XXX"
          value={phone}
          onChange={(event) => setPhone(formatKgPhone(event.target.value))}
          aria-invalid={Boolean(fieldErrors?.phone)}
          aria-describedby={fieldErrors?.phone ? "response-phone-error" : undefined}
        />
        <ErrorText id="response-phone-error" message={fieldErrors?.phone} />
      </div>

      <div>
        <Label htmlFor="resume-file">Резюме</Label>
        <Input
          ref={fileRef}
          id="resume-file"
          name="resumeFile"
          className="mt-2"
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
          aria-invalid={Boolean(fileError || fieldErrors?.resumeFile)}
          aria-describedby={
            fileError || fieldErrors?.resumeFile
              ? "resume-file-help resume-file-error"
              : "resume-file-help"
          }
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            setFileName(file?.name);
            setFeedback(undefined);
            if (!file) return setFileError(undefined);
            const validation = validateResumeFile(file);
            setFileError(validation.ok ? undefined : validation.message);
          }}
        />
        <p
          id="resume-file-help"
          className="text-muted-foreground mt-1.5 flex items-center gap-1.5 text-xs"
        >
          <Paperclip className="size-3.5" aria-hidden="true" /> PDF, DOC, DOCX, JPG или PNG, до 10
          МБ.
        </p>
        <ErrorText id="resume-file-error" message={fileError || fieldErrors?.resumeFile} />
        {fileName && (
          <Button
            type="button"
            variant="outline"
            className="mt-2"
            onClick={clearResume}
            disabled={isPending}
          >
            Убрать файл
          </Button>
        )}
      </div>

      <div>
        <Label htmlFor="experience-text">Или кратко опишите опыт работы</Label>
        <Textarea
          id="experience-text"
          name="experienceText"
          className="mt-2 min-h-28"
          maxLength={2000}
          placeholder="Образование, опыт и специализация — до 2000 символов"
          aria-invalid={Boolean(fieldErrors?.experienceText)}
          aria-describedby={fieldErrors?.experienceText ? "experience-text-error" : undefined}
        />
        <ErrorText id="experience-text-error" message={fieldErrors?.experienceText} />
      </div>

      <div>
        <Label className="border-border items-start gap-3 rounded-lg border p-3 text-sm leading-5 font-normal">
          <input
            id="response-consent"
            type="checkbox"
            name="consent"
            className="accent-primary mt-0.5 size-5 shrink-0"
            aria-invalid={Boolean(fieldErrors?.consent)}
            aria-describedby={fieldErrors?.consent ? "response-consent-error" : undefined}
          />
          <span>
            Соглашаюсь на обработку персональных данных в соответствии с{" "}
            <a
              className="text-primary underline underline-offset-2"
              href="/privacy"
              target="_blank"
              rel="noreferrer"
            >
              проектом политики
            </a>
            .
          </span>
        </Label>
        <ErrorText id="response-consent-error" message={fieldErrors?.consent} />
      </div>

      <Button type="submit" className="h-12 w-full rounded-full" disabled={isPending}>
        {isPending ? "Отправляем…" : "Отправить отклик"}
      </Button>
    </form>
  );
}

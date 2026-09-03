"use client";

import { startTransition, useActionState, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, Paperclip } from "lucide-react";
import { submitVacancyResponse } from "@/app/actions/vacancy-response";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  initialVacancyResponseSubmissionState,
  type VacancyResponseSubmissionState,
} from "@/lib/vacancy-response-submission";
import { formatKgPhone } from "@/lib/phone-format";
import { validateResumeFile } from "@/lib/validation/file";

function ErrorText({ message, id }: { message?: string; id?: string }) {
  return message ? (
    <p id={id} className="text-destructive mt-1.5 text-sm">
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
  const idempotencyKeyRef = useRef<HTMLInputElement>(null);
  const [phone, setPhone] = useState("");
  const [fileError, setFileError] = useState<string>();
  const [state, formAction, isPending] = useActionState<VacancyResponseSubmissionState, FormData>(
    submitVacancyResponse,
    initialVacancyResponseSubmissionState,
  );
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (idempotencyKeyRef.current && !idempotencyKeyRef.current.value) {
      idempotencyKeyRef.current.value = `vacancy_response_${crypto.randomUUID()}`;
    }
    const payload = new FormData(event.currentTarget);
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
    <form method="post" onSubmit={handleSubmit} className="space-y-5" noValidate>
      <input type="hidden" name="vacancyId" value={vacancyId} />
      <input type="hidden" name="sourcePage" value={sourcePage} />
      <input ref={idempotencyKeyRef} type="hidden" name="idempotencyKey" defaultValue="" />
      <div className="hidden" aria-hidden="true">
        <Label htmlFor="vacancy-website">Не заполняйте это поле</Label>
        <Input id="vacancy-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === "error" ? (
        <p className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm" role="alert">
          {state.message}
        </p>
      ) : null}

      <div>
        <Label htmlFor="response-name">ФИО</Label>
        <Input
          id="response-name"
          name="name"
          className="mt-2"
          autoComplete="name"
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

      <Button
        type="submit"
        className="h-12 w-full rounded-full"
        disabled={isPending || Boolean(fileError)}
      >
        {isPending ? "Отправляем…" : "Отправить отклик"}
      </Button>
    </form>
  );
}

"use client";

import { useActionState, useId, useState } from "react";
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
import { validateResumeFile } from "@/lib/validation/file";

function formatKgPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  const subscriber = (digits.startsWith("996") ? digits.slice(3) : digits).slice(0, 9);
  const groups = [subscriber.slice(0, 3), subscriber.slice(3, 6), subscriber.slice(6, 9)].filter(
    Boolean,
  );
  return groups.length ? `+996 ${groups.join(" ")}` : "+996 ";
}

function ErrorText({ message }: { message?: string }) {
  return message ? <p className="text-destructive mt-1.5 text-sm">{message}</p> : null;
}

export function VacancyResponseForm({
  vacancyId,
  sourcePage,
}: {
  vacancyId: string;
  sourcePage: string;
}) {
  const reactId = useId().replace(/[^A-Za-z0-9_-]/g, "");
  const idempotencyKey = `vacancy_response_${reactId}`;
  const [phone, setPhone] = useState("");
  const [fileError, setFileError] = useState<string>();
  const [state, formAction, isPending] = useActionState<VacancyResponseSubmissionState, FormData>(
    submitVacancyResponse,
    initialVacancyResponseSubmissionState,
  );
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  if (state.status === "success") {
    return (
      <div className="bg-primary/5 rounded-2xl p-6 text-center">
        <CheckCircle2 className="text-primary mx-auto size-11" aria-hidden="true" />
        <h2 className="font-heading text-primary mt-3 text-2xl font-bold">Отклик отправлен</h2>
        <p className="text-muted-foreground mt-2">
          Спасибо! Мы рассмотрим информацию и свяжемся с вами.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="vacancyId" value={vacancyId} />
      <input type="hidden" name="sourcePage" value={sourcePage} />
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
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
        <ErrorText message={fieldErrors?.name} />
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
        <ErrorText message={fieldErrors?.phone} />
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
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (!file) return setFileError(undefined);
            const validation = validateResumeFile(file);
            setFileError(validation.ok ? undefined : validation.message);
          }}
        />
        <p className="text-muted-foreground mt-1.5 flex items-center gap-1.5 text-xs">
          <Paperclip className="size-3.5" aria-hidden="true" /> PDF, DOC, DOCX, JPG или PNG, до 25
          МБ.
        </p>
        <ErrorText message={fileError || fieldErrors?.resumeFile} />
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
        />
        <ErrorText message={fieldErrors?.experienceText} />
      </div>

      <div>
        <Label className="border-border items-start gap-3 rounded-lg border p-3 text-sm leading-5 font-normal">
          <input
            type="checkbox"
            name="consent"
            className="accent-primary mt-0.5 size-4"
            aria-invalid={Boolean(fieldErrors?.consent)}
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
        <ErrorText message={fieldErrors?.consent} />
      </div>

      <Button
        type="submit"
        className="h-11 w-full rounded-full"
        disabled={isPending || Boolean(fileError)}
      >
        {isPending ? "Отправляем…" : "Отправить отклик"}
      </Button>
    </form>
  );
}

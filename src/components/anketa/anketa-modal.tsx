"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useForm, useWatch, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { submitApplication } from "@/app/actions/application";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAnketa } from "@/lib/anketa-store";
import {
  BEHAVIOR_OPTIONS,
  EXPERIENCE_OPTIONS,
  FOOD_OPTIONS,
  SPEECH_OPTIONS,
  TOILET_OPTIONS,
  VISIT_FORMATS,
} from "@/lib/enums";
import {
  initialApplicationSubmissionState,
  type ApplicationInput,
} from "@/lib/application-submission";
import { applicationSchema, stepSchemas, TOTAL_STEPS } from "@/lib/validation/application";

const emptyValues: ApplicationInput = {
  visitFormat: "FULL_DAY",
  individualNote: "",
  speech: "AGE_APPROPRIATE",
  behavior: "NO_ISSUES",
  behaviorNote: "",
  toilet: "TRAINED",
  food: [],
  previousExperience: "NONE",
  parentName: "",
  phone: "",
  consent: false,
};

type OptionProps = {
  label: string;
  value: string;
  checked?: boolean;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

function RadioOption({ label, value, checked, ...props }: Omit<OptionProps, "error">) {
  return (
    <label
      className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 text-sm transition-colors hover:bg-muted/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
    >
      <input
        {...props}
        value={value}
        checked={checked}
        type="radio"
        className="mt-0.5 size-4 accent-primary"
      />
      <span>{label}</span>
    </label>
  );
}

function CheckboxOption({ label, value, checked, error, ...props }: OptionProps) {
  return (
    <label
      className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 text-sm transition-colors hover:bg-muted/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
    >
      <input
        {...props}
        value={value}
        checked={checked}
        type="checkbox"
        className="mt-0.5 size-4 accent-primary"
        aria-invalid={Boolean(error)}
      />
      <span>{label}</span>
    </label>
  );
}

function ErrorText({ message }: { message?: string }) {
  return message ? <p className="mt-2 text-sm text-destructive">{message}</p> : null;
}

function AnketaForm() {
  const close = useAnketa((state) => state.close);
  const selectedVisitFormat = useAnketa((state) => state.visitFormat);
  const source = useAnketa((state) => state.source);
  const formRef = useRef<HTMLFormElement>(null);
  const formId = useId().replace(/[^A-Za-z0-9_-]/g, "");
  const idempotencyKey = `application_form_${formId}`;
  const [step, setStep] = useState(1);
  const [state, formAction, isPending] = useActionState(
    submitApplication,
    initialApplicationSubmissionState,
  );
  const form = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { ...emptyValues, visitFormat: selectedVisitFormat ?? emptyValues.visitFormat },
    mode: "onTouched",
  });
  const { errors } = form.formState;
  const visitFormat = useWatch({ control: form.control, name: "visitFormat" });
  const speech = useWatch({ control: form.control, name: "speech" });
  const behavior = useWatch({ control: form.control, name: "behavior" });
  const toilet = useWatch({ control: form.control, name: "toilet" });
  const food = useWatch({ control: form.control, name: "food" });
  const previousExperience = useWatch({ control: form.control, name: "previousExperience" });

  useEffect(() => {
    if (state.status !== "error" || !state.fieldErrors) return;
    for (const [field, message] of Object.entries(state.fieldErrors)) {
      form.setError(field as FieldPath<ApplicationInput>, { type: "server", message });
    }
  }, [form, state]);

  function validateStep(): boolean {
    const result = stepSchemas[step as keyof typeof stepSchemas].safeParse(form.getValues());
    form.clearErrors();
    if (result.success) return true;

    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string") {
        form.setError(field as FieldPath<ApplicationInput>, { type: "validate", message: issue.message });
      }
    }
    return false;
  }

  function nextStep() {
    if (validateStep()) setStep((current) => Math.min(TOTAL_STEPS, current + 1));
  }

  async function sendForm() {
    const valid = await form.trigger(undefined, { shouldFocus: true });
    if (!valid) return;
    formRef.current?.requestSubmit();
  }

  if (state.status === "success") {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center gap-5 px-6 py-10 text-center">
        <CheckCircle2 className="size-12 text-primary" aria-hidden="true" />
        <div className="space-y-2">
          <DialogTitle>Анкета отправлена</DialogTitle>
          <DialogDescription>
            Спасибо! Мы сохранили ответы и свяжемся с вами после их просмотра.
          </DialogDescription>
        </div>
        <Button type="button" onClick={close}>
          Закрыть
        </Button>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="flex min-h-100 flex-col">
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      <input type="hidden" name="sourcePage" value={source?.page ?? ""} />
      <input type="hidden" name="sourceCta" value={source?.cta ?? ""} />
      <input type="hidden" name="utmSource" value={source?.utmSource ?? ""} />
      <input type="hidden" name="utmMedium" value={source?.utmMedium ?? ""} />
      <input type="hidden" name="utmCampaign" value={source?.utmCampaign ?? ""} />
      <div className="hidden" aria-hidden="true">
        <Label htmlFor="website">Не заполняйте это поле</Label>
        <Input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="border-b px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <DialogTitle>Предварительная анкета</DialogTitle>
            <DialogDescription className="mt-1">
              Шаг {step} из {TOTAL_STEPS}
            </DialogDescription>
          </div>
          <Button type="button" variant="ghost" size="icon-sm" onClick={close} aria-label="Закрыть анкету">
            <X aria-hidden="true" />
          </Button>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
          <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
        </div>
      </div>

      <div className="flex-1 px-5 py-5">
        {state.status === "error" && (
          <p className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
            {state.message}
          </p>
        )}

        <div hidden={step !== 1}>
          <fieldset className="space-y-3">
            <legend className="text-base font-medium">Какой формат посещения вам удобен?</legend>
            {VISIT_FORMATS.map((option) => (
              <RadioOption
                key={option.value}
                label={option.hours ? `${option.title}, ${option.hours}` : option.title}
                value={option.value}
                checked={visitFormat === option.value}
                {...form.register("visitFormat")}
              />
            ))}
            {visitFormat === "INDIVIDUAL" && (
              <div className="pt-1">
                <Label htmlFor="individualNote">Пожелания по графику</Label>
                <Textarea
                  id="individualNote"
                  className="mt-2"
                  maxLength={200}
                  placeholder="Например, удобные дни и время"
                  aria-invalid={Boolean(errors.individualNote)}
                  {...form.register("individualNote")}
                />
                <ErrorText message={errors.individualNote?.message} />
              </div>
            )}
            <ErrorText message={errors.visitFormat?.message} />
          </fieldset>
        </div>

        <div hidden={step !== 2}>
          <fieldset className="space-y-3">
            <legend className="text-base font-medium">Как развивается речь ребёнка?</legend>
            {SPEECH_OPTIONS.map((option) => (
              <RadioOption
                key={option.value}
                label={option.label}
                value={option.value}
                checked={speech === option.value}
                {...form.register("speech")}
              />
            ))}
            <ErrorText message={errors.speech?.message} />
          </fieldset>
        </div>

        <div hidden={step !== 3}>
          <fieldset className="space-y-3">
            <legend className="text-base font-medium">Есть ли особенности поведения?</legend>
            {BEHAVIOR_OPTIONS.map((option) => (
              <RadioOption
                key={option.value}
                label={option.label}
                value={option.value}
                checked={behavior === option.value}
                {...form.register("behavior")}
              />
            ))}
            {behavior === "HAS_ISSUES" && (
              <div className="pt-1">
                <Label htmlFor="behaviorNote">Что беспокоит?</Label>
                <Textarea
                  id="behaviorNote"
                  className="mt-2"
                  maxLength={200}
                  placeholder="Коротко опишите ситуацию"
                  aria-invalid={Boolean(errors.behaviorNote)}
                  {...form.register("behaviorNote")}
                />
                <ErrorText message={errors.behaviorNote?.message} />
              </div>
            )}
            <ErrorText message={errors.behavior?.message} />
          </fieldset>
        </div>

        <div hidden={step !== 4}>
          <fieldset className="space-y-3">
            <legend className="text-base font-medium">Как обстоят дела с туалетом?</legend>
            {TOILET_OPTIONS.map((option) => (
              <RadioOption
                key={option.value}
                label={option.label}
                value={option.value}
                checked={toilet === option.value}
                {...form.register("toilet")}
              />
            ))}
            <ErrorText message={errors.toilet?.message} />
          </fieldset>
        </div>

        <div hidden={step !== 5}>
          <fieldset className="space-y-3">
            <legend className="text-base font-medium">Какие навыки питания есть? Можно выбрать несколько.</legend>
            {FOOD_OPTIONS.map((option) => (
              <CheckboxOption
                key={option.value}
                label={option.label}
                value={option.value}
                checked={food.includes(option.value)}
                error={errors.food?.message}
                {...form.register("food")}
              />
            ))}
            <ErrorText message={errors.food?.message} />
          </fieldset>
        </div>

        <div hidden={step !== 6}>
          <fieldset className="space-y-3">
            <legend className="text-base font-medium">Был ли опыт занятий?</legend>
            {EXPERIENCE_OPTIONS.map((option) => (
              <RadioOption
                key={option.value}
                label={option.label}
                value={option.value}
                checked={previousExperience === option.value}
                {...form.register("previousExperience")}
              />
            ))}
            <ErrorText message={errors.previousExperience?.message} />
          </fieldset>
        </div>

        <div hidden={step !== 7}>
          <fieldset className="space-y-4">
            <legend className="text-base font-medium">Как с вами связаться?</legend>
            <div>
              <Label htmlFor="parentName">Ваше имя</Label>
              <Input
                id="parentName"
                className="mt-2"
                autoComplete="name"
                aria-invalid={Boolean(errors.parentName)}
                {...form.register("parentName")}
              />
              <ErrorText message={errors.parentName?.message} />
            </div>
            <div>
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                className="mt-2"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+996 XXX XXX XXX"
                aria-invalid={Boolean(errors.phone)}
                {...form.register("phone")}
              />
              <ErrorText message={errors.phone?.message} />
            </div>
            <Label className="items-start gap-3 rounded-lg border border-border p-3 text-sm font-normal leading-5">
              <input
                type="checkbox"
                className="mt-0.5 size-4 accent-primary"
                aria-invalid={Boolean(errors.consent)}
                {...form.register("consent")}
              />
              <span>
                Соглашаюсь на обработку персональных данных в соответствии с{" "}
                <a className="text-primary underline underline-offset-2" href="/privacy" target="_blank" rel="noreferrer">
                  проектом политики
                </a>
                .
              </span>
            </Label>
            <ErrorText message={errors.consent?.message} />
          </fieldset>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t px-5 py-4">
        {step > 1 ? (
          <Button type="button" variant="outline" onClick={() => setStep((current) => current - 1)} disabled={isPending}>
            <ChevronLeft aria-hidden="true" /> Назад
          </Button>
        ) : (
          <span />
        )}
        {step < TOTAL_STEPS ? (
          <Button type="button" onClick={nextStep}>
            Далее <ChevronRight aria-hidden="true" />
          </Button>
        ) : (
          <Button type="button" onClick={sendForm} disabled={isPending}>
            {isPending ? "Отправляем…" : "Отправить анкету"}
          </Button>
        )}
      </div>
    </form>
  );
}

export function AnketaModal() {
  const isOpen = useAnketa((state) => state.isOpen);
  const close = useAnketa((state) => state.close);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-lg overflow-y-auto p-0 sm:max-w-lg" showCloseButton={false}>
        {isOpen && <AnketaForm />}
      </DialogContent>
    </Dialog>
  );
}

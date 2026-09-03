"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useForm, useWatch, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { submitApplication } from "@/app/actions/application";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
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
import { formatKgPhone } from "@/lib/phone-format";
import { applicationSchema, stepSchemas, TOTAL_STEPS } from "@/lib/validation/application";
import { BrandMark, DoodleHeart } from "@/components/brand/brand-motifs";

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
    <label className="group/option border-border hover:border-brand-mint has-[:checked]:border-primary/55 has-[:checked]:bg-secondary/75 flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border bg-white/72 p-3.5 text-sm transition-[transform,background-color,border-color,box-shadow] duration-200 hover:-translate-y-0.5 has-[:checked]:shadow-sm sm:text-base">
      <input
        {...props}
        value={value}
        checked={checked}
        type="radio"
        className="accent-primary size-5 shrink-0"
      />
      <span>{label}</span>
    </label>
  );
}

function CheckboxOption({ label, value, checked, error, ...props }: OptionProps) {
  return (
    <label className="group/option border-border hover:border-brand-mint has-[:checked]:border-brand-teal/60 has-[:checked]:bg-brand-mint-soft/80 flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border bg-white/72 p-3.5 text-sm transition-[transform,background-color,border-color,box-shadow] duration-200 hover:-translate-y-0.5 has-[:checked]:shadow-sm sm:text-base">
      <input
        {...props}
        value={value}
        checked={checked}
        type="checkbox"
        className="accent-primary size-5 shrink-0"
        aria-invalid={Boolean(error)}
      />
      <span>{label}</span>
    </label>
  );
}

function ErrorText({ message, id }: { message?: string; id?: string }) {
  return message ? (
    <p id={id} className="text-destructive mt-2 text-sm" role="alert">
      {message}
    </p>
  ) : null;
}

function AnketaForm() {
  const close = useAnketa((state) => state.close);
  const selectedVisitFormat = useAnketa((state) => state.visitFormat);
  const source = useAnketa((state) => state.source);
  const formRef = useRef<HTMLFormElement>(null);
  const idempotencyKeyRef = useRef<HTMLInputElement>(null);
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
  const phoneField = form.register("phone");

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

    let firstInvalidField: FieldPath<ApplicationInput> | undefined;
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string") {
        const fieldPath = field as FieldPath<ApplicationInput>;
        firstInvalidField ??= fieldPath;
        form.setError(fieldPath, {
          type: "validate",
          message: issue.message,
        });
      }
    }
    if (firstInvalidField) form.setFocus(firstInvalidField);
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (idempotencyKeyRef.current && !idempotencyKeyRef.current.value) {
      idempotencyKeyRef.current.value = `application_${crypto.randomUUID()}`;
    }
    const payload = new FormData(event.currentTarget);
    startTransition(() => formAction(payload));
  }

  if (state.status === "success") {
    return (
      <div className="relative flex min-h-[28rem] flex-col items-center justify-center gap-5 overflow-hidden px-6 py-10 text-center">
        <DoodleHeart className="text-brand-pink/70 absolute top-8 right-8 size-14 rotate-12" />
        <span className="bg-brand-mint-soft text-brand-teal grid size-20 place-items-center rounded-full">
          <CheckCircle2 className="size-11" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <DialogTitle>Анкета отправлена</DialogTitle>
          <DialogDescription>
            Спасибо! Мы сохранили ответы и свяжемся с вами после их просмотра.
          </DialogDescription>
        </div>
        <Button type="button" onClick={close} className="rounded-full px-6">
          Закрыть
        </Button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      method="post"
      onSubmit={handleSubmit}
      className="flex min-h-[min(42rem,calc(100dvh-1rem))] flex-col sm:min-h-[min(34rem,calc(100dvh-1rem))]"
    >
      <input ref={idempotencyKeyRef} type="hidden" name="idempotencyKey" defaultValue="" />
      <input type="hidden" name="sourcePage" value={source?.page ?? ""} />
      <input type="hidden" name="sourceCta" value={source?.cta ?? ""} />
      <input type="hidden" name="utmSource" value={source?.utmSource ?? ""} />
      <input type="hidden" name="utmMedium" value={source?.utmMedium ?? ""} />
      <input type="hidden" name="utmCampaign" value={source?.utmCampaign ?? ""} />
      <div className="hidden" aria-hidden="true">
        <Label htmlFor="website">Не заполняйте это поле</Label>
        <Input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="border-border/65 from-brand-mint-soft/70 to-secondary/65 relative border-b bg-gradient-to-r via-white/90 px-5 py-4 sm:px-7 sm:py-5">
        <DoodleHeart className="text-brand-pink/55 absolute top-3 right-14 size-9 rotate-12" />
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <BrandMark className="text-primary h-12 w-11" />
            <div>
              <DialogTitle className="text-primary text-lg font-bold">
                Предварительная анкета
              </DialogTitle>
              <DialogDescription className="text-brand-teal mt-0.5 font-medium">
                Шаг {step} из {TOTAL_STEPS}
              </DialogDescription>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={close}
            aria-label="Закрыть анкету"
          >
            <X aria-hidden="true" />
          </Button>
        </div>
        <div
          className="mt-4 grid grid-cols-7 gap-1.5"
          role="progressbar"
          aria-label={`Шаг ${step} из ${TOTAL_STEPS}`}
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
          aria-valuenow={step}
        >
          {Array.from({ length: TOTAL_STEPS }, (_, index) => (
            <span
              key={index}
              className={`h-1.5 rounded-full transition-colors duration-300 ${index < step ? "bg-primary" : "bg-white/85"}`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7 sm:py-7">
        {state.status === "error" && (
          <p
            className="bg-destructive/10 text-destructive mb-4 rounded-lg px-3 py-2 text-sm"
            role="alert"
          >
            {state.message}
          </p>
        )}

        <div hidden={step !== 1} className={step === 1 ? "motion-step-in" : undefined}>
          <fieldset
            className="space-y-3"
            aria-describedby={errors.visitFormat ? "visit-format-error" : undefined}
          >
            <legend className="font-heading text-primary mb-4 text-2xl leading-tight font-extrabold text-balance sm:text-3xl">
              Какой формат посещения вам удобен?
            </legend>
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
                  aria-describedby={errors.individualNote ? "individual-note-error" : undefined}
                  {...form.register("individualNote")}
                />
                <ErrorText id="individual-note-error" message={errors.individualNote?.message} />
              </div>
            )}
            <ErrorText id="visit-format-error" message={errors.visitFormat?.message} />
          </fieldset>
        </div>

        <div hidden={step !== 2} className={step === 2 ? "motion-step-in" : undefined}>
          <fieldset
            className="space-y-3"
            aria-describedby={errors.speech ? "speech-error" : undefined}
          >
            <legend className="font-heading text-primary mb-4 text-2xl leading-tight font-extrabold text-balance sm:text-3xl">
              Как развивается речь ребёнка?
            </legend>
            {SPEECH_OPTIONS.map((option) => (
              <RadioOption
                key={option.value}
                label={option.label}
                value={option.value}
                checked={speech === option.value}
                {...form.register("speech")}
              />
            ))}
            <ErrorText id="speech-error" message={errors.speech?.message} />
          </fieldset>
        </div>

        <div hidden={step !== 3} className={step === 3 ? "motion-step-in" : undefined}>
          <fieldset
            className="space-y-3"
            aria-describedby={errors.behavior ? "behavior-error" : undefined}
          >
            <legend className="font-heading text-primary mb-4 text-2xl leading-tight font-extrabold text-balance sm:text-3xl">
              Есть ли особенности поведения?
            </legend>
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
                  aria-describedby={errors.behaviorNote ? "behavior-note-error" : undefined}
                  {...form.register("behaviorNote")}
                />
                <ErrorText id="behavior-note-error" message={errors.behaviorNote?.message} />
              </div>
            )}
            <ErrorText id="behavior-error" message={errors.behavior?.message} />
          </fieldset>
        </div>

        <div hidden={step !== 4} className={step === 4 ? "motion-step-in" : undefined}>
          <fieldset
            className="space-y-3"
            aria-describedby={errors.toilet ? "toilet-error" : undefined}
          >
            <legend className="font-heading text-primary mb-4 text-2xl leading-tight font-extrabold text-balance sm:text-3xl">
              Как обстоят дела с туалетом?
            </legend>
            {TOILET_OPTIONS.map((option) => (
              <RadioOption
                key={option.value}
                label={option.label}
                value={option.value}
                checked={toilet === option.value}
                {...form.register("toilet")}
              />
            ))}
            <ErrorText id="toilet-error" message={errors.toilet?.message} />
          </fieldset>
        </div>

        <div hidden={step !== 5} className={step === 5 ? "motion-step-in" : undefined}>
          <fieldset className="space-y-3" aria-describedby={errors.food ? "food-error" : undefined}>
            <legend className="font-heading text-primary mb-4 text-2xl leading-tight font-extrabold text-balance sm:text-3xl">
              Какие навыки питания есть?
            </legend>
            <p className="text-muted-foreground -mt-2 mb-4 text-sm">
              Можно выбрать несколько вариантов.
            </p>
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
            <ErrorText id="food-error" message={errors.food?.message} />
          </fieldset>
        </div>

        <div hidden={step !== 6} className={step === 6 ? "motion-step-in" : undefined}>
          <fieldset
            className="space-y-3"
            aria-describedby={errors.previousExperience ? "experience-error" : undefined}
          >
            <legend className="font-heading text-primary mb-4 text-2xl leading-tight font-extrabold text-balance sm:text-3xl">
              Был ли опыт занятий?
            </legend>
            {EXPERIENCE_OPTIONS.map((option) => (
              <RadioOption
                key={option.value}
                label={option.label}
                value={option.value}
                checked={previousExperience === option.value}
                {...form.register("previousExperience")}
              />
            ))}
            <ErrorText id="experience-error" message={errors.previousExperience?.message} />
          </fieldset>
        </div>

        <div hidden={step !== 7} className={step === 7 ? "motion-step-in" : undefined}>
          <fieldset className="space-y-4">
            <legend className="font-heading text-primary mb-4 text-2xl leading-tight font-extrabold text-balance sm:text-3xl">
              Как с вами связаться?
            </legend>
            <div>
              <Label htmlFor="parentName">Ваше имя</Label>
              <Input
                id="parentName"
                className="mt-2"
                autoComplete="name"
                aria-invalid={Boolean(errors.parentName)}
                aria-describedby={errors.parentName ? "parent-name-error" : undefined}
                {...form.register("parentName")}
              />
              <ErrorText id="parent-name-error" message={errors.parentName?.message} />
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
                aria-describedby={errors.phone ? "phone-error" : undefined}
                {...phoneField}
                onChange={(event) => {
                  event.target.value = formatKgPhone(event.target.value);
                  void phoneField.onChange(event);
                }}
              />
              <ErrorText id="phone-error" message={errors.phone?.message} />
            </div>
            <Label className="border-border items-start gap-3 rounded-lg border p-3 text-sm leading-5 font-normal">
              <input
                type="checkbox"
                className="accent-primary mt-0.5 size-4"
                aria-invalid={Boolean(errors.consent)}
                aria-describedby={errors.consent ? "consent-error" : undefined}
                {...form.register("consent")}
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
            <ErrorText id="consent-error" message={errors.consent?.message} />
          </fieldset>
        </div>
      </div>

      <div className="border-border/65 sticky bottom-0 flex items-center justify-between gap-3 border-t bg-white/92 px-5 py-4 backdrop-blur-sm sm:px-7">
        {step > 1 ? (
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => setStep((current) => current - 1)}
            disabled={isPending}
          >
            <ChevronLeft aria-hidden="true" /> Назад
          </Button>
        ) : (
          <span />
        )}
        {step < TOTAL_STEPS ? (
          <Button type="button" className="min-w-32 rounded-full" onClick={nextStep}>
            Далее <ChevronRight aria-hidden="true" />
          </Button>
        ) : (
          <Button type="button" className="rounded-full" onClick={sendForm} disabled={isPending}>
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
      <DialogContent
        className="bg-background max-h-[calc(100dvh-1rem)] max-w-[calc(100%-1rem)] overflow-hidden rounded-[1.75rem] border border-white/85 p-0 shadow-[0_28px_80px_-28px_rgba(42,26,30,0.55)] sm:max-w-2xl"
        showCloseButton={false}
      >
        {isOpen && <AnketaForm />}
      </DialogContent>
    </Dialog>
  );
}

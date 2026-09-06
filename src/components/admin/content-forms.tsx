"use client";

import { useAdminFormAction } from "@/components/admin/use-admin-form-action";
import { saveNews, saveVacancy, type AdminContentState } from "@/app/actions/admin-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminFormField as Field } from "@/components/admin/form-field";
import { Textarea } from "@/components/ui/textarea";
import { CONTENT_STATUS_LABELS, formatAdminDateInput } from "@/lib/admin-labels";

const initialState: AdminContentState = {};

type NewsDraft = {
  id?: string;
  title?: string;
  slug?: string;
  shortText?: string;
  fullText?: string;
  image?: string | null;
  alt?: string | null;
  date?: string;
  status?: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export function NewsForm({ news = {} }: { news?: NewsDraft }) {
  const { state, action, pending, formRef } = useAdminFormAction(saveNews, initialState);
  return (
    <form
      action={action}
      ref={formRef}
      className="border-border bg-card grid gap-5 rounded-2xl border p-5 md:grid-cols-2"
    >
      {news.id ? <input type="hidden" name="id" value={news.id} /> : null}
      {state.message ? (
        <p
          className="bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-sm md:col-span-2"
          role="alert"
          tabIndex={-1}
        >
          {state.message}
        </p>
      ) : null}
      <Field label="Заголовок" name="title" error={state.fieldErrors?.title}>
        <Input id="title" name="title" defaultValue={news.title} required />
      </Field>
      <Field label="Slug" name="slug" error={state.fieldErrors?.slug}>
        <Input
          id="slug"
          name="slug"
          defaultValue={news.slug}
          placeholder="novaya-sensornaya-zona"
          required
        />
      </Field>
      <div className="md:col-span-2">
        <Field label="Краткое описание" name="shortText" error={state.fieldErrors?.shortText}>
          <Textarea
            id="shortText"
            name="shortText"
            defaultValue={news.shortText}
            maxLength={500}
            required
          />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="Полный текст" name="fullText" error={state.fieldErrors?.fullText}>
          <Textarea
            id="fullText"
            name="fullText"
            defaultValue={news.fullText}
            className="min-h-56"
            required
          />
        </Field>
      </div>
      <Field label="Ссылка на изображение" name="image" error={state.fieldErrors?.image}>
        <Input
          id="image"
          name="image"
          inputMode="url"
          placeholder="/images/… или https://…"
          defaultValue={news.image ?? ""}
        />
      </Field>
      <Field label="Alt-текст изображения" name="alt" error={state.fieldErrors?.alt}>
        <Input id="alt" name="alt" defaultValue={news.alt ?? ""} maxLength={200} />
      </Field>
      <Field label="Дата" name="date" error={state.fieldErrors?.date}>
        <Input
          id="date"
          name="date"
          type="date"
          defaultValue={news.date ?? formatAdminDateInput(new Date())}
          required
        />
      </Field>
      <Field label="Статус" name="status" error={state.fieldErrors?.status}>
        <select
          id="status"
          name="status"
          defaultValue={news.status ?? "DRAFT"}
          className="border-input bg-background h-11 w-full rounded-xl border px-3 text-sm"
        >
          {Object.entries(CONTENT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="SEO-заголовок" name="seoTitle" error={state.fieldErrors?.seoTitle}>
        <Input id="seoTitle" name="seoTitle" defaultValue={news.seoTitle ?? ""} maxLength={180} />
      </Field>
      <Field label="SEO-описание" name="seoDescription" error={state.fieldErrors?.seoDescription}>
        <Textarea
          id="seoDescription"
          name="seoDescription"
          defaultValue={news.seoDescription ?? ""}
          maxLength={320}
        />
      </Field>
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Сохраняем…" : "Сохранить новость"}
        </Button>
      </div>
    </form>
  );
}

type VacancyDraft = {
  id?: string;
  title?: string;
  slug?: string;
  preview?: string;
  duties?: string;
  requirements?: string;
  offer?: string;
  icon?: string | null;
  sortOrder?: number;
  status?: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export function VacancyForm({ vacancy = {} }: { vacancy?: VacancyDraft }) {
  const { state, action, pending, formRef } = useAdminFormAction(saveVacancy, initialState);
  return (
    <form
      action={action}
      ref={formRef}
      className="border-border bg-card grid gap-5 rounded-2xl border p-5 md:grid-cols-2"
    >
      {vacancy.id ? <input type="hidden" name="id" value={vacancy.id} /> : null}
      {state.message ? (
        <p
          className="bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-sm md:col-span-2"
          role="alert"
          tabIndex={-1}
        >
          {state.message}
        </p>
      ) : null}
      <Field label="Название" name="title" error={state.fieldErrors?.title}>
        <Input id="title" name="title" defaultValue={vacancy.title} required />
      </Field>
      <Field label="Slug" name="slug" error={state.fieldErrors?.slug}>
        <Input
          id="slug"
          name="slug"
          defaultValue={vacancy.slug}
          placeholder="logoped-defektolog"
          required
        />
      </Field>
      <div className="md:col-span-2">
        <Field label="Краткое описание" name="preview" error={state.fieldErrors?.preview}>
          <Textarea
            id="preview"
            name="preview"
            defaultValue={vacancy.preview}
            maxLength={100}
            required
          />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="Обязанности" name="duties" error={state.fieldErrors?.duties}>
          <Textarea id="duties" name="duties" defaultValue={vacancy.duties} required />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="Требования" name="requirements" error={state.fieldErrors?.requirements}>
          <Textarea
            id="requirements"
            name="requirements"
            defaultValue={vacancy.requirements}
            required
          />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="Условия" name="offer" error={state.fieldErrors?.offer}>
          <Textarea id="offer" name="offer" defaultValue={vacancy.offer} required />
        </Field>
      </div>
      <Field label="Иконка" name="icon" error={state.fieldErrors?.icon}>
        <Input
          id="icon"
          name="icon"
          defaultValue={vacancy.icon ?? ""}
          placeholder="Необязательно"
        />
      </Field>
      <Field label="Порядок" name="sortOrder" error={state.fieldErrors?.sortOrder}>
        <Input
          id="sortOrder"
          name="sortOrder"
          type="number"
          min={0}
          max={1000}
          defaultValue={vacancy.sortOrder ?? 0}
        />
      </Field>
      <Field label="Статус" name="status" error={state.fieldErrors?.status}>
        <select
          id="status"
          name="status"
          defaultValue={vacancy.status ?? "DRAFT"}
          className="border-input bg-background h-11 w-full rounded-xl border px-3 text-sm"
        >
          {Object.entries(CONTENT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <div />
      <Field label="SEO-заголовок" name="seoTitle" error={state.fieldErrors?.seoTitle}>
        <Input
          id="seoTitle"
          name="seoTitle"
          defaultValue={vacancy.seoTitle ?? ""}
          maxLength={180}
        />
      </Field>
      <Field label="SEO-описание" name="seoDescription" error={state.fieldErrors?.seoDescription}>
        <Textarea
          id="seoDescription"
          name="seoDescription"
          defaultValue={vacancy.seoDescription ?? ""}
          maxLength={320}
        />
      </Field>
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Сохраняем…" : "Сохранить вакансию"}
        </Button>
      </div>
    </form>
  );
}

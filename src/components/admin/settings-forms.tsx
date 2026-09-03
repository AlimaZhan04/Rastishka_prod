"use client";

import { useActionState } from "react";
import {
  saveAdminUser,
  saveSiteSettings,
  type AdminSettingsState,
} from "@/app/actions/admin-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ADMIN_ROLE_LABELS } from "@/lib/admin-labels";
import type { SiteSettings } from "@/lib/content/site";

const initialState: AdminSettingsState = {};
function Message({ state }: { state: AdminSettingsState }) {
  return state.message ? (
    <p
      className={
        state.success
          ? "bg-brand-mint-soft text-brand-teal rounded-xl px-4 py-3 text-sm"
          : "bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-sm"
      }
      role="status"
    >
      {state.message}
    </p>
  ) : null;
}
function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      {children}
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}

export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, action, pending] = useActionState(saveSiteSettings, initialState);
  const branch = settings.branches[0] ?? {
    title: "Главный филиал",
    address: "г. Бишкек",
    lat: 42.8303178,
    lng: 74.5723253,
  };
  const audienceByKey = Object.fromEntries(settings.audience.map((item) => [item.key, item]));
  const keys = ["ras", "zprr", "adhd", "down"];
  return (
    <form action={action} className="space-y-6">
      <Message state={state} />
      <section className="border-border bg-card grid gap-5 rounded-2xl border p-5 md:grid-cols-2">
        <h2 className="font-heading text-primary text-xl font-bold md:col-span-2">Главный экран</h2>
        <Field label="Заголовок" name="heroTitle">
          <Input id="heroTitle" name="heroTitle" defaultValue={settings.hero.title} required />
        </Field>
        <Field label="Подзаголовок" name="heroSubtitle">
          <Textarea
            id="heroSubtitle"
            name="heroSubtitle"
            defaultValue={settings.hero.subtitle}
            required
          />
        </Field>
        <Field label="Ссылка на изображение" name="heroImageUrl">
          <Input
            id="heroImageUrl"
            name="heroImageUrl"
            type="url"
            defaultValue={settings.hero.imageUrl ?? ""}
          />
        </Field>
        <Field label="Alt-текст" name="heroImageAlt">
          <Input
            id="heroImageAlt"
            name="heroImageAlt"
            defaultValue={settings.hero.imageAlt}
            required
          />
        </Field>
      </section>
      <section className="border-border bg-card grid gap-5 rounded-2xl border p-5 md:grid-cols-2">
        <h2 className="font-heading text-primary text-xl font-bold md:col-span-2">Для кого мы</h2>
        {keys.map((key) => (
          <div key={key} className="border-border space-y-3 rounded-xl border p-4">
            <Field
              label="Название"
              name={`audience.${key}.title`}
              error={state.fieldErrors?.[`audience.${keys.indexOf(key)}.title`]}
            >
              <Input
                id={`audience.${key}.title`}
                name={`audience.${key}.title`}
                defaultValue={audienceByKey[key]?.title ?? key.toUpperCase()}
                required
              />
            </Field>
            <Field
              label="Описание"
              name={`audience.${key}.description`}
              error={state.fieldErrors?.[`audience.${keys.indexOf(key)}.description`]}
            >
              <Textarea
                id={`audience.${key}.description`}
                name={`audience.${key}.description`}
                defaultValue={audienceByKey[key]?.description ?? ""}
                required
              />
            </Field>
          </div>
        ))}
      </section>
      <section className="border-border bg-card grid gap-5 rounded-2xl border p-5 md:grid-cols-2">
        <h2 className="font-heading text-primary text-xl font-bold md:col-span-2">
          Контакты и филиал
        </h2>
        <Field label="Телефон" name="phone">
          <Input id="phone" name="phone" defaultValue={settings.phone} required />
        </Field>
        <Field label="Instagram" name="instagram">
          <Input
            id="instagram"
            name="instagram"
            type="url"
            defaultValue={settings.socials.instagram ?? ""}
          />
        </Field>
        <Field label="Facebook" name="facebook">
          <Input
            id="facebook"
            name="facebook"
            type="url"
            defaultValue={settings.socials.facebook ?? ""}
          />
        </Field>
        <Field label="Threads" name="threads">
          <Input
            id="threads"
            name="threads"
            type="url"
            defaultValue={settings.socials.threads ?? ""}
          />
        </Field>
        <Field label="Название филиала" name="branchTitle">
          <Input id="branchTitle" name="branchTitle" defaultValue={branch.title} required />
        </Field>
        <Field label="Адрес" name="branchAddress">
          <Input id="branchAddress" name="branchAddress" defaultValue={branch.address} required />
        </Field>
        <Field label="Широта" name="branchLat">
          <Input
            id="branchLat"
            name="branchLat"
            type="number"
            step="any"
            defaultValue={branch.lat}
            required
          />
        </Field>
        <Field label="Долгота" name="branchLng">
          <Input
            id="branchLng"
            name="branchLng"
            type="number"
            step="any"
            defaultValue={branch.lng}
            required
          />
        </Field>
      </section>
      <Button type="submit" disabled={pending}>
        {pending ? "Сохраняем…" : "Сохранить настройки"}
      </Button>
    </form>
  );
}

export type AdminUserDraft = {
  id?: string;
  name?: string;
  login?: string;
  email?: string | null;
  role?: "ADMIN" | "CONTENT_MANAGER";
  active?: boolean;
  canViewApplications?: boolean;
  canViewResponses?: boolean;
};
export function AdminUserForm({ user = {} }: { user?: AdminUserDraft }) {
  const [state, action, pending] = useActionState(saveAdminUser, initialState);
  return (
    <form
      action={action}
      className="border-border bg-card grid gap-4 rounded-2xl border p-5 md:grid-cols-2"
    >
      {user.id ? <input type="hidden" name="id" value={user.id} /> : null}
      <div className="md:col-span-2">
        <Message state={state} />
      </div>
      <Field label="Имя" name={`name-${user.id ?? "new"}`} error={state.fieldErrors?.name}>
        <Input
          id={`name-${user.id ?? "new"}`}
          name="name"
          defaultValue={user.name ?? ""}
          required
        />
      </Field>
      <Field label="Логин" name={`login-${user.id ?? "new"}`} error={state.fieldErrors?.login}>
        <Input
          id={`login-${user.id ?? "new"}`}
          name="login"
          defaultValue={user.login ?? ""}
          required
        />
      </Field>
      <Field label="E-mail" name={`email-${user.id ?? "new"}`} error={state.fieldErrors?.email}>
        <Input
          id={`email-${user.id ?? "new"}`}
          name="email"
          type="email"
          defaultValue={user.email ?? ""}
        />
      </Field>
      <Field
        label={user.id ? "Новый пароль (необязательно)" : "Пароль"}
        name={`password-${user.id ?? "new"}`}
        error={state.fieldErrors?.password}
      >
        <Input
          id={`password-${user.id ?? "new"}`}
          name="password"
          type="password"
          autoComplete="new-password"
          required={!user.id}
        />
      </Field>
      <Field label="Роль" name={`role-${user.id ?? "new"}`}>
        <select
          id={`role-${user.id ?? "new"}`}
          name="role"
          defaultValue={user.role ?? "CONTENT_MANAGER"}
          className="border-input bg-background h-11 w-full rounded-xl border px-3 text-sm"
        >
          {Object.entries(ADMIN_ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <div className="space-y-3 pt-1">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={user.active ?? true} /> Активен
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="canViewApplications"
            defaultChecked={user.canViewApplications}
          />{" "}
          Видит заявки
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="canViewResponses" defaultChecked={user.canViewResponses} />{" "}
          Видит отклики
        </label>
      </div>
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Сохраняем…" : user.id ? "Обновить пользователя" : "Создать пользователя"}
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useAdminFormAction } from "@/components/admin/use-admin-form-action";
import {
  updateApplicationWorkflow,
  updateResponseWorkflow,
  type AdminWorkflowState,
} from "@/app/actions/admin-workflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { APPLICATION_STATUS_LABELS, RESPONSE_STATUS_LABELS } from "@/lib/admin-labels";

export function WorkflowForm({
  kind,
  record,
  admins,
}: {
  kind: "application" | "response";
  record: { id: string; status: string; adminComment: string | null; responsibleId: string | null };
  admins: { id: string; name: string }[];
}) {
  const { state, action, pending, formRef } = useAdminFormAction<AdminWorkflowState>(
    kind === "application" ? updateApplicationWorkflow : updateResponseWorkflow,
    {},
  );
  const labels = kind === "application" ? APPLICATION_STATUS_LABELS : RESPONSE_STATUS_LABELS;
  const unavailable =
    record.responsibleId && !admins.some((admin) => admin.id === record.responsibleId);

  return (
    <form
      action={action}
      ref={formRef}
      className="border-border bg-card h-fit space-y-5 rounded-2xl border p-5"
    >
      <Input type="hidden" name="id" value={record.id} />
      <h2 className="font-heading text-primary text-xl font-bold">
        {kind === "application" ? "Работа с заявкой" : "Работа с откликом"}
      </h2>
      {state.message ? (
        <p
          role={state.success ? "status" : "alert"}
          tabIndex={-1}
          className={
            state.success
              ? "bg-brand-mint-soft text-brand-teal rounded-xl p-3 text-sm"
              : "bg-destructive/10 text-destructive rounded-xl p-3 text-sm"
          }
        >
          {state.message}
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor={`${kind}-status`}>Статус</Label>
        <select
          id={`${kind}-status`}
          name="status"
          defaultValue={record.status}
          aria-invalid={Boolean(state.fieldErrors?.status)}
          className="border-input bg-background h-11 w-full rounded-xl border px-3 text-sm"
        >
          {Object.entries(labels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${kind}-responsible`}>Ответственный</Label>
        <select
          id={`${kind}-responsible`}
          name="responsibleId"
          defaultValue={record.responsibleId ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.responsibleId)}
          aria-describedby={
            state.fieldErrors?.responsibleId ? `${kind}-responsible-error` : undefined
          }
          className="border-input bg-background h-11 w-full rounded-xl border px-3 text-sm"
        >
          <option value="">Не назначен</option>
          {unavailable ? (
            <option value={record.responsibleId!}>
              Предыдущий сотрудник недоступен — выберите другого
            </option>
          ) : null}
          {admins.map((admin) => (
            <option key={admin.id} value={admin.id}>
              {admin.name}
            </option>
          ))}
        </select>
        {state.fieldErrors?.responsibleId ? (
          <p id={`${kind}-responsible-error`} className="text-destructive text-sm">
            {state.fieldErrors.responsibleId}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${kind}-comment`}>Внутренний комментарий</Label>
        <Textarea
          id={`${kind}-comment`}
          name="adminComment"
          defaultValue={record.adminComment ?? ""}
          maxLength={5000}
          aria-invalid={Boolean(state.fieldErrors?.adminComment)}
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Сохраняем…" : "Сохранить"}
      </Button>
    </form>
  );
}

"use client";

import { useAdminFormAction } from "@/components/admin/use-admin-form-action";
import { loginAdmin, type AdminLoginState } from "@/app/actions/admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AdminLoginState = {};

export function AdminLoginForm() {
  const { state, action, pending, formRef } = useAdminFormAction(loginAdmin, initialState);

  return (
    <form action={action} ref={formRef} className="space-y-5">
      {state.message ? (
        <p
          className="bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-sm"
          role="alert"
          tabIndex={-1}
        >
          {state.message}
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="admin-login">Логин</Label>
        <Input id="admin-login" name="login" autoComplete="username" required autoFocus />
      </div>
      <div className="space-y-2">
        <Label htmlFor="admin-password">Пароль</Label>
        <Input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Входим…" : "Войти"}
      </Button>
    </form>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { AdminLoginForm } from "@/components/admin/login-form";
import { getCurrentAdmin } from "@/lib/server/admin-auth";

export const metadata: Metadata = { title: "Вход в админ-панель" };

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="shadow-soft border-border bg-card w-full max-w-md rounded-3xl border p-7 md:p-9">
        <Logo />
        <h1 className="font-heading text-primary mt-7 text-3xl font-extrabold">Админ-панель</h1>
        <p className="text-muted-foreground mt-2 mb-7">Войдите с рабочим логином и паролем.</p>
        <AdminLoginForm />
      </section>
    </main>
  );
}

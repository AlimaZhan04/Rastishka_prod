"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";

export type AdminLoginState = { message?: string };

export async function loginAdmin(
  _previousState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  try {
    await signIn("credentials", {
      login: formData.get("login"),
      password: formData.get("password"),
      redirectTo: "/admin",
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: "Неверный логин или пароль" };
    }
    throw error;
  }
  // Keep the navigation on the request's origin, even if a previous deployment's
  // AUTH_URL/NEXTAUTH_URL is still configured in the authentication environment.
  redirect("/admin");
}

export async function logoutAdmin(): Promise<never> {
  await signOut({ redirect: false });
  redirect("/admin/login");
}

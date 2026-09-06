import { loginAdmin, logoutAdmin } from "./admin-auth";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

jest.mock("@/auth", () => ({ signIn: jest.fn(), signOut: jest.fn() }));
jest.mock("next-auth", () => ({ AuthError: class AuthError extends Error {} }));
jest.mock("next/navigation", () => ({ redirect: jest.fn() }));

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(redirect).mockImplementation((path) => {
    throw new Error(`redirect:${path}`);
  });
});

it("keeps successful sign-in on the current domain when Auth.js returns a stale deployment URL", async () => {
  jest.mocked(signIn).mockResolvedValue("https://old-app.up.railway.app/admin" as never);
  const form = new FormData();
  form.set("login", "admin2");
  form.set("password", "example-password");
  await expect(loginAdmin({}, form)).rejects.toThrow("redirect:/admin");
  expect(signIn).toHaveBeenCalledWith("credentials", {
    login: "admin2",
    password: "example-password",
    redirectTo: "/admin",
    redirect: false,
  });
  expect(redirect).toHaveBeenCalledWith("/admin");
});

it("shows invalid credentials without navigating", async () => {
  jest.mocked(signIn).mockRejectedValue(new AuthError());
  expect(await loginAdmin({}, new FormData())).toEqual({ message: "Неверный логин или пароль" });
  expect(redirect).not.toHaveBeenCalled();
});

it("does not disguise infrastructure errors as successful sign-in", async () => {
  jest.mocked(signIn).mockRejectedValue(new Error("database unavailable"));
  await expect(loginAdmin({}, new FormData())).rejects.toThrow("database unavailable");
  expect(redirect).not.toHaveBeenCalled();
});

it("clears the session before a same-origin sign-out redirect", async () => {
  await expect(logoutAdmin()).rejects.toThrow("redirect:/admin/login");
  expect(signOut).toHaveBeenCalledWith({ redirect: false });
});

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verify } from "@node-rs/argon2";
import { z } from "zod";
import { prisma } from "@/lib/db";

const credentialsSchema = z.object({
  login: z.string().trim().min(1).max(120),
  password: z.string().min(1).max(256),
});

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_ATTEMPT_LIMIT = 8;
const loginAttempts = new Map<string, number[]>();

function allowLoginAttempt(login: string): boolean {
  const now = Date.now();
  const key = login.trim().toLocaleLowerCase("ru");
  const recent = (loginAttempts.get(key) ?? []).filter(
    (timestamp) => now - timestamp < LOGIN_WINDOW_MS,
  );
  if (recent.length >= LOGIN_ATTEMPT_LIMIT) {
    loginAttempts.set(key, recent);
    return false;
  }
  recent.push(now);
  loginAttempts.set(key, recent);
  return true;
}

function clearLoginAttempts(login: string): void {
  loginAttempts.delete(login.trim().toLocaleLowerCase("ru"));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  providers: [
    Credentials({
      credentials: {
        login: { label: "Логин", type: "text" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success || !allowLoginAttempt(String(credentials?.login ?? ""))) return null;

        const admin = await prisma.adminUser.findUnique({
          where: { login: parsed.data.login },
          select: {
            id: true,
            name: true,
            email: true,
            passwordHash: true,
            role: true,
            active: true,
            canViewApplications: true,
            canViewResponses: true,
          },
        });
        if (!admin?.active || !(await verify(admin.passwordHash, parsed.data.password)))
          return null;

        clearLoginAttempts(parsed.data.login);
        await prisma.adminUser.update({
          where: { id: admin.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          canViewApplications: admin.canViewApplications,
          canViewResponses: admin.canViewResponses,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.canViewApplications = user.canViewApplications;
        token.canViewResponses = user.canViewResponses;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role ?? "CONTENT_MANAGER";
        session.user.canViewApplications = token.canViewApplications ?? false;
        session.user.canViewResponses = token.canViewResponses ?? false;
      }
      return session;
    },
    authorized({ auth: session, request }) {
      const path = request.nextUrl.pathname;
      if (path === "/admin/login") return true;
      if (path.startsWith("/admin")) return Boolean(session?.user?.id);
      return true;
    },
  },
});

import type { DefaultSession } from "next-auth";
import "next-auth/jwt";
import type { AdminRole } from "@/generated/prisma/enums";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: AdminRole;
      canViewApplications: boolean;
      canViewResponses: boolean;
    };
  }

  interface User {
    role: AdminRole;
    canViewApplications: boolean;
    canViewResponses: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: AdminRole;
    canViewApplications?: boolean;
    canViewResponses?: boolean;
  }
}

export {};

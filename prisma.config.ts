import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Миграции/CLI используют прямое подключение (в проде Supabase — не через PgBouncer).
    // Локально DIRECT_URL == DATABASE_URL.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
    // Shadow DB для `migrate dev` (локально — отдельный порт Prisma Dev; в проде — Supabase создаёт сам).
    shadowDatabaseUrl: process.env["SHADOW_DATABASE_URL"],
  },
});

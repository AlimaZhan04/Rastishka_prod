import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Миграции/CLI используют прямое подключение к PostgreSQL, без transaction pooler.
    // Локально DIRECT_URL == DATABASE_URL.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
    // Shadow DB нужна только для локального migrate dev; migrate deploy её не использует.
    shadowDatabaseUrl: process.env["SHADOW_DATABASE_URL"],
  },
});

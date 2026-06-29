# РАСтишка — сайт коррекционного детского сада

Сайт детского сада для особенных детей: главная, 7-шаговая анкета записи, новости, вакансии,
закрытая админ-панель и уведомления администратору.

## Стек

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (Base UI)
- **Prisma 7** (driver adapter `@prisma/adapter-pg`) + **PostgreSQL**
- **Auth.js / NextAuth** (Credentials, роли в БД)
- Хранилище файлов — **Supabase Storage**; уведомления — **Telegram** (+ e-mail/WhatsApp)
- Хостинг — **Vercel**; БД в проде — **Supabase**

## Локальная разработка

```bash
pnpm install

# 1. Поднять локальную БД (Prisma local Postgres), фоном:
pnpm exec prisma dev --detach --name rastishka

# 2. Узнать строку подключения (порт назначается динамически!):
pnpm exec prisma dev ls
#   Возьмите TCP-URL вида postgres://postgres:postgres@localhost:PORT/template1
#   и пропишите PORT в DATABASE_URL / DIRECT_URL в .env (shadow — PORT+1).

# 3. Применить схему и наполнить демоданными:
pnpm exec prisma db push
pnpm db:seed

# 4. Запустить dev-сервер:
pnpm dev   # http://localhost:3000
```

> ⚠️ **Порт Prisma Dev динамический.** При перезапуске сервера `prisma dev` порт меняется —
> проверяйте `pnpm exec prisma dev ls` и обновляйте `.env`. Команды: `prisma dev stop`,
> `prisma dev start`, `prisma dev rm`.

Env-переменные — см. [.env.example](.env.example).

## Полезные команды

| Команда | Назначение |
|---|---|
| `pnpm dev` | dev-сервер (Turbopack) |
| `pnpm build` | production-сборка |
| `pnpm typecheck` | проверка типов (`tsc --noEmit`) |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |
| `pnpm db:push` | синхронизировать схему с БД (локально) |
| `pnpm db:migrate` | создать миграцию (на полноценном Postgres/Supabase) |
| `pnpm db:deploy` | применить миграции (prod) |
| `pnpm db:seed` | наполнить БД начальными данными |
| `pnpm db:studio` | Prisma Studio |

## Миграции и прод

Локально схема накатывается через `prisma db push` (встроенная БД Prisma Dev не поддерживает
shadow-БД для `migrate dev`). Файлы миграций для production генерируются на полноценном Postgres
(Supabase staging) командой `pnpm db:migrate`, затем применяются в проде через `pnpm db:deploy`.

Документация по проекту: [docs/Rastishka_Final_TZ_v1.1.docx](docs/Rastishka_Final_TZ_v1.1.docx),
макеты — [docs/design](docs/design).

# РАСтишка — сайт коррекционного детского сада

Сайт детского сада для особенных детей: главная, 7-шаговая анкета записи, новости, вакансии,
закрытая админ-панель и уведомления администратору.

## Стек

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (Base UI)
- **Prisma 7** (driver adapter `@prisma/adapter-pg`) + **PostgreSQL**
- **Auth.js / NextAuth** (Credentials, роли в БД)
- Резюме — **PostgreSQL bytea**, транзакционно вместе с откликом; уведомления — **Telegram**
- Хостинг приложения и production PostgreSQL — **Railway**; Supabase не требуется

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
| `pnpm test --runInBand` | unit- и компонентные регрессионные тесты |
| `pnpm format` | Prettier |
| `pnpm db:push` | синхронизировать схему с БД (локально) |
| `pnpm db:migrate` | создать миграцию (на изолированном PostgreSQL) |
| `pnpm db:deploy` | применить миграции (prod) |
| `pnpm db:seed` | наполнить БД начальными данными |
| `pnpm db:studio` | Prisma Studio |

### Проверка хранения резюме на PostgreSQL

Для интеграционных тестов нужен запущенный локальный PostgreSQL и Node.js 24.9+.
`DATABASE_URL` (или `POSTGRES_TEST_URL`) должен указывать на localhost: тесты создают
отдельную временную схему, применяют миграции и удаляют только эту схему после проверки.
Для Prisma Dev используйте отдельный экземпляр `pnpm exec prisma dev --detach --name rastishka-tests`
и передайте выданный TCP-адрес в `POSTGRES_TEST_URL`: одновременная работа браузерного стенда
с тем же встроенным сервером может вызывать ошибки протокола подготовленных запросов.
Prisma 7 загружает ESM-компилятор, поэтому для этого набора нужен флаг VM Modules:

```powershell
$env:RUN_POSTGRES_INTEGRATION='1'
node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand src/lib/server/vacancy-response-postgres.test.ts
Remove-Item Env:RUN_POSTGRES_INTEGRATION
```

Без opt-in эти девять тестов пропускаются обычным `pnpm test`.

## Миграции и прод

Локально схема накатывается через `prisma db push` (встроенная БД Prisma Dev не поддерживает
shadow-БД для `migrate dev`). Файлы миграций для production генерируются на полноценном Postgres
(изолированная dev-база) командой `pnpm db:migrate`, затем применяются в проде через `pnpm db:deploy`.

На Railway: build — `pnpm build`, start — `pnpm start`, pre-deploy —
`pnpm db:deploy && pnpm db:seed`, healthcheck — `/api/health`.
Резюме до 10 МБ сохраняются в отдельной таблице `ResumeFile`; доступ к
`/api/admin/resumes/[id]` проверяет активную сессию и права на отклики при каждом запросе.
Переход и проверка хранения: [docs/POSTGRES_STORAGE.md](docs/POSTGRES_STORAGE.md).

Документация по проекту: [docs/Rastishka_Final_TZ_v1.1.docx](docs/Rastishka_Final_TZ_v1.1.docx),
макеты — [docs/design](docs/design).

## Управление разработкой

- Границы MVP: [docs/MVP_SCOPE.md](docs/MVP_SCOPE.md).
- Трекер 68 требований: [docs/MVP_REQUIREMENTS_TRACKER.md](docs/MVP_REQUIREMENTS_TRACKER.md).
- Открытые продуктовые и юридические решения: [docs/DECISIONS_AND_OPEN_QUESTIONS.md](docs/DECISIONS_AND_OPEN_QUESTIONS.md).
- Минимальный процесс веток, PR и проверок: [docs/DEVELOPMENT_WORKFLOW.md](docs/DEVELOPMENT_WORKFLOW.md).
- Подготовка staging: [docs/STAGING_SETUP.md](docs/STAGING_SETUP.md).

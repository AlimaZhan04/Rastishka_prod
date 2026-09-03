# РАСтишка — подготовка staging

Этот репозиторий не содержит секретов и не создаёт облачные проекты автоматически. Аккаунты Supabase, Vercel, Telegram и Resend должны принадлежать организации; их создание и выдача прав требуют доступа владельца продукта.

## 1. Создать изолированные ресурсы

Создайте отдельные от production ресурсы:

- проект Supabase `rastishka-staging` с PostgreSQL и включённым резервным копированием;
- проект Vercel или staging-окружение этого проекта;
- приватный bucket `resumes` для резюме и отдельный публичный bucket для изображений, когда будет реализована загрузка;
- отдельный тестовый Telegram-чат и бот; не используйте личный чат сотрудника.

### Параметры bucket `resumes`

Создайте bucket с точным именем `resumes` и оставьте его **приватным**. Настройте допустимые MIME-типы: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `image/jpeg`, `image/png`; максимальный размер — 10 МБ.

Не создавайте публичную policy на чтение и не используйте public URL для резюме. Приложение загружает файл только с сервера по service-role ключу и сохраняет в БД лишь путь объекта. Выдача временной ссылки для сотрудника будет добавлена вместе с защищённой админ-панелью на этапе 4.

## 2. Внести секреты в staging environment

Ниже перечислены имена переменных. Значения задаются в настройках Vercel/Supabase или в локальном `.env`, но никогда не коммитятся.

| Группа | Обязательные переменные | Примечание |
| --- | --- | --- |
| БД | `DATABASE_URL`, `DIRECT_URL` | Runtime использует pooled URL; применение миграций — прямой URL. `SHADOW_DATABASE_URL` нужен только в локальном или изолированном dev-контуре для создания новых миграций. |
| Сайт | `NEXT_PUBLIC_SITE_URL`, `ADMIN_BASE_URL` | Указать staging-домен, например `https://staging.ras-tishka.kg`. |
| Auth | `NEXTAUTH_SECRET`, `NEXTAUTH_URL` | Секрет генерируется отдельно для staging и production. |
| Seed | `SEED_ADMIN_LOGIN`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_NAME` | Пароль минимум 16 символов; передавать только через secrets manager. |
| Storage | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Service role используется только сервером. |
| Уведомления | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`; опционально `RESEND_API_KEY`, `NOTIFY_EMAIL_FROM` | До подключения канала переменные можно оставить пустыми. |

`NEXT_PUBLIC_*` переменные встраиваются в клиентский bundle при сборке. Никогда не добавляйте к ним токены, ключи и строки подключения.

## 3. Применить baseline и наполнить staging

```powershell
pnpm install --frozen-lockfile
pnpm db:deploy
pnpm db:seed
pnpm typecheck
pnpm lint
pnpm test --runInBand
pnpm build
```

Baseline `20260830170000_init` создаёт схему на пустой staging-БД. Нельзя применять `prisma migrate reset` к staging или production: это удалит данные.

Seed прекращает работу без заданного сильного пароля администратора. Контент-менеджер создаётся только при явной конфигурации его логина и пароля.

## 4. Проверка готовности

- `pnpm exec prisma migrate status` показывает применённые `20260830170000_init` и `20260902193000_add_vacancy_response_consent`.
- `pnpm db:seed` создаёт только учётные записи, заданные в secrets manager, и тестовый контент только вне production.
- Сборка проходит с теми же public-переменными, которые будут использованы на staging.
- Логи Vercel содержат структурированные события без паролей, токенов, телефонов, имён и данных ребёнка.

## Передача в production

Production получает собственные Supabase/Vercel/Telegram secrets и проверенный backup/restore. Перенос значений из staging, личных аккаунтов или локального `.env` запрещён.

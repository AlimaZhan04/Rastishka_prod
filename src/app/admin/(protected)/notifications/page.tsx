import {
  retryNotification,
  saveNotificationSettings,
  testTelegramNotification,
} from "@/app/actions/admin-settings";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAdminDate } from "@/lib/admin-labels";
import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/server/admin-auth";

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    tested?: string;
    testError?: string;
    retried?: string;
    retryError?: string;
  }>;
}) {
  await requireAdminPage("notifications");
  const query = await searchParams;
  const [config, logs] = await Promise.all([
    prisma.notificationConfig.findUnique({ where: { id: "singleton" } }),
    prisma.notificationLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        eventType: true,
        channel: true,
        status: true,
        error: true,
        retryCount: true,
        createdAt: true,
      },
    }),
  ]);
  const tokenConfigured = Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim());
  const envChatConfigured = Boolean(process.env.TELEGRAM_CHAT_ID?.trim());
  return (
    <>
      <AdminPageHeader
        title="Уведомления"
        description="Настройка Telegram, проверка подключения и журнал доставки."
      />
      {query.saved ? (
        <p className="bg-brand-mint-soft text-brand-teal mb-5 rounded-xl px-4 py-3 text-sm">
          Настройки сохранены.
        </p>
      ) : null}
      {query.tested ? (
        <p className="bg-brand-mint-soft text-brand-teal mb-5 rounded-xl px-4 py-3 text-sm">
          Тестовое сообщение отправлено.
        </p>
      ) : null}
      {query.testError ? (
        <p className="bg-destructive/10 text-destructive mb-5 rounded-xl px-4 py-3 text-sm">
          Telegram не принял тестовое сообщение. Проверьте токен и Chat ID.
        </p>
      ) : null}
      {query.retried ? (
        <p className="bg-brand-mint-soft text-brand-teal mb-5 rounded-xl px-4 py-3 text-sm">
          Уведомление отправлено повторно.
        </p>
      ) : null}
      {query.retryError ? (
        <p className="bg-destructive/10 text-destructive mb-5 rounded-xl px-4 py-3 text-sm">
          Повторная отправка не удалась. Проверьте, что Telegram включён и настроен.
        </p>
      ) : null}
      <div className="grid gap-5 xl:grid-cols-2">
        <form
          action={saveNotificationSettings}
          className="border-border bg-card space-y-5 rounded-2xl border p-5"
        >
          <h2 className="font-heading text-primary text-xl font-bold">Telegram</h2>
          <p className="text-muted-foreground text-sm">
            Токен бота: {tokenConfigured ? "настроен" : "не настроен"}. Резервный chat ID из
            окружения: {envChatConfigured ? "настроен" : "не настроен"}.
          </p>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="telegramEnabled"
              defaultChecked={config?.telegramEnabled ?? true}
            />{" "}
            Канал включён
          </label>
          <div className="space-y-2">
            <Label htmlFor="telegramChatId">Chat ID</Label>
            <Input
              id="telegramChatId"
              name="telegramChatId"
              defaultValue={config?.telegramChatId ?? ""}
              placeholder="Если пусто, используется TELEGRAM_CHAT_ID"
            />
          </div>
          <Button type="submit">Сохранить Telegram</Button>
        </form>
        <form
          action={testTelegramNotification}
          className="border-border bg-card flex flex-col justify-between gap-5 rounded-2xl border p-5"
        >
          <div>
            <h2 className="font-heading text-primary text-xl font-bold">Проверка канала</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Отправляет безопасное системное сообщение без персональных данных.
            </p>
          </div>
          <Button
            type="submit"
            variant="outline"
            disabled={!tokenConfigured || !(config?.telegramChatId || envChatConfigured)}
          >
            Отправить тест
          </Button>
        </form>
      </div>
      <section className="mt-6">
        <h2 className="font-heading text-primary mb-4 text-xl font-bold">Последние доставки</h2>
        <div className="border-border bg-card overflow-hidden rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Событие</TableHead>
                <TableHead>Канал</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Повторы</TableHead>
                <TableHead>Действие</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{formatAdminDate(log.createdAt)}</TableCell>
                  <TableCell>
                    {log.eventType === "NEW_APPLICATION"
                      ? "Новая заявка"
                      : log.eventType === "NEW_RESPONSE"
                        ? "Новый отклик"
                        : "Ошибка"}
                  </TableCell>
                  <TableCell>{log.channel}</TableCell>
                  <TableCell>
                    <StatusBadge status={log.status} />
                  </TableCell>
                  <TableCell>{log.retryCount}</TableCell>
                  <TableCell>
                    {log.status === "FAILED" &&
                    log.channel === "TELEGRAM" &&
                    (log.eventType === "NEW_APPLICATION" || log.eventType === "NEW_RESPONSE") ? (
                      <form action={retryNotification}>
                        <input type="hidden" name="id" value={log.id} />
                        <Button type="submit" size="sm" variant="ghost">
                          Повторить
                        </Button>
                      </form>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!logs.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                    Записей пока нет.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </section>
    </>
  );
}

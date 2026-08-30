import "server-only";

import { prisma } from "@/lib/db";
import { buildNewApplicationTelegramMessage } from "@/lib/telegram-message";

const TELEGRAM_API_BASE = "https://api.telegram.org";
const TELEGRAM_TIMEOUT_MS = 10_000;

class TelegramDeliveryError extends Error {
  constructor() {
    super("Telegram delivery failed");
    this.name = "TelegramDeliveryError";
  }
}

type TelegramConfig = {
  token: string;
  chatId: string;
};

function readTelegramEnvironment(): TelegramConfig | null {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  return token && chatId ? { token, chatId } : null;
}

function isTelegramSuccess(response: unknown): boolean {
  return (
    typeof response === "object" &&
    response !== null &&
    "ok" in response &&
    (response as { ok?: unknown }).ok === true
  );
}

async function sendTelegramMessage(config: TelegramConfig, text: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${TELEGRAM_API_BASE}/bot${config.token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: config.chatId, text }),
      cache: "no-store",
      signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
    });
  } catch {
    throw new TelegramDeliveryError();
  }

  if (!response.ok) throw new TelegramDeliveryError();

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new TelegramDeliveryError();
  }
  if (!isTelegramSuccess(payload)) throw new TelegramDeliveryError();
}

async function telegramIsEnabled(): Promise<boolean> {
  const config = await prisma.notificationConfig.findUnique({
    where: { id: "singleton" },
    select: { telegramEnabled: true },
  });
  return config?.telegramEnabled ?? true;
}

/**
 * Sends a minimal delivery signal for a new application and writes the delivery outcome.
 * It intentionally throws on failure so the caller can log it without exposing it to the user.
 */
export async function notifyNewApplicationInTelegram(applicationId: string): Promise<boolean> {
  const config = readTelegramEnvironment();
  if (!config || !(await telegramIsEnabled())) return false;

  const notification = await prisma.notificationLog.create({
    data: {
      eventType: "NEW_APPLICATION",
      channel: "TELEGRAM",
      recipient: config.chatId,
      applicationId,
      payload: { kind: "new_application_reference", version: 1 },
    },
    select: { id: true },
  });

  try {
    await sendTelegramMessage(config, buildNewApplicationTelegramMessage(applicationId));
    await prisma.notificationLog.update({
      where: { id: notification.id },
      data: { status: "SENT" },
    });
    return true;
  } catch (error) {
    await prisma.notificationLog
      .update({
        where: { id: notification.id },
        data: { status: "FAILED", error: "Telegram delivery failed", retryCount: { increment: 1 } },
      })
      .catch(() => undefined);
    throw error;
  }
}

/** A manually triggered connectivity check. It does not create a database record or contain PII. */
export async function sendTelegramConnectivityTest(): Promise<void> {
  const config = readTelegramEnvironment();
  if (!config) throw new TelegramDeliveryError();
  await sendTelegramMessage(
    config,
    "✅ РАСтишка: Telegram-уведомления подключены. Это тестовое системное сообщение.",
  );
}

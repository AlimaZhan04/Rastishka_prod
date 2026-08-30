/**
 * Telegram is only a delivery signal. Sensitive questionnaire answers stay in the database
 * and are intentionally never copied into a third-party messenger.
 */
export function buildNewApplicationTelegramMessage(applicationId: string): string {
  return [
    "Новая заявка с сайта «РАСтишка».",
    `Номер заявки: ${applicationId}`,
    "Детали анкеты хранятся в защищённой базе сайта и не пересылаются в Telegram.",
  ].join("\n");
}

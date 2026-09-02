/**
 * Telegram is only a delivery signal. Sensitive questionnaire answers stay in the database
 * and are intentionally never copied into a third-party messenger.
 */
export function buildNewApplicationTelegramMessage(applicationId: string): string {
  return [
    "📩 Новая заявка с сайта «РАСтишка»",
    `🆔 Номер заявки: ${applicationId}`,
    "🔒 Детали анкеты хранятся в защищённой базе сайта и не передаются в Telegram.",
  ].join("\n");
}

/** A vacancy response has the same privacy boundary: Telegram receives only an identifier. */
export function buildNewVacancyResponseTelegramMessage(vacancyResponseId: string): string {
  return [
    "💼 РАСтишка — новый отклик на вакансию»",
    `🆔 Номер отклика: ${vacancyResponseId}`,
    "🔐 В целях конфиденциальности данные отклика доступны только в защищённой базе сайта и не отправляются в Telegram.",
  ].join("\n");
}

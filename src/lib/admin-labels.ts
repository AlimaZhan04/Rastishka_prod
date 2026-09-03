export const APPLICATION_STATUS_LABELS = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  CONTACTED: "Связались",
  ENROLLED: "Зачислен",
  REJECTED: "Отклонена",
  ARCHIVED: "Архив",
} as const;

export const RESPONSE_STATUS_LABELS = {
  NEW: "Новый",
  IN_REVIEW: "На рассмотрении",
  INVITED: "Приглашён",
  REJECTED: "Отклонён",
  ARCHIVED: "Архив",
} as const;

export const CONTENT_STATUS_LABELS = {
  DRAFT: "Черновик",
  PUBLISHED: "Опубликовано",
  HIDDEN: "Скрыто",
  ARCHIVED: "Архив",
} as const;

export const ADMIN_ROLE_LABELS = {
  ADMIN: "Администратор",
  CONTENT_MANAGER: "Контент-менеджер",
} as const;

export function formatAdminDate(value: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bishkek",
  }).format(value);
}

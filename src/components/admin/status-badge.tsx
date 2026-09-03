import { Badge } from "@/components/ui/badge";
import {
  APPLICATION_STATUS_LABELS,
  CONTENT_STATUS_LABELS,
  RESPONSE_STATUS_LABELS,
} from "@/lib/admin-labels";

const labels: Record<string, string> = {
  ...APPLICATION_STATUS_LABELS,
  ...RESPONSE_STATUS_LABELS,
  ...CONTENT_STATUS_LABELS,
  SENT: "Отправлено",
  FAILED: "Ошибка",
  PENDING: "Ожидает",
};

export function StatusBadge({ status }: { status: string }) {
  const variant = status === "FAILED" || status === "REJECTED" ? "destructive" : "secondary";
  return <Badge variant={variant}>{labels[status] ?? status}</Badge>;
}
